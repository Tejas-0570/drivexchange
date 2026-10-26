package com.drivexchange.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.drivexchange.dto.ApiResponse;
import com.drivexchange.dto.CarBrowseResponse;
import com.drivexchange.dto.CarDetailResponse;
import com.drivexchange.dto.CarUpdateRequest;
import com.drivexchange.dto.MyCarResponse;
import com.drivexchange.entity.CarEntity;
import com.drivexchange.entity.UserEntity;
import com.drivexchange.service.CarPhotoService;
import com.drivexchange.service.CarService;
import com.drivexchange.service.UserService;

@RestController
@RequestMapping("/api/v1/cars")
public class CarController {
	
	private CarService carService;
	private UserService userService;
	private CarPhotoService carPhotoService;
	
	public CarController(CarService carService, UserService userService, CarPhotoService carPhotoService) {
		this.carService = carService;
		this.userService = userService;
		this.carPhotoService = carPhotoService;
	}
	
	/** what we send back after listing: just the new id (the frontend uses it to upload the photos) */
	public record CreatedCar(UUID id) {}
	
	
	@PostMapping("/list-car")
	public ResponseEntity<ApiResponse<CreatedCar>> listCar(@RequestBody CarEntity car, @AuthenticationPrincipal UserDetails userDetails){
		String email = userDetails.getUsername();
				
		UserEntity user = userService.getUserEntityByEmail(email); // Instead of this email --> userDetails.getUsername() to save one variable
		car.setUser(user);
				
		UUID id = carService.ListCar(car);
		ApiResponse<CreatedCar> response = ApiResponse.success(HttpStatus.CREATED.value(), "Car Listed Successfully", new CreatedCar(id));
		return new ResponseEntity<>(response, HttpStatus.CREATED);
	}
	
	/** multipart upload: field name "photos", one or many files */
	@PostMapping(value = "/{id}/photos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<ApiResponse<List<String>>> uploadPhotos(@PathVariable UUID id,
			@RequestParam("photos") List<MultipartFile> photos, Authentication authentication) {
		List<String> urls = carPhotoService.addPhotos(id, authentication.getName(), photos);
		return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Photos uploaded", urls));
	}
	
	@GetMapping("/my-listings")
	public ResponseEntity<ApiResponse<List<MyCarResponse>>> myListings(Authentication authentication) {
	    // the email comes from the verified JWT, never from the request
	    List<MyCarResponse> cars = carService.getCarsByOwnerEmail(authentication.getName());
	    return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Listings fetched successfully", cars));
	}
	
	@GetMapping("/browse-cars")
	public ResponseEntity<ApiResponse<List<CarBrowseResponse>>> browseCar(){
		List<CarBrowseResponse> cars = carService.getAllCars();
		return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Fetched all cars", cars));
	}
	
	
	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<CarDetailResponse>> getCarFromID(@PathVariable  UUID id, @AuthenticationPrincipal UserDetails userDetails){
		String email = userDetails != null ? userDetails.getUsername() : null;
		CarDetailResponse  response = carService.getCarFromId(id, email);
		
		return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Car Details Fetched", response));
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> editCarDetails(@PathVariable UUID id, Authentication authentication, @RequestBody CarUpdateRequest car){
		carService.updateCarDetails(id, car, authentication.getName());
		return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Car updated successfully", null));
	}
	
	
	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteCar(@PathVariable UUID id, Authentication authentication) {
	    carService.deleteCar(id, authentication.getName());
	    return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Car removed successfully", null));
	}

}
