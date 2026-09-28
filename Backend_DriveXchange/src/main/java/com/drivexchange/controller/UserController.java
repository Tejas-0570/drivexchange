package com.drivexchange.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.drivexchange.dto.ApiResponse;
import com.drivexchange.dto.CurrentUserProfile;
import com.drivexchange.dto.UpdateUser;
import com.drivexchange.dto.UpdatedUserResponse;
import com.drivexchange.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
	
	private final UserService userService;
	
	public UserController(UserService userService) {
		this.userService = userService;
	}
	
	
	@GetMapping("/me")
	public ResponseEntity<CurrentUserProfile> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails){
		
		String email = userDetails.getUsername();
		
		CurrentUserProfile currentUserProfile = userService.getUserProfileByEmail(email);
		
		return ResponseEntity.ok(currentUserProfile);
	}
	
	
	@PutMapping("/me")
	public ResponseEntity<ApiResponse<UpdatedUserResponse>> updateUser(@AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody UpdateUser user){
		
		String email = userDetails.getUsername();
		
		UpdatedUserResponse updatedResopnse = userService.updateUser(email, user);
		
		ApiResponse<UpdatedUserResponse> response = ApiResponse.success(HttpStatus.OK.value(), "User Updated", updatedResopnse);
		
		return new ResponseEntity<>(response, HttpStatus.OK);
	}
}
