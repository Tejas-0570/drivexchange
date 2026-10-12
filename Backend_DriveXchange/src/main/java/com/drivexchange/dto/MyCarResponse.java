package com.drivexchange.dto;

import java.util.UUID;

import com.drivexchange.entity.CarEntity;

public record MyCarResponse(
        UUID carId, String brand, String model, Integer manufacturedYear,
        String color, Integer mileage, String fuelType, String transmissionType,
        Integer price, String status, String titleHeader, String description, String vin) {

    public static MyCarResponse from(CarEntity c) {
        return new MyCarResponse(
                c.getId(), c.getBrand(), c.getModel(), c.getManufactured_year(),
                c.getColor(), c.getMileage(), c.getFuel_type(), c.getTransmission_type(),
                c.getPrice(), c.getStatus(), c.getTitle_header(), c.getDescription(), c.getVin());
    }
}