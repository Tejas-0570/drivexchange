package com.drivexchange.dao;

import java.util.List;

import org.springframework.stereotype.Service;

import com.drivexchange.dto.CarBrowseResponse;
import com.drivexchange.dto.MyCarResponse;
import com.drivexchange.entity.CarEntity;
import com.drivexchange.exceptions.CarAlreadyExistsException;
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
		if(carRepository.findByVin(car.getVin()).isPresent()) {
			throw new CarAlreadyExistsException("Car Already Exists with this VIN");
		}
		carRepository.save(car);
	}

	@Override
	public List<MyCarResponse> getCarsByOwnerEmail(String email) {
	    return carRepository.findByUser_Email(email).stream().map(MyCarResponse::from).toList();
	}

	@Override
	public List<CarBrowseResponse> getAllCars() {
		return carRepository.findAll().stream().map(car -> new CarBrowseResponse(
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
				             car.getPhotUrls()
				            
				)).toList();
	}


}
