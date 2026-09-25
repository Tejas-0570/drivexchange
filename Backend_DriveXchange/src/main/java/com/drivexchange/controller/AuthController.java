package com.drivexchange.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.drivexchange.dao.ApiErrorResponse;
import com.drivexchange.dao.MessageResponse;
import com.drivexchange.dto.LoginRequest;
import com.drivexchange.dto.RegisterRequest;
import com.drivexchange.exceptions.UserAlreadyExistsException;
import com.drivexchange.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
	
	private UserService userService;
	public AuthController(UserService userService) {
		this.userService = userService;
	}
	
	@PostMapping("/register")
	public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request){
		
		try {
			userService.register(request);
			return new ResponseEntity<>(new MessageResponse("User Registered Successfully"), HttpStatus.CREATED);
		} catch (UserAlreadyExistsException e) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiErrorResponse(e.getMessage()));
		}
		
	}
	
	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest request){
		return null;
	}
}
