package com.drivexchange.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.drivexchange.dto.ApiResponse;
import com.drivexchange.dto.PaymentDtos.CreateOrderRequest;
import com.drivexchange.dto.PaymentDtos.CreateOrderResponse;
import com.drivexchange.dto.PaymentDtos.QuoteResponse;
import com.drivexchange.dto.PaymentDtos.TransactionDetail;
import com.drivexchange.dto.PaymentDtos.TransactionSummary;
import com.drivexchange.service.TransactionService;

import jakarta.validation.Valid;

/**
 * Buyer/seller-facing APIs. The user ALWAYS comes from the JWT (authentication.getName()),
 * never from the request body or URL.
 */
@RestController
@RequestMapping("/api/v1/transactions")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    // GET /api/v1/transactions/quote/{carId} -> "how much will I pay?" (reserves nothing)
    @GetMapping("/quote/{carId}")
    public ResponseEntity<ApiResponse<QuoteResponse>> quote(@PathVariable UUID carId) {
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Quote calculated", transactionService.quote(carId)));
    }

    // POST /api/v1/transactions  { "carId": "..." } -> reserve the car + create the Razorpay order. 201 = something was created.
    @PostMapping
    public ResponseEntity<ApiResponse<CreateOrderResponse>> create(@Valid @RequestBody CreateOrderRequest request,
                                                                   Authentication authentication) {
        CreateOrderResponse res = transactionService.createOrder(authentication.getName(), request.carId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), "Order created", res));
    }

    // GET /api/v1/transactions/my -> history: what I bought + what I sold (paid ones)
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<TransactionSummary>>> my(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Transactions fetched",
                transactionService.myTransactions(authentication.getName())));
    }

    // GET /api/v1/transactions/{id} -> one deal (buyer, or seller once paid). Anyone else gets 404.
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TransactionDetail>> details(@PathVariable UUID id, Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Transaction fetched",
                transactionService.details(authentication.getName(), id)));
    }

    // DELETE /api/v1/transactions/{id} -> buyer closes the payment window before paying
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> cancel(@PathVariable UUID id, Authentication authentication) {
        transactionService.cancel(authentication.getName(), id);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Order cancelled", null));
    }
}
