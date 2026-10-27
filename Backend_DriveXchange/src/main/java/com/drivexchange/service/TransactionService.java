package com.drivexchange.service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.drivexchange.config.BookingProperties;
import com.drivexchange.dto.PaymentDtos.ContactInfo;
import com.drivexchange.dto.PaymentDtos.CreateOrderResponse;
import com.drivexchange.dto.PaymentDtos.PaymentItem;
import com.drivexchange.dto.PaymentDtos.QuoteResponse;
import com.drivexchange.dto.PaymentDtos.TransactionDetail;
import com.drivexchange.dto.PaymentDtos.TransactionSummary;
import com.drivexchange.entity.CarEntity;
import com.drivexchange.entity.PaymentEntity;
import com.drivexchange.entity.TransactionEntity;
import com.drivexchange.entity.TransactionStatus;
import com.drivexchange.entity.UserEntity;
import com.drivexchange.repo.CarRepository;
import com.drivexchange.repo.PaymentRepository;
import com.drivexchange.repo.TransactionRepository;
import com.drivexchange.repo.UserRepository;

/**
 * Creating, cancelling, expiring and reading deals.
 *
 * THE GOLDEN RULE of this class: whenever we change a car's reservation we first lock the CAR row
 * (findByIdForUpdate). Every other code path (verify, webhook, cancel, expiry) does the same, always
 * in the same order "car first, then transaction". One order = no deadlocks, and two requests for
 * the same car can never run through the critical part at the same time.
 */
