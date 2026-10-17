package com.drivexchange.dao;

import java.util.List;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.drivexchange.dto.CarBrowseResponse;
import com.drivexchange.dto.CarDetailResponse;
import com.drivexchange.dto.CarUpdateRequest;
import com.drivexchange.dto.MyCarResponse;
import com.drivexchange.dto.UserPublicResponse;
import com.drivexchange.entity.CarEntity;
import com.drivexchange.entity.UserEntity;
import com.drivexchange.exceptions.CarAlreadyExistsException;
import com.drivexchange.exceptions.ResourceNotFoundException;
import com.drivexchange.repo.CarRepository;
import com.drivexchange.repo.FavouriteRepository;
import com.drivexchange.service.CarService;

import jakarta.transaction.Transactional;


@Service
public class CarDao implements CarService{
	
	private CarRepository carRepository;
	private FavouriteRepository favouriteRepository;
	
	public CarDao(CarRepository carRepository, FavouriteRepository favouriteRepository) {
		this.carRepository = carRepository;
		this.favouriteRepository = favouriteRepository;
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
	public CarDetailResponse getCarFromId(UUID id, String loggedInEmail) {
	    CarEntity car = carRepository.findById(id)
	            .orElseThrow(() -> new ResourceNotFoundException("Car Not found"));

	    UserEntity owner = car.getUser();
	    boolean isOwner = loggedInEmail != null
	            && owner != null
	            && owner.getEmail().equalsIgnoreCase(loggedInEmail);

	    return new CarDetailResponse(
	            car.getId(), car.getBrand(), car.getModel(), car.getPrice(), car.getStatus(),
	            car.getManufactured_year(), car.getColor(), car.getMileage(),
	            car.getFuel_type(), car.getTransmission_type(), car.getTitle_header(),
	            car.getDescription(), car.getPhotUrls(), car.getVin(),
	            isOwner,                                   // computed, not stored
	            owner != null ? new UserPublicResponse(
	                    owner.getName().trim().split("\\s+")[0],      // first name only
	                    owner.getCreatedAt().toString()) : null
	    );
	}

	@Override
	@Transactional
	public void updateCarDetails(UUID id, CarUpdateRequest req, String email) {
	    CarEntity car = carRepository.findById(id)
	            .orElseThrow(() -> new ResourceNotFoundException("Car Not found"));

	    // Only the owner can edit
	    if (!car.getUser().getEmail().equalsIgnoreCase(email)) {
	        throw new AccessDeniedException("You are not allowed to edit this car");
	    }
	    
	    if (!"Available".equalsIgnoreCase(car.getStatus())) {
	        throw new IllegalStateException("This car can't be edited right now");
	    }

	    // Strings: update only if sent and not blank
	    if (req.brand() != null && !req.brand().isBlank()) car.setBrand(req.brand());
	    if (req.model() != null && !req.model().isBlank()) car.setModel(req.model());
	    if (req.fuel_type() != null && !req.fuel_type().isBlank()) car.setFuel_type(req.fuel_type());
	    if (req.transmission_type() != null && !req.transmission_type().isBlank()) car.setTransmission_type(req.transmission_type());
	    if (req.color() != null && !req.color().isBlank()) car.setColor(req.color());
	    if (req.title_header() != null && !req.title_header().isBlank()) car.setTitle_header(req.title_header());
	    if (req.description() != null) car.setDescription(req.description());

	    // Numbers: primitives default to 0 when missing, so treat 0 as "not sent"
	    if (req.manufactured_year() > 0) car.setManufactured_year(req.manufactured_year());
	    if (req.price() > 0) car.setPrice((int) req.price());
	    if (req.mileage() >= 0) car.setMileage(req.mileage());

	    // Photos
	    if (req.photUrls() != null) {
	        car.getPhotUrls().clear();
	        car.getPhotUrls().addAll(req.photUrls());
	    }

	    carRepository.save(car);
	}

	@Override
	@Transactional
	public void deleteCar(UUID id, String email) {
	    CarEntity car = carRepository.findById(id)
	            .orElseThrow(() -> new ResourceNotFoundException("Car Not found"));

	    // only the owner
	    if (!car.getUser().getEmail().equalsIgnoreCase(email)) {
	        throw new AccessDeniedException("You are not allowed to remove this car");
	    }
	    // not while a buyer has reserved it, and not once it's sold
	    if (!"Available".equalsIgnoreCase(car.getStatus())) {
	        throw new IllegalStateException("This car can't be removed right now");
	    }

	    favouriteRepository.deleteByCar_Id(id);   // remove users' hearts first (foreign key)
	    carRepository.delete(car);                // car_photos rows go with it
	}


}
