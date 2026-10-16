package com.drivexchange.service;

import java.util.List;
import java.util.UUID;

import com.drivexchange.dto.CarBrowseResponse;
import com.drivexchange.entity.UserEntity;

public interface FavouriteService {

	public List<CarBrowseResponse> savedCars(String email);
	
	public void add(String email, UUID carId);
	
	public void remove(String email, UUID carId);
	
	public List<UUID> savedCarIds(String email);
	
	public UserEntity currentUser(String email);
}
