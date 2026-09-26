package com.drivexchange.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.drivexchange.dto.CurrentUserProfile;
import com.drivexchange.service.UserService;

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
}
