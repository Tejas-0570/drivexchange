package com.drivexchange.dto;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/** Every request/response of the payment APIs in one file. Records = no boilerplate, no entities leaked. */
public final class PaymentDtos {

    private PaymentDtos() {
    }

    // ---- requests -------------------------------------------------------------------------

    /** The client sends ONLY the car. Amount, buyer, seller: all decided by the server. */
    public record CreateOrderRequest(@NotNull UUID carId) {
    }

    /** The three values Razorpay Checkout hands to the browser after a successful payment. */
    public record VerifyPaymentRequest(
            @NotBlank String razorpayOrderId,
            @NotBlank String razorpayPaymentId,
            @NotBlank String razorpaySignature) {
    }

    // ---- responses ------------------------------------------------------------------------

    /** "How much will I pay?" shown BEFORE the buyer commits. Nothing is reserved yet. */
    public record QuoteResponse(
            UUID carId,
            String carTitle,
            boolean available,
            long carPricePaise,
            long bookingAmountPaise,
            int holdMinutes) {
    }

    /** Everything the browser needs to open Razorpay Checkout. keyId is PUBLIC; the secret never leaves the server. */
    public record CreateOrderResponse(
            UUID transactionId,
            String razorpayOrderId,
            String keyId,
            long amountPaise,
            String currency,
            String carTitle,
            Instant expiresAt,
            String prefillName,
            String prefillEmail,
            String prefillContact) {
    }

    /** Contact of the other party. Filled ONLY after the booking is paid, otherwise null. */
    public record ContactInfo(String name, String email, String mobile) {
    }

    public record PaymentItem(
            String razorpayPaymentId,
            long amountPaise,
            String method,
            String status,
            String failureReason,
            Instant createdAt) {
    }

    /** One row of "My orders". */
    public record TransactionSummary(
            UUID id,
            String role, // BUYER or SELLER (from the point of view of the logged-in user)
            String status,
            UUID carId,
            String carTitle,
            String carImage,
            long carPricePaise,
            long amountPaise,
            String counterpartName,
            Instant expiresAt,
            Instant paidAt,
            Instant createdAt) {
    }

    public record TransactionDetail(
            UUID id,
            String role,
            String status,
            UUID carId,
            String carTitle,
            String carImage,
            long carPricePaise,
            long amountPaise,
            long platformFeePaise,
            long balanceDuePaise, // what is still to be paid directly to the seller (price - booking)
            String razorpayOrderId,
            Instant expiresAt,
            Instant paidAt,
            Instant createdAt,
            ContactInfo counterpart, // null until paid
            List<PaymentItem> payments) {
    }
}
