package com.drivexchange.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Business rules for the booking amount. Change them in application.properties,
 * no code change needed:
 *
 *   drivexchange.booking.percent=2              booking amount = 2% of the car price ...
 *   drivexchange.booking.min-rupees=5000        ... but never less than Rs 5,000
 *   drivexchange.booking.max-rupees=50000       ... and never more than Rs 50,000
 *   drivexchange.booking.platform-fee-percent=1 Drivexchange keeps 1% of the car price from it
 *   drivexchange.booking.expiry-minutes=15      time the buyer has to pay before the car is released
 */
@ConfigurationProperties(prefix = "drivexchange.booking")
public record BookingProperties(
        @DefaultValue("2") double percent,
        @DefaultValue("5000") long minRupees,
        @DefaultValue("50000") long maxRupees,
        @DefaultValue("1") double platformFeePercent,
        @DefaultValue("15") int expiryMinutes) {
}
