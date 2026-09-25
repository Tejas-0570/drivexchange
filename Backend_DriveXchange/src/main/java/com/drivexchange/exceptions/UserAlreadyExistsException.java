package com.drivexchange.exceptions;

public class UserAlreadyExistsException extends RuntimeException{
	
	public UserAlreadyExistsException(String msg) {
		super(msg);
	}
}
