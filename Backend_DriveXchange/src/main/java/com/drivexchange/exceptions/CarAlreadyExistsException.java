package com.drivexchange.exceptions;

public class CarAlreadyExistsException extends RuntimeException{

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public CarAlreadyExistsException(String msg) {
		super(msg);
	}
}
