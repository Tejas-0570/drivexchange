package com.drivexchange.dao;

import java.util.List;

import org.springframework.stereotype.Service;

import com.drivexchange.dto.MyCarResponse;
import com.drivexchange.entity.CarEntity;
import com.drivexchange.repo.CarRepository;
import com.drivexchange.service.CarService;


@Service
public class CarDao implements CarService{
	
	private CarRepository carRepository;
	
	public CarDao(CarRepository carRepository) {
		this.carRepository = carRepository;
	}

	@Override
	public void ListCar(CarEntity car) {
		carRepository.save(car);
	}

	@Override
	public List<MyCarResponse> getCarsByOwnerEmail(String email) {
	    return carRepository.findByUser_Email(email).stream().map(MyCarResponse::from).toList();
	}

}
