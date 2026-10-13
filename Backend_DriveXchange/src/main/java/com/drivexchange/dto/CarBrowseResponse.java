package com.drivexchange.dto;

import java.util.List;
import java.util.UUID;

public record CarBrowseResponse(
    UUID id,                     // 1. car.getId()
    String brand,                // 2. car.getBrand()
    String model,                // 3. car.getModel()
    double price,                // 4. car.getPrice()
    String status,               // 5. car.getStatus()
    int manufactured_year,       // 6. car.getManufactured_year()
    String color,                // 7. car.getColor()
    int mileage,                 // 8. car.getMileage()
    String fuel_type,            // 9. car.getFuel_type()
    String transmission_type,    // 10. car.getTransmission_type()
    String title_header,         // 11. car.getTitle_header()
    List<String> photUrls        // 12. car.getPhotUrls()
) {}