@Service
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);

    static final String AVAILABLE = "Available";
    static final String RESERVED = "Reserved";

    /** statuses in which the money is with us and the car belongs to this buyer */
    static final Set<TransactionStatus> PAID_STATES = EnumSet.of(
            TransactionStatus.PAID_HELD, TransactionStatus.DELIVERED,
            TransactionStatus.RELEASED, TransactionStatus.DISPUTED);

    /** what the seller is allowed to see (never the unpaid / abandoned attempts of buyers) */
    private static final Set<TransactionStatus> SELLER_VISIBLE = EnumSet.of(
            TransactionStatus.PAID_HELD, TransactionStatus.DELIVERED, TransactionStatus.RELEASED,
            TransactionStatus.DISPUTED, TransactionStatus.REFUNDED);

    private final TransactionRepository transactionRepository;
    private final PaymentRepository paymentRepository;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final PaymentGatewayService gateway;
    private final BookingProperties booking;

    public TransactionService(TransactionRepository transactionRepository, PaymentRepository paymentRepository,
                              CarRepository carRepository, UserRepository userRepository,
                              PaymentGatewayService gateway, BookingProperties booking) {
        this.transactionRepository = transactionRepository;
        this.paymentRepository = paymentRepository;
        this.carRepository = carRepository;
        this.userRepository = userRepository;
        this.gateway = gateway;
        this.booking = booking;
    }

    // ============================================================================================
    // money rules (all in paise)
    // ============================================================================================

    /** booking = price x percent, but never below min and never above max (and never above the price itself). */
    long bookingAmountPaise(long carPricePaise) {
        long raw = Math.round(carPricePaise * booking.percent() / 100.0);
        long min = booking.minRupees() * 100L;
        long max = booking.maxRupees() * 100L;
        return Math.min(carPricePaise, Math.max(min, Math.min(max, raw)));
    }

    /** our share. Cannot be more than what the buyer pays now. */
    long platformFeePaise(long carPricePaise, long bookingPaise) {
        long fee = Math.round(carPricePaise * booking.platformFeePercent() / 100.0);
        return Math.min(fee, bookingPaise);
    }

    // ============================================================================================
    // 1. quote  (read only, nothing is reserved)
    // ============================================================================================

    @Transactional(readOnly = true)
    public QuoteResponse quote(UUID carId) {
        CarEntity car = carRepository.findById(carId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found"));
        if (car.getApprovalStatus() != com.drivexchange.entity.ApprovalStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found");
        }
        long price = car.getPrice() * 100L;
        return new QuoteResponse(car.getId(), titleOf(car), AVAILABLE.equalsIgnoreCase(car.getStatus()), price,
                bookingAmountPaise(price), booking.expiryMinutes());
    }

    // ============================================================================================
    // 2. create order  (reserve the car + create the Razorpay order)
    // ============================================================================================

    @Transactional
    public CreateOrderResponse createOrder(String buyerEmail, UUID carId) {
        UserEntity buyer = currentUser(buyerEmail);

        // LOCK the car. A second buyer clicking at the same millisecond waits here, then sees "Reserved".
        CarEntity car = carRepository.findByIdForUpdate(carId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found"));
        if (car.getApprovalStatus() != com.drivexchange.entity.ApprovalStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found");
        }

        if (car.getUser().getId().equals(buyer.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can't book your own car");
        }

        Instant now = Instant.now();

        // sweep expired holds on THIS car first, so a stale hold never blocks a real buyer
        expireStaleHolds(car, now);

        // the buyer double-clicked / reopened the page: hand back the SAME order instead of making another
        TransactionEntity existing = transactionRepository
                .findFirstByCar_IdAndBuyer_IdAndStatusAndExpiresAtAfter(carId, buyer.getId(), TransactionStatus.CREATED, now)
                .orElse(null);
        if (existing != null) {
            return toOrderResponse(existing, buyer);
        }

        if (!AVAILABLE.equalsIgnoreCase(car.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Sorry, this car was just booked by someone else or is no longer available.");
        }

        long price = car.getPrice() * 100L;
        long booking = bookingAmountPaise(price);

        TransactionEntity txn = new TransactionEntity();
        txn.setCar(car);
        txn.setBuyer(buyer);
        txn.setSeller(car.getUser());
        txn.setCarTitle(titleOf(car));
        txn.setCarPricePaise(price);
        txn.setAmountPaise(booking);
        txn.setPlatformFeePaise(platformFeePaise(price, booking));
        txn.setStatus(TransactionStatus.CREATED);
        txn.setExpiresAt(now.plus(Duration.ofMinutes(this.booking.expiryMinutes())));
        txn = transactionRepository.saveAndFlush(txn); // flush -> the UUID exists now

        // receipt = OUR reference on the Razorpay order. Max 40 chars: "txn_" + 32 hex = 36
        String receipt = "txn_" + txn.getId().toString().replace("-", "");
        // If this call fails, the exception rolls EVERYTHING back (no half-reserved car).
        String orderId = gateway.createOrder(booking, receipt, txn.getId().toString(), car.getId().toString());
        txn.setRazorpayOrderId(orderId);

        car.setStatus(RESERVED);
        carRepository.save(car);
        transactionRepository.save(txn);

        log.info("Order created txn={} car={} buyer={} amountPaise={}", txn.getId(), carId, buyer.getId(), booking);
        return toOrderResponse(txn, buyer);
    }

    // ============================================================================================
    // 3. cancel (buyer closes the payment window before paying)
    // ============================================================================================

    @Transactional
    public void cancel(String buyerEmail, UUID transactionId) {
        UserEntity buyer = currentUser(buyerEmail);
        UUID carId = transactionRepository.findCarIdById(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        CarEntity car = carRepository.findByIdForUpdate(carId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found"));
        TransactionEntity txn = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!txn.getBuyer().getId().equals(buyer.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"); // don't reveal it exists
        }
        if (txn.getStatus() == TransactionStatus.CANCELLED || txn.getStatus() == TransactionStatus.EXPIRED) {
            return; // already closed: cancelling twice is fine (idempotent)
        }
        if (txn.getStatus() != TransactionStatus.CREATED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This order is already paid and can't be cancelled here.");
        }

        txn.setStatus(TransactionStatus.CANCELLED);
        transactionRepository.save(txn);
        releaseCarIfFree(car);
    }

    // ============================================================================================
    // 4. expiry (called by the scheduler, one transaction per order)
    // ============================================================================================

    @Transactional
    public void expireOne(UUID transactionId) {
        UUID carId = transactionRepository.findCarIdById(transactionId).orElse(null);
        if (carId == null) {
            return;
        }
        CarEntity car = carRepository.findByIdForUpdate(carId).orElse(null);
        TransactionEntity txn = transactionRepository.findById(transactionId).orElse(null);
        if (car == null || txn == null) {
            return;
        }
        // re-check AFTER the lock: the buyer may have paid a millisecond ago
        if (txn.getStatus() != TransactionStatus.CREATED || txn.getExpiresAt().isAfter(Instant.now())) {
            return;
        }
        txn.setStatus(TransactionStatus.EXPIRED);
        transactionRepository.save(txn);
        releaseCarIfFree(car);
        log.info("Order {} expired, car {} released", transactionId, carId);
    }

    /** Called with the car ALREADY locked. */
    private void expireStaleHolds(CarEntity car, Instant now) {
        List<TransactionEntity> stale = transactionRepository
                .findByCar_IdAndStatusAndExpiresAtBefore(car.getId(), TransactionStatus.CREATED, now);
        if (stale.isEmpty()) {
            return;
        }
        stale.forEach(t -> t.setStatus(TransactionStatus.EXPIRED));
        transactionRepository.saveAll(stale);
        releaseCarIfFree(car);
    }

    /** Car goes back on sale only if nobody has PAID for it. Car must be locked by the caller. */
    void releaseCarIfFree(CarEntity car) {
        boolean paid = transactionRepository.existsByCar_IdAndStatusIn(car.getId(), PAID_STATES);
        if (!paid && RESERVED.equalsIgnoreCase(car.getStatus())) {
            car.setStatus(AVAILABLE);
            carRepository.save(car);
        }
    }

    // ============================================================================================
    // 5. reading (My orders / order details)
    // ============================================================================================

    @Transactional(readOnly = true)
    public List<TransactionSummary> myTransactions(String email) {
        UserEntity me = currentUser(email);
        List<TransactionSummary> out = new ArrayList<>();
        transactionRepository.findBoughtBy(me.getId()).forEach(t -> out.add(toSummary(t, "BUYER")));
        transactionRepository.findSoldBy(me.getId(), SELLER_VISIBLE).forEach(t -> out.add(toSummary(t, "SELLER")));
        out.sort((a, b) -> b.createdAt().compareTo(a.createdAt()));
        return out;
    }

    @Transactional(readOnly = true)
    public TransactionDetail details(String email, UUID transactionId) {
        UserEntity me = currentUser(email);
        TransactionEntity t = transactionRepository.findDetailById(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        boolean isBuyer = t.getBuyer().getId().equals(me.getId());
        boolean isSeller = t.getSeller().getId().equals(me.getId());
        // strangers - and sellers looking at an unpaid attempt - get the same 404: nothing leaks
        if (!(isBuyer || (isSeller && SELLER_VISIBLE.contains(t.getStatus())))) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }

        // CONTACT RULE: the other side's phone/e-mail appear only once the booking is paid
        ContactInfo contact = null;
        if (PAID_STATES.contains(t.getStatus())) {
            UserEntity other = isBuyer ? t.getSeller() : t.getBuyer();
            contact = new ContactInfo(other.getName(), other.getEmail(), other.getMobile());
        }

        List<PaymentItem> payments = paymentRepository.findByTransaction_IdOrderByCreatedAtDesc(t.getId()).stream()
                .map(this::toPaymentItem).toList();

        return new TransactionDetail(t.getId(), isBuyer ? "BUYER" : "SELLER", t.getStatus().name(),
                t.getCar().getId(), t.getCarTitle(), firstPhoto(t.getCar()), t.getCarPricePaise(), t.getAmountPaise(),
                t.getPlatformFeePaise(), Math.max(0, t.getCarPricePaise() - t.getAmountPaise()),
                t.getRazorpayOrderId(), t.getExpiresAt(), t.getPaidAt(), t.getCreatedAt(), contact, payments);
    }

    // ============================================================================================
    // helpers
    // ============================================================================================

    private UserEntity currentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    static String titleOf(CarEntity car) {
        String t = (car.getBrand() + " " + car.getModel() + " " + car.getManufactured_year()).trim();
        return t.length() > 255 ? t.substring(0, 255) : t;
    }

    private static String firstPhoto(CarEntity car) {
        List<String> photos = car.getPhotUrls();
        return photos == null || photos.isEmpty() ? null : photos.get(0);
    }

    private CreateOrderResponse toOrderResponse(TransactionEntity t, UserEntity buyer) {
        return new CreateOrderResponse(t.getId(), t.getRazorpayOrderId(), gateway.keyId(), t.getAmountPaise(), "INR",
                t.getCarTitle(), t.getExpiresAt(), buyer.getName(), buyer.getEmail(), buyer.getMobile());
    }

    private TransactionSummary toSummary(TransactionEntity t, String role) {
        UserEntity other = "BUYER".equals(role) ? t.getSeller() : t.getBuyer();
        // names only. Phone / e-mail live in details() behind the paid check.
        return new TransactionSummary(t.getId(), role, t.getStatus().name(), t.getCar().getId(), t.getCarTitle(),
                firstPhoto(t.getCar()), t.getCarPricePaise(), t.getAmountPaise(), other.getName(), t.getExpiresAt(),
                t.getPaidAt(), t.getCreatedAt());
    }

    private PaymentItem toPaymentItem(PaymentEntity p) {
        return new PaymentItem(p.getRazorpayPaymentId(), p.getAmountPaise(), p.getMethod(), p.getStatus().name(),
                p.getFailureReason(), p.getCreatedAt());
    }
}
