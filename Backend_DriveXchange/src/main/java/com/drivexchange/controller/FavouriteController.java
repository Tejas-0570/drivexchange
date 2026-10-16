package com.drivexchange.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.drivexchange.dto.ApiResponse;
import com.drivexchange.dto.CarBrowseResponse;
import com.drivexchange.service.FavouriteService;

@RestController
@RequestMapping("/api/v1/favourites")
public class FavouriteController {
	
	private FavouriteService favouriteService;
	public FavouriteController(FavouriteService favouriteService) {
		this.favouriteService = favouriteService;
	}
	
	
	@GetMapping
	public ResponseEntity<ApiResponse<List<CarBrowseResponse>>> mySavedCars(Authentication authentication){
		List<CarBrowseResponse> cars = favouriteService.savedCars(authentication.getName());
		return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Saved Cars Fetched", cars));
	}
	
	@GetMapping("/ids")
    public ResponseEntity<ApiResponse<List<UUID>>> mySavedCarIds(Authentication authentication) {
        List<UUID> ids = favouriteService.savedCarIds(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Saved car ids fetched", ids));
    }
	
    @PutMapping("/{carId}")
    public ResponseEntity<ApiResponse<Void>> save(@PathVariable UUID carId, Authentication authentication) {
        favouriteService.add(authentication.getName(), carId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Car saved", null));
    }
    
    @DeleteMapping("/{carId}")
    public ResponseEntity<ApiResponse<Void>> unsave(@PathVariable UUID carId, Authentication authentication) {
        favouriteService.remove(authentication.getName(), carId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Car removed from saved", null));
    }

}
