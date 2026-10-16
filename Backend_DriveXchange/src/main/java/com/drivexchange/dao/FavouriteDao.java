package com.drivexchange.dao;

import java.util.List;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.drivexchange.dto.CarBrowseResponse;
import com.drivexchange.entity.CarEntity;
import com.drivexchange.entity.FavouriteEntity;
import com.drivexchange.entity.UserEntity;
import com.drivexchange.exceptions.CarNotFoundException;
import com.drivexchange.exceptions.UserNotFoundException;
import com.drivexchange.repo.CarRepository;
import com.drivexchange.repo.FavouriteRepository;
import com.drivexchange.repo.UserRepository;
import com.drivexchange.service.FavouriteService;


@Service
public class FavouriteDao implements FavouriteService{
	
	private final FavouriteRepository favouriteRepository;
	private final UserRepository userRepository;
	private final CarRepository carRepository;
	
	public FavouriteDao(FavouriteRepository favouriteRepository, UserRepository userRepository, CarRepository carRepository) {
		this.favouriteRepository = favouriteRepository;
		this.userRepository = userRepository;
		this.carRepository = carRepository;
	}

    @Transactional(readOnly = true)
    @Override
    public List<CarBrowseResponse> savedCars(String email) {
        return favouriteRepository.findAllWithCarByUserId(currentUser(email).getId())
                .stream()
                .map(f -> toResponse(f.getCar()))
                .toList();
    }
    
	 private CarBrowseResponse toResponse(CarEntity car) {
		    return CarBrowseResponse.from(car);
		 }

	@Override
	@Transactional
	public void add(String email, UUID carId) {
		
		UserEntity user = currentUser(email);
		if (favouriteRepository.existsByUser_IdAndCar_Id(user.getId(), carId)) {
            return; // already saved
        }
		
		CarEntity car = carRepository.findById(carId).orElseThrow(() -> new CarNotFoundException("Car Not Found"));
		
		FavouriteEntity favourite = new FavouriteEntity();
		favourite.setUser(user);
		favourite.setCar(car);
		
		try {
            favouriteRepository.save(favourite);
        } catch (DataIntegrityViolationException ignored) {
            // two requests arrived at the same moment; the unique key stopped the duplicate
        }
	}

	@Override
	@Transactional
	public void remove(String email, UUID carId) {
		favouriteRepository.deleteByUser_IdAndCar_Id(currentUser(email).getId(), carId);
	}

	@Override
	@Transactional(readOnly = true)
	public List<UUID> savedCarIds(String email) {
		return favouriteRepository.findCarIdsByUserId(currentUser(email).getId());
	}

	@Override
	public UserEntity currentUser(String email) {
		return userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("User not found"));	
	}
	


}
