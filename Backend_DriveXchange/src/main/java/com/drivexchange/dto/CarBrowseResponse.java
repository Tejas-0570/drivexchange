package com.drivexchange.dto;

import java.util.List;
import java.util.UUID;

import com.drivexchange.entity.CarEntity;

public record CarBrowseResponse(
    UUID id,                     
    String brand,
    String model,
    double price,
    String status,
    int manufactured_year,
    String color,
    int mileage,
    String fuel_type,
    String transmission_type,
    String title_header,
    List<String> photUrls
) 
{
	public static CarBrowseResponse from(CarEntity car) {
        return new CarBrowseResponse(
            car.getId(),
            car.getBrand(),
            car.getModel(),
            car.getPrice(),
            car.getStatus(),
            car.getManufactured_year(),
            car.getColor(),
            car.getMileage(),
            car.getFuel_type(),
            car.getTransmission_type(),
            car.getTitle_header(),
            List.of()
        );
    }

}
