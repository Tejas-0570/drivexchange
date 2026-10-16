package com.drivexchange.exceptions;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.drivexchange.dto.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {
	
	// 1. Handle User Already Exist Exception
	@ExceptionHandler(UserAlreadyExistsException.class)
	public ResponseEntity<ApiResponse<Void>> handleUserAlreadyExists(UserAlreadyExistsException e){
		ApiResponse<Void> response = ApiResponse.error(HttpStatus.CONFLICT.value(), e.getMessage());
		return new ResponseEntity<>(response, HttpStatus.CONFLICT);
	}
	
	// 2. Handle Bad Credentials (Login Failure)
	@ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
	public ResponseEntity<ApiResponse<Void>> handleBadCredentials(Exception e){
		ApiResponse<Void> response = ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "Invalid email or password");
		return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
	}
	
	// 3. Handle Bean Validation Errors (@Valid validation triggers)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        
        e.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((org.springframework.validation.FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        // FIX: Explicitly pass the types into the instantiation
        ApiResponse<Map<String, String>> response = new ApiResponse<Map<String, String>>(
            java.time.LocalDateTime.now(),
            HttpStatus.BAD_REQUEST.value(),
            false,
            "Validation Failed",
            errors
        );

        // FIX: Clean execution without inference warnings
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    // 4. Handle Car Already Exist Exception
    @ExceptionHandler(CarAlreadyExistsException.class)
    public ResponseEntity<ApiResponse<Void>> handleCarAlreadyExist(CarAlreadyExistsException e){
    	ApiResponse<Void> response = ApiResponse.error(HttpStatus.CONFLICT.value(), "A car with this VIN is already listed");
    	return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }
    
    // 5. Handle Resource not found Exception
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleResourceNotFound(ResourceNotFoundException e){
    	ApiResponse<Void> response = ApiResponse.error(HttpStatus.NOT_FOUND.value(), "Resource not found");
    	return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }
    
    // 6. Handle User not found exception
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleUserNotFound(UserNotFoundException e){
    	ApiResponse<Void> response = ApiResponse.error(HttpStatus.UNAUTHORIZED.value(), "User Not Found");
    	return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }
    
    // 7. Handle Car not found exception
    @ExceptionHandler(CarNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleCarNotFound(CarNotFoundException e){
    	ApiResponse<Void> response = ApiResponse.error(HttpStatus.NOT_FOUND.value(), "Car not found");
    	return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }
	
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Void>> handleGeneralException(Exception e){
		ApiResponse<Void> response = ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR.value(), "An unexpected error occurred");
		return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
	}

}
