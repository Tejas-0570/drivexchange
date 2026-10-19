package com.drivexchange.service;

import java.time.Instant;
import java.util.UUID;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.drivexchange.dto.PaymentDtos.VerifyPaymentRequest;
import com.drivexchange.entity.CarEntity;
import com.drivexchange.entity.PaymentEntity;
import com.drivexchange.entity.PaymentStatus;
import com.drivexchange.entity.TransactionEntity;
import com.drivexchange.entity.TransactionStatus;
import com.drivexchange.repo.CarRepository;
import com.drivexchange.repo.PaymentRepository;
import com.drivexchange.repo.TransactionRepository;
import com.razorpay.Payment;

/**
 * Turns "Razorpay says money arrived" into "the deal is PAID_HELD".
 *
 * Two doors lead here and BOTH call the same private method {@link #settle}:
 *   - verify()  : the buyer's browser, right after paying (fast, but the tab might be closed)
 *   - webhook() : Razorpay's server, always (slower, but it is the one that never forgets)
 * Whoever comes first does the work, the second one finds it done and does nothing (idempotent).
 */
@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentGatewayService gateway;
    private final TransactionRepository transactionRepository;
    private final PaymentRepository paymentRepository;
    private final CarRepository carRepository;

    public PaymentService(PaymentGatewayService gateway, TransactionRepository transactionRepository, PaymentRepository paymentRepository, CarRepository carRepository) {
        this.gateway = gateway;
        this.transactionRepository = transactionRepository;
        this.paymentRepository = paymentRepository;
        this.carRepository = carRepository;
    }

    // ============================================================================================
    // door 1: the browser says "I paid"
    // ============================================================================================

    @Transactional
    public TransactionStatus verify(String buyerEmail, VerifyPaymentRequest req) {
        // lock order: car first, then transaction (same as everywhere else)
        UUID carId = transactionRepository.findCarIdByRazorpayOrderId(req.razorpayOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        CarEntity car = carRepository.findByIdForUpdate(carId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Car not found"));
        TransactionEntity txn = transactionRepository.findByRazorpayOrderId(req.razorpayOrderId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!txn.getBuyer().getEmail().equalsIgnoreCase(buyerEmail)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found");
        }

        // The order id used in the signature is the one from OUR database, never the one the browser claims.
        if (!gateway.isValidPaymentSignature(txn.getRazorpayOrderId(), req.razorpayPaymentId(), req.razorpaySignature())) {
            log.warn("Invalid payment signature for txn {}", txn.getId());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment verification failed");
        }

        // Second opinion: ask Razorpay itself what this payment is (amount, order, status).
        Payment p = gateway.fetchPayment(req.razorpayPaymentId());
        JSONObject json = p.toJson();
        String status = json.optString("status");
        if (!txn.getRazorpayOrderId().equals(json.optString("order_id")) || json.optLong("amount") != txn.getAmountPaise()) {
            log.error("Payment {} does not match txn {}: {}", req.razorpayPaymentId(), txn.getId(), json);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment verification failed");
        }
        if (!"captured".equals(status)) {
            // "authorized" etc.: not money in the bank yet. We answer with the CURRENT status (still CREATED);
            // the webhook finishes the job once it is captured and the frontend keeps polling.
            return txn.getStatus();
        }

        settle(car, txn, req.razorpayPaymentId(), json.optLong("amount"), json.optString("method", null), json.toString());
        return txn.getStatus();
    }

    // ============================================================================================
    // door 2: Razorpay's server calls us
    // ============================================================================================

    /** Returns normally for anything we understand or can safely ignore -> controller answers 200 -> Razorpay stops retrying. */
    @Transactional
    public void handleWebhook(String rawBody) {
        JSONObject root = new JSONObject(rawBody);
        String event = root.optString("event");

        if (!event.equals("payment.captured") && !event.equals("payment.failed")) {
            return; // an event we did not subscribe to: ignore politely
        }

        JSONObject entity = root.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
        String orderId = entity.optString("order_id", null);
        String paymentId = entity.getString("id");

        UUID carId = orderId == null ? null : transactionRepository.findCarIdByRazorpayOrderId(orderId).orElse(null);
        if (carId == null) {
            log.warn("Webhook {} for unknown order {} (payment {}) - ignoring", event, orderId, paymentId);
            return; // not ours (another project on the same Razorpay account?)
        }

        CarEntity car = carRepository.findByIdForUpdate(carId).orElse(null);
        TransactionEntity txn = transactionRepository.findByRazorpayOrderId(orderId).orElse(null);
        if (car == null || txn == null) {
            return;
        }

        if (event.equals("payment.captured")) {
            settle(car, txn, paymentId, entity.optLong("amount"), entity.optString("method", null), entity.toString());
        } else {
            recordFailure(txn, paymentId, entity);
        }
    }

    // ============================================================================================
    // the one place where a captured payment is turned into a booking
    // ============================================================================================

    /** Car AND transaction must already be loaded in this DB transaction, with the car row locked. */
    private void settle(CarEntity car, TransactionEntity txn, String paymentId, long amountPaise, String method, String raw) {

        // 1) seen before? (browser and webhook both arrive) -> nothing to do
        if (paymentRepository.findByRazorpayPaymentId(paymentId).isPresent()) {
            return;
        }

        // 2) the amount must be exactly what WE asked for
        if (amountPaise != txn.getAmountPaise()) {
            log.error("AMOUNT MISMATCH txn={} expected={} got={} payment={}", txn.getId(), txn.getAmountPaise(), amountPaise, paymentId);
            savePayment(txn, paymentId, amountPaise, method, PaymentStatus.CAPTURED, "AMOUNT_MISMATCH - review manually", raw);
            return;
        }

        boolean alreadyBooked = TransactionService.PAID_STATES.contains(txn.getStatus())
                || txn.getStatus() == TransactionStatus.REFUNDED;
        boolean carFree = !transactionRepository.existsByCar_IdAndStatusIn(car.getId(), TransactionService.PAID_STATES)
                && (TransactionService.RESERVED.equalsIgnoreCase(car.getStatus())
                    || TransactionService.AVAILABLE.equalsIgnoreCase(car.getStatus()));

        if (!alreadyBooked && carFree) {
            // 3a) the happy path. Late payments (after the 15 minutes) are accepted too, if the car is still free.
            txn.setStatus(TransactionStatus.PAID_HELD);
            txn.setPaidAt(Instant.now());
            car.setStatus(TransactionService.RESERVED);
            carRepository.save(car);
            transactionRepository.save(txn);
            savePayment(txn, paymentId, amountPaise, method, PaymentStatus.CAPTURED, null, raw);
            log.info("Booking confirmed txn={} payment={}", txn.getId(), paymentId);
        } else {
            // 3b) money arrived but there is nothing to give for it (car gone / this deal already paid with another payment)
            PaymentEntity saved = savePayment(txn, paymentId, amountPaise, method, PaymentStatus.CAPTURED, null, raw);
            if (gateway.refund(paymentId, amountPaise)) {
                saved.setStatus(PaymentStatus.REFUNDED);
                saved.setFailureReason("Auto-refunded: car no longer available / duplicate payment");
            } else {
                saved.setFailureReason("AUTO_REFUND_FAILED - refund manually in the Razorpay dashboard");
            }
            paymentRepository.save(saved);
            if (txn.getStatus() == TransactionStatus.EXPIRED || txn.getStatus() == TransactionStatus.CANCELLED) {
                log.info("Late payment {} refunded, txn {} stays {}", paymentId, txn.getId(), txn.getStatus());
            }
        }
    }

    private void recordFailure(TransactionEntity txn, String paymentId, JSONObject entity) {
        if (paymentRepository.findByRazorpayPaymentId(paymentId).isPresent()) {
            return;
        }
        String reason = entity.optString("error_description", entity.optString("error_reason", "Payment failed"));
        savePayment(txn, paymentId, entity.optLong("amount"), entity.optString("method", null),
                PaymentStatus.FAILED, reason, entity.toString());
        // the transaction stays CREATED: the buyer can retry until the hold expires
    }

    private PaymentEntity savePayment(TransactionEntity txn, String paymentId, long amountPaise, String method,
                                      PaymentStatus status, String reason, String raw) {
        PaymentEntity p = new PaymentEntity();
        p.setTransaction(txn);
        p.setRazorpayOrderId(txn.getRazorpayOrderId());
        p.setRazorpayPaymentId(paymentId);
        p.setAmountPaise(amountPaise);
        p.setMethod(method);
        p.setStatus(status);
        p.setFailureReason(reason);
        p.setRawEvent(raw);
        try {
            return paymentRepository.saveAndFlush(p);
        } catch (DataIntegrityViolationException e) {
            // the UNIQUE(razorpay_payment_id) rule fired: someone saved it a moment ago. Fine.
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Payment already recorded");
        }
    }
}
