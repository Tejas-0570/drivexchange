package com.drivexchange.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.drivexchange.dto.ApiErrorResponse;
import com.drivexchange.dto.LoginRequest;
import com.drivexchange.dto.LoginResponse;
import com.drivexchange.dto.MessageResponse;
import com.drivexchange.dto.RegisterRequest;
import com.drivexchange.exceptions.UserAlreadyExistsException;
import com.drivexchange.security.JwtUtil;
import com.drivexchange.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
	
	private UserService userService;
	private JwtUtil jwtUtil;
	private AuthenticationManager authenticationManager;
	
	public AuthController(UserService userService, JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
		this.userService = userService;
		this.jwtUtil = jwtUtil;
		this.authenticationManager = authenticationManager;
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
		UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(request.email(), request.password());
		
		try {
			Authentication authenticationResponse = authenticationManager.authenticate(authToken);
			
			List<String> roleList = authenticationResponse.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
			
			String email = authenticationResponse.getName();
			
			String jwtToken = jwtUtil.generateToken(email, Map.of("roles", roleList));
			
			return ResponseEntity.ok(new LoginResponse(jwtToken, "Login Successful"));
		} catch (Exception e) {
			ApiErrorResponse errorBody = new ApiErrorResponse("Invalid email or password");
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorBody);
		}
		
	}
}
