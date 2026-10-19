package com.drivexchange.service;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.drivexchange.config.RazorpayProperties;
import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

/**
 * The ONLY class that talks to Razorpay. Everything else works with plain Java values, so
 * (a) it is easy to test, and (b) if you ever change gateway, you rewrite just this file.
 */
@Service
public class PaymentGatewayService {

    private static final Logger log = LoggerFactory.getLogger(PaymentGatewayService.class);

    private final RazorpayClient client;
    private final RazorpayProperties props;

    public PaymentGatewayService(RazorpayClient client, RazorpayProperties props) {
        this.client = client;
        this.props = props;
    }

    public String keyId() {
        return props.keyId();
    }

    /** Creates the Razorpay Order (the "bill") and returns its id, e.g. order_Pxxxx. */
    public String createOrder(long amountPaise, String receipt, String transactionId, String carId) {
        try {
            JSONObject req = new JSONObject();
            req.put("amount", amountPaise); // paise, integer
            req.put("currency", "INR");
            req.put("receipt", receipt); // OUR reference, max 40 chars
            req.put("payment_capture", 1); // take the money automatically on success
            JSONObject notes = new JSONObject(); // free labels, visible in the Razorpay dashboard
            notes.put("transactionId", transactionId);
            notes.put("carId", carId);
            req.put("notes", notes);

            Order order = client.orders.create(req);
            return order.get("id");
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed", e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Payment service is unavailable right now. Please try again.");
        }
    }

    /** Asks Razorpay directly: what really happened to this payment? (never trust the browser's word). */
    public Payment fetchPayment(String paymentId) {
        try {
            return client.payments.fetch(paymentId);
        } catch (RazorpayException e) {
            log.error("Razorpay payment fetch failed for {}", paymentId, e);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Could not confirm the payment with the bank yet. If money was deducted it will be confirmed automatically.");
        }
    }

    /** Full refund of one payment. Returns true if Razorpay accepted it. */
    public boolean refund(String paymentId, long amountPaise) {
        try {
            JSONObject req = new JSONObject();
            req.put("amount", amountPaise);
            client.payments.refund(paymentId, req);
            return true;
        } catch (RazorpayException e) {
            log.error("Razorpay refund FAILED for payment {} ({} paise) - refund manually", paymentId, amountPaise, e);
            return false;
        }
    }

    /** Checkout signature: HMAC_SHA256(orderId + "|" + paymentId, keySecret). */
    public boolean isValidPaymentSignature(String orderId, String paymentId, String signature) {
        String expected = SignatureUtil.hmacSha256Hex(orderId + "|" + paymentId, props.keySecret());
        return SignatureUtil.safeEquals(expected, signature);
    }

    /** Webhook signature: HMAC_SHA256(exact raw body, webhookSecret). */
    public boolean isValidWebhookSignature(String rawBody, String signature) {
        if (props.webhookSecret() == null || props.webhookSecret().isBlank()) {
            log.error("RAZORPAY_WEBHOOK_SECRET is not configured - rejecting every webhook");
            return false;
        }
        String expected = SignatureUtil.hmacSha256Hex(rawBody, props.webhookSecret());
        return SignatureUtil.safeEquals(expected, signature);
    }

}
