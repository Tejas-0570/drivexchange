package com.drivexchange.entity;

/** One row in `payments` = one attempt to pay. */
public enum PaymentStatus {
    CAPTURED, // Razorpay really took the money
    FAILED,   // the attempt failed (wrong OTP, declined card ...). The buyer may try again.
    REFUNDED  // we sent the money back (late payment on a car that is gone, or a duplicate payment)
}
