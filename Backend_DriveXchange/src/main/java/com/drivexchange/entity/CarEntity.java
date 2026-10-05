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

@Entity
@Table(name = "Car_Listings")
public class CarEntity {
	
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	@Column(name = "car_id")
	private UUID id;
	
	// 1. The Core Identity (The absolute essentials)
	@Column(name = "vin")
	private String VIN;
	
	@Column(name = "brand")
	private String brand;
	
	@Column(name = "model")
	private String model;
	
	@Column(name = "manufactured_year")
	private int manufacturedYear;
	
	
	// 2. Market & Operational Details
	@Column(name = "price")
	private int price;
	
	@Column(name = "mileage")
	private int mileage;
	
	@Column(name = "status")
	private String status;
	
	// 3. Technical & Mechanical Specifications
	@Column(name = "fuel_type")
	private String fuelType;
	
	@Column(name = "transmission_type")
	private String transmissionType;
	
	// 4. Aesthetics & Condition Metrics
	@Column(name = "color")
	private String color;
	
	
	// 5. Media & Narrative Content
	@Column(name = "title_header")
	private String titleHeader;
	
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

	public String getVIN() {
		return VIN;
	}

	public void setVIN(String vIN) {
		VIN = vIN;
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

	public int getManufacturedYear() {
		return manufacturedYear;
	}

	public void setManufacturedYear(int manufacturedYear) {
		this.manufacturedYear = manufacturedYear;
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

	public String getFuelType() {
		return fuelType;
	}

	public void setFuelType(String fuelType) {
		this.fuelType = fuelType;
	}

	public String getTransmissionType() {
		return transmissionType;
	}

	public void setTransmissionType(String transmissionType) {
		this.transmissionType = transmissionType;
	}

	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}

	public String getTitleHeader() {
		return titleHeader;
	}

	public void setTitleHeader(String titleHeader) {
		this.titleHeader = titleHeader;
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
		return "CarEntity [id=" + id + ", VIN=" + VIN + ", brand=" + brand + ", model=" + model + ", manufacturedYear="
				+ manufacturedYear + ", price=" + price + ", mileage=" + mileage + ", status=" + status + ", fuelType="
				+ fuelType + ", transmissionType=" + transmissionType + ", color=" + color + ", titleHeader="
				+ titleHeader + ", description=" + description + ", photUrls=" + photUrls + ", user=" + user + "]";
	}
	
	
}
