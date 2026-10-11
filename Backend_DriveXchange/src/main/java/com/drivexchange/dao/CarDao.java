package com.drivexchange.dao;

import org.springframework.stereotype.Service;

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

}
