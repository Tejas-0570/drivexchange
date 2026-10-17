package com.drivexchange.dto;

import java.util.List;

public record CarUpdateRequest(
		String brand,
	    String model,
	    int manufactured_year,
	    double price,
	    int mileage,
	    String fuel_type,
	    String transmission_type,
	    String color,
	    String title_header,
	    String description,
	    List<String> photUrls
)
{}
