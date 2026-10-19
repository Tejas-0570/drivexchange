package com.drivexchange.controller;

import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.drivexchange.dto.ApiResponse;
import com.drivexchange.dto.PaymentDtos.VerifyPaymentRequest;
import com.drivexchange.entity.TransactionStatus;
import com.drivexchange.service.PaymentGatewayService;
import com.drivexchange.service.PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;
    private final PaymentGatewayService gateway;

    public PaymentController(PaymentService paymentService, PaymentGatewayService gateway) {
        this.paymentService = paymentService;
        this.gateway = gateway;
    }

    // POST /api/v1/payments/verify   (JWT required)
    // POST because it CHANGES data (a GET/@RequestParam would put the signature in URLs and logs).
    // 200 = "I processed it", 400 = bad signature, 404 = not your order.
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Map<String, String>>> verify(@Valid @RequestBody VerifyPaymentRequest request,
                                                                   Authentication authentication) {
        TransactionStatus status = paymentService.verify(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Payment verified",
                Map.of("status", status.name())));
    }

    // POST /api/v1/payments/webhook   (PUBLIC - no JWT - protected by the signature instead)
    //
    // - takes the body as RAW BYTES: the signature is computed over the EXACT bytes Razorpay sent.
    //   If we let Spring turn it into an object and back, one space changes and the signature breaks.
    //   (byte[] is safer than String: no charset guessing, we decode it as UTF-8 ourselves.)
    // - 200  -> "got it, stop retrying". 400 -> signature wrong (a stranger, not Razorpay).
    // - an unexpected exception -> 500 -> Razorpay retries later (that is what we want for a real failure).
    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(@RequestBody byte[] body,
                                          @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {
        String rawBody = new String(body, StandardCharsets.UTF_8);
        if (signature == null || !gateway.isValidWebhookSignature(rawBody, signature)) {
            log.warn("Webhook rejected: bad or missing signature");
            return ResponseEntity.badRequest().body("invalid signature");
        }
        paymentService.handleWebhook(rawBody);
        return ResponseEntity.ok("ok");
    }
}
