package com.drivexchange.dto;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;

import com.drivexchange.dto.PaymentDtos.PaymentItem;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Every JSON shape of the admin API. Field names = what the admin frontend reads (see ADMIN_API_CONTRACT.md). */
public final class AdminDtos {

    private AdminDtos() {
    }

    // ---- requests ---------------------------------------------------------------------
    public record ReasonRequest(@NotBlank @Size(min = 5, max = 1000) String reason) { }

    public record PayoutRequest(@NotBlank @Size(min = 4, max = 100) String payoutReference) { }

    // ---- generic page -----------------------------------------------------------------
    public record PageDto<T>(List<T> content, int page, int size, long totalElements, int totalPages) {
        public static <T> PageDto<T> of(Page<T> p) {
            return new PageDto<>(p.getContent(), p.getNumber(), p.getSize(), p.getTotalElements(), p.getTotalPages());
        }
    }

    // ---- overview ---------------------------------------------------------------------
    public record Overview(long pendingListings, long activeListings, long totalUsers, long suspendedUsers,
                           long ordersAwaitingDelivery, long payoutsWaiting, long openDisputes, long heldAmountPaise) { }

    // ---- listings ---------------------------------------------------------------------
    public record ListingRow(UUID id, String title, String vin, String sellerName, String sellerEmail, int price,
                             Instant submittedAt, String approvalStatus, String status, String photo) { }

    public record SellerInfo(UUID id, String name, String email, String mobile, LocalDateTime joinedAt) { }

    public record HistoryItem(String action, String reason, String adminName, Instant at) { }

    public record ListingDetail(UUID id, String title, String brand, String model, int year, int price, int mileage,
                                String fuelType, String transmission, String color, String vin, String description,
                                List<String> photos, String status, String approvalStatus, String rejectionReason,
                                Instant submittedAt, Instant reviewedAt, String reviewedBy, SellerInfo seller,
                                List<HistoryItem> history) { }

    // ---- users ------------------------------------------------------------------------
    public record UserRow(UUID id, String name, String email, String mobile, List<String> roles, String status,
                          LocalDateTime joinedAt, long listingsCount, long ordersCount) { }

    public record RecentListing(UUID id, String title, int price, String approvalStatus, String status) { }

    public record RecentOrder(UUID id, String carTitle, String status, long amountPaise, Instant createdAt) { }

    public record UserDetail(UUID id, String name, String email, String mobile, List<String> roles, String status,
                             LocalDateTime joinedAt, long listingsCount, long ordersCount, String suspensionReason,
                             Instant suspendedAt, List<RecentListing> recentListings, List<RecentOrder> recentOrders) { }

    // ---- orders -----------------------------------------------------------------------
    public record TxnRow(UUID id, String carTitle, String buyerName, String sellerName, long amountPaise,
                         long carPricePaise, String status, Instant createdAt, Instant paidAt) { }

    public record Party(UUID id, String name, String email, String mobile) { }

    public record StatusStep(String status, Instant at, String by) { }

    public record TxnDetail(UUID id, String status, UUID carId, String carTitle, long carPricePaise, long amountPaise,
                            long platformFeePaise, long balanceDuePaise, String razorpayOrderId, Instant createdAt,
                            Instant paidAt, Instant deliveredAt, String payoutReference, Instant payoutReleasedAt,
                            Party buyer, Party seller, List<PaymentItem> payments, List<StatusStep> history) { }

    // ---- audit log --------------------------------------------------------------------
    public record AuditRow(UUID id, Instant at, String adminName, String action, String targetType, UUID targetId,
                           String reason) { }
}
