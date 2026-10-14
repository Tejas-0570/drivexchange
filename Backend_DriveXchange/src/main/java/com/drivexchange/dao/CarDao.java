package com.drivexchange.dao;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.drivexchange.dto.CarBrowseResponse;
import com.drivexchange.dto.CarDetailResponse;
import com.drivexchange.dto.MyCarResponse;
import com.drivexchange.dto.UserPublicResponse;
import com.drivexchange.entity.CarEntity;
import com.drivexchange.exceptions.CarAlreadyExistsException;
import com.drivexchange.exceptions.ResourceNotFoundException;
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

	@Override
	public CarDetailResponse getCarFromId(UUID id) {
		CarEntity car = carRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Car Not found"));
		return new CarDetailResponse(
		        car.getId(),
		        car.getBrand(),
		        car.getModel(),
		        car.getPrice(),
		        car.getStatus(),
		        car.getManufactured_year(), // Using the exact field names from your CarEntity
		        car.getColor(),
		        car.getMileage(),
		        car.getFuel_type(),
		        car.getTransmission_type(),
		        car.getTitle_header(),
		        car.getDescription(),       // Full paragraph details included here
		        car.getPhotUrls(),          // Full gallery list included here
		        car.getVin(),               // Sensitive VIN details included here
		        // Map the safe user public details
		        car.getUser() != null ? new UserPublicResponse(
		            car.getUser().getCreatedAt().toString(),
		            car.getUser().getEmail(),
		            car.getUser().getMobile(),
		            car.getUser().getName(),
		            car.getUser().getRole()
		        ) : null
		    );
	}



}
