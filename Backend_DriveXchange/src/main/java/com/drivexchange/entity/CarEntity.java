package com.drivexchange.entity;

import java.util.List;
import java.util.UUID;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "Car_Listings")
public class CarEntity {
	
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(name = "car_id")
	private UUID id;
	
	// 1. The Core Identity (The absolute essentials)
	@Column(name = "vin", length = 17, nullable = false)
	@NotBlank(message = "vin is required")
	@Pattern(
	        regexp = "^[A-HJ-NPR-Z0-9]{17}$", 
	        message = "The VIN must be exactly 17 alphanumeric characters and cannot contain I, O, or Q"
	    )
	private String vin;
	
	@Column(name = "brand")
	private String brand;
	
	@Column(name = "model")
	private String model;
	
	@Column(name = "manufactured_year")
	private int manufactured_year;
	
	
	// 2. Market & Operational Details
	@Column(name = "price")
	private int price;
	
	@Column(name = "mileage")
	private int mileage;
	
	@Column(name = "status")
	private String status;
	
	// 3. Technical & Mechanical Specifications
	@Column(name = "fuel_type")
	private String fuel_type;
	
	@Column(name = "transmission_type")
	private String transmission_type;
	
	// 4. Aesthetics & Condition Metrics
	@Column(name = "color")
	private String color;
	
	
	// 5. Media & Narrative Content
	@Column(name = "title_header")
	private String title_header;
	
	@Column(name = "description")
	private String description;
	
	@ElementCollection
	@CollectionTable(name = "car_photos", joinColumns = @JoinColumn(name = "car_id"))
	@Column(name = "photo_url")
	private List<String> photUrls;
	
	@ManyToOne
	@JoinColumn(name = "user_id", nullable = false)
	private UserEntity user;

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}

	public String getVin() {
		return vin;
	}

	public void setVin(String vin) {
		this.vin = vin;
	}

	public String getBrand() {
		return brand;
	}

	public void setBrand(String brand) {
		this.brand = brand;
	}

	public String getModel() {
		return model;
	}

	public void setModel(String model) {
		this.model = model;
	}

	public int getManufactured_year() {
		return manufactured_year;
	}

	public void setManufactured_year(int manufactured_year) {
		this.manufactured_year = manufactured_year;
	}

	public int getPrice() {
		return price;
	}

	public void setPrice(int price) {
		this.price = price;
	}

	public int getMileage() {
		return mileage;
	}

	public void setMileage(int mileage) {
		this.mileage = mileage;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getFuel_type() {
		return fuel_type;
	}

	public void setFuel_type(String fuel_type) {
		this.fuel_type = fuel_type;
	}

	public String getTransmission_type() {
		return transmission_type;
	}

	public void setTransmission_type(String transmission_type) {
		this.transmission_type = transmission_type;
	}

	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}

	public String getTitle_header() {
		return title_header;
	}

	public void setTitle_header(String title_header) {
		this.title_header = title_header;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public List<String> getPhotUrls() {
		return photUrls;
	}

	public void setPhotUrls(List<String> photUrls) {
		this.photUrls = photUrls;
	}

	public UserEntity getUser() {
		return user;
	}

	public void setUser(UserEntity user) {
		this.user = user;
	}

	@Override
	public String toString() {
		return "CarEntity [id=" + id + ", vin=" + vin + ", brand=" + brand + ", model=" + model + ", manufactured_year="
				+ manufactured_year + ", price=" + price + ", mileage=" + mileage + ", status=" + status
				+ ", fuel_type=" + fuel_type + ", transmission_type=" + transmission_type + ", color=" + color
				+ ", title_header=" + title_header + ", description=" + description + ", photUrls=" + photUrls
				+ ", user=" + user + "]";
	}



	
	
	
}
