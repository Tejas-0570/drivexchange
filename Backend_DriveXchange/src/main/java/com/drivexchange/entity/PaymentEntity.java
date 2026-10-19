package com.drivexchange.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

/**
 * One attempt to pay for a transaction (a buyer can fail twice and succeed on the third try =
 * three rows). `razorpay_payment_id` is UNIQUE: that single database rule is what makes it
 * impossible to record the same payment twice, even if Razorpay sends a webhook twice.
 */
@Entity
@Table(name = "payments", indexes = {
        @Index(name = "idx_payment_txn", columnList = "transaction_id")
})
public class PaymentEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transaction_id", nullable = false)
    private TransactionEntity transaction;

    @Column(name = "razorpay_order_id", nullable = false, length = 64)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id", nullable = false, unique = true, length = 64)
    private String razorpayPaymentId;

    @Column(name = "amount_paise", nullable = false)
    private long amountPaise;

    // upi, card, netbanking, wallet ...
    @Column(length = 30)
    private String method;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentStatus status;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    // the full JSON Razorpay told us. Priceless when you debug "the customer says he paid".
    @Column(name = "raw_event", columnDefinition = "TEXT")
    private String rawEvent;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        createdAt = Instant.now();
    }

    public UUID getId() { return id; }

    public TransactionEntity getTransaction() { return transaction; }
    public void setTransaction(TransactionEntity transaction) { this.transaction = transaction; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public long getAmountPaise() { return amountPaise; }
    public void setAmountPaise(long amountPaise) { this.amountPaise = amountPaise; }

    public String getMethod() { return method; }
    public void setMethod(String method) { this.method = method; }

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public String getRawEvent() { return rawEvent; }
    public void setRawEvent(String rawEvent) { this.rawEvent = rawEvent; }

    public Instant getCreatedAt() { return createdAt; }

    @Override
    public String toString() {
        return "PaymentEntity [id=" + id + ", razorpayPaymentId=" + razorpayPaymentId + ", amountPaise="
                + amountPaise + ", status=" + status + "]";
    }
}
