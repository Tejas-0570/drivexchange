package com.drivexchange.controller;

import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.drivexchange.dto.AdminDtos.*;
import com.drivexchange.dto.ApiResponse;
import com.drivexchange.service.AdminListingService;
import com.drivexchange.service.AdminOrderService;
import com.drivexchange.service.AdminOverviewService;
import com.drivexchange.service.AdminUserService;
import com.drivexchange.service.AuditService;

import jakarta.validation.Valid;

/** All admin endpoints. The real "are you an admin?" check happens inside the services (AdminSupport.requireAdmin). */
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final AdminOverviewService overview;
    private final AdminListingService listings;
    private final AdminUserService users;
    private final AdminOrderService orders;
    private final AuditService audit;

    public AdminController(AdminOverviewService overview, AdminListingService listings, AdminUserService users,
                           AdminOrderService orders, AuditService audit) {
        this.overview = overview;
        this.listings = listings;
        this.users = users;
        this.orders = orders;
        this.audit = audit;
    }

    private static <T> ResponseEntity<ApiResponse<T>> ok(T data) {
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "OK", data));
    }

    private static ResponseEntity<ApiResponse<Void>> done(String message) {
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), message, null));
    }

    private static int size(int size) {
        return Math.min(Math.max(size, 1), 100);
    }

    private static int page(int page) {
        return Math.max(page, 0);
    }

    // ---- overview ------------------------------------------------------------------------
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Overview>> overview(Authentication a) {
        return ok(overview.get(a.getName()));
    }

    // ---- listings ------------------------------------------------------------------------
    @GetMapping("/listings")
    public ResponseEntity<ApiResponse<PageDto<ListingRow>>> listings(
            @RequestParam(required = false) String approval, @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "15") int size, Authentication a) {
        return ok(listings.list(a.getName(), approval, search, page(page), size(size)));
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<ApiResponse<ListingDetail>> listing(@PathVariable UUID id, Authentication a) {
        return ok(listings.get(a.getName(), id));
    }

    @PostMapping("/listings/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approve(@PathVariable UUID id, Authentication a) {
        listings.approve(a.getName(), id);
        return done("Listing approved");
    }

    @PostMapping("/listings/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> reject(@PathVariable UUID id, @Valid @RequestBody ReasonRequest body,
                                                    Authentication a) {
        listings.reject(a.getName(), id, body.reason().trim());
        return done("Listing rejected");
    }

    @PostMapping("/listings/{id}/takedown")
    public ResponseEntity<ApiResponse<Void>> takedown(@PathVariable UUID id, @Valid @RequestBody ReasonRequest body,
                                                      Authentication a) {
        listings.takedown(a.getName(), id, body.reason().trim());
        return done("Listing taken down");
    }

    // ---- users ---------------------------------------------------------------------------
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageDto<UserRow>>> users(
            @RequestParam(required = false) String status, @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "15") int size, Authentication a) {
        return ok(users.list(a.getName(), status, search, page(page), size(size)));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<ApiResponse<UserDetail>> user(@PathVariable UUID id, Authentication a) {
        return ok(users.get(a.getName(), id));
    }

    @PostMapping("/users/{id}/suspend")
    public ResponseEntity<ApiResponse<Void>> suspend(@PathVariable UUID id, @Valid @RequestBody ReasonRequest body,
                                                     Authentication a) {
        users.suspend(a.getName(), id, body.reason().trim());
        return done("User suspended");
    }

    @PostMapping("/users/{id}/reactivate")
    public ResponseEntity<ApiResponse<Void>> reactivate(@PathVariable UUID id, Authentication a) {
        users.reactivate(a.getName(), id);
        return done("User reactivated");
    }

    // ---- orders --------------------------------------------------------------------------
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<PageDto<TxnRow>>> transactions(
            @RequestParam(required = false) String status, @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "15") int size, Authentication a) {
        return ok(orders.list(a.getName(), status, search, page(page), size(size)));
    }

    @GetMapping("/transactions/{id}")
    public ResponseEntity<ApiResponse<TxnDetail>> transaction(@PathVariable UUID id, Authentication a) {
        return ok(orders.get(a.getName(), id));
    }

    @PostMapping("/transactions/{id}/confirm-delivery")
    public ResponseEntity<ApiResponse<Void>> confirmDelivery(@PathVariable UUID id, Authentication a) {
        orders.confirmDelivery(a.getName(), id);
        return done("Delivery confirmed");
    }

    @PostMapping("/transactions/{id}/release-payout")
    public ResponseEntity<ApiResponse<Void>> releasePayout(@PathVariable UUID id,
                                                           @Valid @RequestBody PayoutRequest body, Authentication a) {
        orders.releasePayout(a.getName(), id, body.payoutReference());
        return done("Payout recorded");
    }

    @PostMapping("/transactions/{id}/refund")
    public ResponseEntity<ApiResponse<Void>> refund(@PathVariable UUID id, @Valid @RequestBody ReasonRequest body,
                                                    Authentication a) {
        orders.refund(a.getName(), id, body.reason().trim());
        return done("Order refunded");
    }

    // ---- activity log --------------------------------------------------------------------
    @GetMapping("/audit-log")
    public ResponseEntity<ApiResponse<PageDto<AuditRow>>> auditLog(
            @RequestParam(required = false) String targetType, @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size, Authentication a) {
        // only admins may read the log: reuse any admin check through the overview service
        overview.get(a.getName());
        return ok(audit.list(targetType == null || targetType.isBlank() ? null : targetType.toUpperCase(),
                page(page), size(size)));
    }
}
