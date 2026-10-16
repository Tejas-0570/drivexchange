package com.drivexchange.exceptions;

public class CarNotFoundException extends RuntimeException{
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public CarNotFoundException(String msg) {
		super(msg);
	}
}
