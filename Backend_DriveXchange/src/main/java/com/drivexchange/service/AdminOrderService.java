package com.drivexchange.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.drivexchange.dto.AdminDtos.PageDto;
import com.drivexchange.dto.AdminDtos.Party;
import com.drivexchange.dto.AdminDtos.StatusStep;
import com.drivexchange.dto.AdminDtos.TxnDetail;
import com.drivexchange.dto.AdminDtos.TxnRow;
import com.drivexchange.dto.PaymentDtos.PaymentItem;
import com.drivexchange.entity.CarEntity;
import com.drivexchange.entity.PaymentEntity;
import com.drivexchange.entity.PaymentStatus;
import com.drivexchange.entity.TransactionEntity;
import com.drivexchange.entity.TransactionStatus;
import com.drivexchange.entity.UserEntity;
import com.drivexchange.repo.CarRepository;
import com.drivexchange.repo.PaymentRepository;
import com.drivexchange.repo.TransactionRepository;

/**
 * The money side of the admin console.
 *   PAID_HELD --confirm-delivery--> DELIVERED --release-payout--> RELEASED
 *   PAID_HELD / DISPUTED --refund--> REFUNDED          DISPUTED --release-payout--> RELEASED
 * Same golden rule as TransactionService: lock the CAR row first, then touch the transaction.
 */
@Service
@Transactional
public class AdminOrderService {

    private static final String SOLD = "Sold";

    private final AdminSupport support;
    private final AuditService audit;
    private final TransactionRepository transactionRepository;
    private final PaymentRepository paymentRepository;
    private final CarRepository carRepository;
    private final PaymentGatewayService gateway;

    public AdminOrderService(AdminSupport support, AuditService audit, TransactionRepository transactionRepository,
                             PaymentRepository paymentRepository, CarRepository carRepository,
                             PaymentGatewayService gateway) {
        this.support = support;
        this.audit = audit;
        this.transactionRepository = transactionRepository;
        this.paymentRepository = paymentRepository;
        this.carRepository = carRepository;
        this.gateway = gateway;
    }

