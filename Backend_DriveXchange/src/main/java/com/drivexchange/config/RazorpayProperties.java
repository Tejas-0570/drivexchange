package com.drivexchange.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Razorpay credentials, read from application.properties:
 *
 *   razorpay.key-id=${RAZORPAY_KEY_ID}
 *   razorpay.key-secret=${RAZORPAY_KEY_SECRET}
 *   razorpay.webhook-secret=${RAZORPAY_WEBHOOK_SECRET}
 *
 * The ${...} part is an ENVIRONMENT VARIABLE (the ones you add in Eclipse/IntelliJ
 * "Run configuration -> Environment variables"). Secrets never live in the code.
 */
@ConfigurationProperties(prefix = "razorpay")
public record RazorpayProperties(String keyId, String keySecret, String webhookSecret) {
}
