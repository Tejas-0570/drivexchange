package com.drivexchange.service;


import java.util.List;
import java.util.UUID;

import com.drivexchange.dto.CarBrowseResponse;
import com.drivexchange.dto.CarDetailResponse;
import com.drivexchange.dto.MyCarResponse;
import com.drivexchange.entity.CarEntity;

public interface CarService {

	public void ListCar(CarEntity car);
	
	public List<MyCarResponse> getCarsByOwnerEmail(String email);
	
	public List<CarBrowseResponse> getAllCars();
	
	public CarDetailResponse getCarFromId(UUID id);
	
}