    // ---- reading ---------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public PageDto<TxnRow> list(String adminEmail, String status, String search, int page, int size) {
        support.requireAdmin(adminEmail);
        TransactionStatus st = AdminSupport.parse(TransactionStatus.class, status);
        String q = AdminSupport.like(search);
        var pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var result = st == null ? transactionRepository.adminSearch(q, pr)
                : transactionRepository.adminSearchByStatus(st, q, pr);
        return PageDto.of(result.map(t -> new TxnRow(t.getId(), t.getCarTitle(), t.getBuyer().getName(),
                t.getSeller().getName(), t.getAmountPaise(), t.getCarPricePaise(), t.getStatus().name(),
                t.getCreatedAt(), t.getPaidAt())));
    }

    @Transactional(readOnly = true)
    public TxnDetail get(String adminEmail, UUID id) {
        support.requireAdmin(adminEmail);
        TransactionEntity t = transactionRepository.findDetailById(id)
                .orElseThrow(() -> AdminSupport.notFound("Order"));
        List<PaymentItem> payments = paymentRepository.findByTransaction_IdOrderByCreatedAtDesc(id).stream()
                .map(p -> new PaymentItem(p.getRazorpayPaymentId(), p.getAmountPaise(), p.getMethod(),
                        p.getStatus().name(), p.getFailureReason(), p.getCreatedAt()))
                .toList();

        // history built from the timestamps we already keep: no extra table
        List<StatusStep> history = new ArrayList<>();
        history.add(new StatusStep("CREATED", t.getCreatedAt(), null));
        if (t.getPaidAt() != null) history.add(new StatusStep("PAID_HELD", t.getPaidAt(), null));
        if (t.getDeliveredAt() != null) history.add(new StatusStep("DELIVERED", t.getDeliveredAt(), "Admin"));
        if (t.getPayoutReleasedAt() != null) history.add(new StatusStep("RELEASED", t.getPayoutReleasedAt(), "Admin"));
        if (t.getRefundedAt() != null) history.add(new StatusStep("REFUNDED", t.getRefundedAt(), "Admin"));

        return new TxnDetail(t.getId(), t.getStatus().name(), t.getCar().getId(), t.getCarTitle(),
                t.getCarPricePaise(), t.getAmountPaise(), t.getPlatformFeePaise(),
                Math.max(0, t.getCarPricePaise() - t.getAmountPaise()), t.getRazorpayOrderId(), t.getCreatedAt(),
                t.getPaidAt(), t.getDeliveredAt(), t.getPayoutReference(), t.getPayoutReleasedAt(),
                party(t.getBuyer()), party(t.getSeller()), payments, history);
    }

    // ---- actions ---------------------------------------------------------------------------
    public void confirmDelivery(String adminEmail, UUID id) {
        UserEntity admin = support.requireAdmin(adminEmail);
        TransactionEntity t = lockedTxn(id);
        require(t, "Only a paid booking can be marked delivered.", TransactionStatus.PAID_HELD);
        t.setStatus(TransactionStatus.DELIVERED);
        t.setDeliveredAt(Instant.now());
        setCarStatus(t, SOLD);
        transactionRepository.save(t);
        audit.log(admin, "DELIVERY_CONFIRMED", "TRANSACTION", id, null);
    }

    public void releasePayout(String adminEmail, UUID id, String payoutReference) {
        UserEntity admin = support.requireAdmin(adminEmail);
        TransactionEntity t = lockedTxn(id);
        require(t, "Payout can only be released for a delivered or disputed order.",
                TransactionStatus.DELIVERED, TransactionStatus.DISPUTED);
        t.setStatus(TransactionStatus.RELEASED);
        t.setPayoutReference(payoutReference.trim());
        t.setPayoutReleasedAt(Instant.now());
        setCarStatus(t, SOLD);
        transactionRepository.save(t);
        audit.log(admin, "PAYOUT_RELEASED", "TRANSACTION", id, "ref " + payoutReference.trim());
    }

    public void refund(String adminEmail, UUID id, String reason) {
        UserEntity admin = support.requireAdmin(adminEmail);
        TransactionEntity t = lockedTxn(id);
        require(t, "Only a paid or disputed order can be refunded.",
                TransactionStatus.PAID_HELD, TransactionStatus.DISPUTED);

        PaymentEntity captured = paymentRepository.findByTransaction_IdOrderByCreatedAtDesc(id).stream()
                .filter(p -> p.getStatus() == PaymentStatus.CAPTURED).findFirst()
                .orElseThrow(() -> AdminSupport.conflict("No captured payment found for this order."));

        // money first: if Razorpay says no, we stop and nothing changes in our database
        if (!gateway.refund(captured.getRazorpayPaymentId(), captured.getAmountPaise())) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Razorpay could not refund this payment. Try again.");
        }
        captured.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(captured);

        t.setStatus(TransactionStatus.REFUNDED);
        t.setRefundedAt(Instant.now());
        t.setRefundReason(reason);
        setCarStatus(t, TransactionService.AVAILABLE); // the car goes back on sale
        transactionRepository.save(t);
        audit.log(admin, "ORDER_REFUNDED", "TRANSACTION", id, reason);
    }

    // ---- helpers ---------------------------------------------------------------------------
    /** car row locked first, then the transaction (same order everywhere = no deadlocks) */
    private TransactionEntity lockedTxn(UUID id) {
        UUID carId = transactionRepository.findCarIdById(id).orElseThrow(() -> AdminSupport.notFound("Order"));
        carRepository.findByIdForUpdate(carId).orElseThrow(() -> AdminSupport.notFound("Car"));
        return transactionRepository.findDetailById(id).orElseThrow(() -> AdminSupport.notFound("Order"));
    }

    private static void require(TransactionEntity t, String message, TransactionStatus... allowed) {
        for (TransactionStatus s : allowed) {
            if (t.getStatus() == s) return;
        }
        throw AdminSupport.conflict(message);
    }

    private void setCarStatus(TransactionEntity t, String status) {
        CarEntity car = t.getCar();
        car.setStatus(status);
        carRepository.save(car);
    }

    private static Party party(UserEntity u) {
        return new Party(u.getId(), u.getName(), u.getEmail(), u.getMobile());
    }
}
