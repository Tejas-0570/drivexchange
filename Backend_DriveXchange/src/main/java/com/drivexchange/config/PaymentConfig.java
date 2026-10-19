package com.drivexchange.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

/**
 * Creates ONE RazorpayClient for the whole application (your old code created a new one on
 * every request) and switches on the scheduler that releases cars whose payment window ended.
 */
@Configuration
@EnableScheduling
@EnableConfigurationProperties({ RazorpayProperties.class, BookingProperties.class })
public class PaymentConfig {

    @Bean
    public RazorpayClient razorpayClient(RazorpayProperties props) throws RazorpayException {
        if (isBlank(props.keyId()) || isBlank(props.keySecret())) {
            throw new IllegalStateException(
                    "Razorpay keys are missing. Set the RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.");
        }
        return new RazorpayClient(props.keyId(), props.keySecret());
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
