package com.drivexchange.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record RegisterRequest(
		@NotNull
		String name,
		
		@NotNull
		@Email
		String email,
		
		@NotNull
		String password
) {}
