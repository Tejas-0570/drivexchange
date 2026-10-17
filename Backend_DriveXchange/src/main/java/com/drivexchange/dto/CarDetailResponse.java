package com.drivexchange.dto;

import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CarDetailResponse(
    UUID id,
    String brand,
    String model,
    double price,
    String status,
    int manufacturedYear,
    String color,
    int mileage,
    String fuelType,
    String transmissionType,
    String titleHeader,
    String description, // Heavy text field loaded only here
    List<String> photoUrls, // Full gallery loaded only here
    String vin,
    @JsonProperty("isOwner")
    boolean isOwner,
    UserPublicResponse seller // Owner details loaded only here so the buyer can make contact
) {}
