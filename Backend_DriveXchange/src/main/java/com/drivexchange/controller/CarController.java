package com.drivexchange.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.drivexchange.dto.ApiResponse;
import com.drivexchange.dto.MyCarResponse;
import com.drivexchange.entity.CarEntity;
import com.drivexchange.entity.UserEntity;
import com.drivexchange.service.CarService;
import com.drivexchange.service.UserService;

@RestController
@RequestMapping("/api/v1/cars")
public class CarController {
	
	private CarService carService;
	private UserService userService;
	
	public CarController(CarService carService, UserService userService) {
		this.carService = carService;
		this.userService = userService;
	}
	
	
	@PostMapping("/list-car")
	public ResponseEntity<ApiResponse<Void>> listCar(@RequestBody CarEntity car, @AuthenticationPrincipal UserDetails userDetails){
		String email = userDetails.getUsername();
		
		UserEntity user = userService.getUserEntityByEmail(email);
		
		car.setUser(user);
		
		carService.ListCar(car);
		ApiResponse<Void> response = ApiResponse.success(HttpStatus.CREATED.value(), "Car Listed Successfully", null);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}
	
	@GetMapping("/my-listings")
	public ResponseEntity<ApiResponse<List<MyCarResponse>>> myListings(Authentication authentication) {
	    // the email comes from the verified JWT, never from the request
	    List<MyCarResponse> cars = carService.getCarsByOwnerEmail(authentication.getName());
	    return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Listings fetched successfully", cars));
	}

}
