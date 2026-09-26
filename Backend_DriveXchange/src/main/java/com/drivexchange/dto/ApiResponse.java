package com.drivexchange.dto;

import java.time.LocalDateTime;

public record ApiResponse<T>(
		LocalDateTime timestamp,
		int status,
		boolean success,
		String message,
		T data
) {
	
	public static<T> ApiResponse<T> success(int status, String message, T data){
		return new ApiResponse<>(LocalDateTime.now(), status, true, message, data);
	}
	
	public static<T> ApiResponse<T> error(int status, String message){
		return new ApiResponse<>(LocalDateTime.now(), status, false, message, null);
	}

}
