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
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

/**
 * One deal between a buyer and a seller for one car.
 *
 * Money is stored in PAISE (1 rupee = 100 paise) as a long, exactly like Razorpay does.
 * That avoids every rounding bug of decimals.
 */
@Entity
@Table(name = "transactions", indexes = {
        @Index(name = "idx_txn_buyer", columnList = "buyer_id"),
        @Index(name = "idx_txn_seller", columnList = "seller_id"),
        @Index(name = "idx_txn_car", columnList = "car_id"),
        @Index(name = "idx_txn_status_expiry", columnList = "status, expires_at")
})
public class TransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // MANY transactions can point to one car (expired / failed / later sales) and to one user,
    // so these are @ManyToOne. (@OneToOne would allow a user to have only ONE transaction ever.)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "car_id", nullable = false)
    private CarEntity car;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "buyer_id", nullable = false)
    private UserEntity buyer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id", nullable = false)
    private UserEntity seller;

    // snapshot: what the car was called / cost when it was booked (the listing may change later)
    @Column(name = "car_title", length = 255)
    private String carTitle;

    @Column(name = "car_price_paise", nullable = false)
    private long carPricePaise;

    // what the buyer pays online now
    @Column(name = "amount_paise", nullable = false)
    private long amountPaise;

    // the part of the booking amount Drivexchange keeps when the deal completes
    @Column(name = "platform_fee_paise", nullable = false)
    private long platformFeePaise;

    // stored as text ("PAID_HELD"), never as a number: reordering the enum can't corrupt data
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionStatus status = TransactionStatus.CREATED;

    @Column(name = "razorpay_order_id", unique = true, length = 64)
    private String razorpayOrderId;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "paid_at")
    private Instant paidAt;

    // ---- admin phase: delivery, payout, refund -------------------------------------------
    @Column(name = "delivered_at")
    private Instant deliveredAt;

    @Column(name = "payout_reference", length = 100)
    private String payoutReference;      // bank UTR / UPI ref the admin typed when paying the seller

    @Column(name = "payout_released_at")
    private Instant payoutReleasedAt;

    @Column(name = "refunded_at")
    private Instant refundedAt;

    @Column(name = "refund_reason", length = 1000)
    private String refundReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // safety net: if two requests ever change the same row at once, the second one fails instead of overwriting
    @Version
    private long version;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public CarEntity getCar() { return car; }
    public void setCar(CarEntity car) { this.car = car; }

    public UserEntity getBuyer() { return buyer; }
    public void setBuyer(UserEntity buyer) { this.buyer = buyer; }

    public UserEntity getSeller() { return seller; }
    public void setSeller(UserEntity seller) { this.seller = seller; }

    public String getCarTitle() { return carTitle; }
    public void setCarTitle(String carTitle) { this.carTitle = carTitle; }

    public long getCarPricePaise() { return carPricePaise; }
    public void setCarPricePaise(long carPricePaise) { this.carPricePaise = carPricePaise; }

    public long getAmountPaise() { return amountPaise; }
    public void setAmountPaise(long amountPaise) { this.amountPaise = amountPaise; }

    public long getPlatformFeePaise() { return platformFeePaise; }
    public void setPlatformFeePaise(long platformFeePaise) { this.platformFeePaise = platformFeePaise; }

    public TransactionStatus getStatus() { return status; }
    public void setStatus(TransactionStatus status) { this.status = status; }

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public Instant getPaidAt() { return paidAt; }
    public void setPaidAt(Instant paidAt) { this.paidAt = paidAt; }

    public Instant getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(Instant v) { this.deliveredAt = v; }
    public String getPayoutReference() { return payoutReference; }
    public void setPayoutReference(String v) { this.payoutReference = v; }
    public Instant getPayoutReleasedAt() { return payoutReleasedAt; }
    public void setPayoutReleasedAt(Instant v) { this.payoutReleasedAt = v; }
    public Instant getRefundedAt() { return refundedAt; }
    public void setRefundedAt(Instant v) { this.refundedAt = v; }
    public String getRefundReason() { return refundReason; }
    public void setRefundReason(String v) { this.refundReason = v; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public long getVersion() { return version; }

    // no car/buyer/seller here on purpose: printing them would drag whole entities (and lazy loads) into logs
    @Override
    public String toString() {
        return "TransactionEntity [id=" + id + ", status=" + status + ", amountPaise=" + amountPaise
                + ", razorpayOrderId=" + razorpayOrderId + ", expiresAt=" + expiresAt + "]";
    }
}
