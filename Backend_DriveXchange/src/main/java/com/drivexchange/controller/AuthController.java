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

import com.drivexchange.dto.ApiResponse;
import com.drivexchange.dto.LoginRequest;
import com.drivexchange.dto.LoginResponse;
import com.drivexchange.dto.RegisterRequest;
import com.drivexchange.security.JwtUtil;
import com.drivexchange.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
	
	private final UserService userService;
	private final JwtUtil jwtUtil;
	private final AuthenticationManager authenticationManager;
	
	public AuthController(UserService userService, JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
		this.userService = userService;
		this.jwtUtil = jwtUtil;
		this.authenticationManager = authenticationManager;
	}
	
	@PostMapping("/register")
	public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request){
		
		userService.register(request);
		ApiResponse<Void> response = ApiResponse.success(HttpStatus.CREATED.value(), "User Registered Successfully", null);
		return new ResponseEntity<>(response, HttpStatus.CREATED);
		
	}
	
	@PostMapping("/login")
	public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest request){
		UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(request.email(), request.password());
		
		Authentication authenticationResponse = authenticationManager.authenticate(authToken);
			
		List<String> roleList = authenticationResponse.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
			
		String email = authenticationResponse.getName();
			
		String jwtToken = jwtUtil.generateToken(email, Map.of("roles", roleList));
		
		LoginResponse loginData = new LoginResponse("Bearer", jwtToken);
		
		ApiResponse<LoginResponse> response = ApiResponse.success(HttpStatus.OK.value(), "Login Successfull", loginData);
			
		return ResponseEntity.ok(response);
		
	}
}
