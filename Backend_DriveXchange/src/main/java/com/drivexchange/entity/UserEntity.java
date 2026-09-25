package com.drivexchange.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "user_info")
public class UserEntity {
	
	@Id
	@GeneratedValue(strategy = GenerationType.UUID)
	private UUID id;
	
	@NotBlank(message = "Name is required")
	private String name;
	
	@NotBlank(message = "Email is required")
	@Email
	private String email;
	
	@NotBlank(message = "Password is required")
	private String password;
	
	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
	@Column(name = "role")
	private Set<String> role;
	
	
	private LocalDateTime createdAt;
	public UUID getId() {
		return id;
	}
	public void setId(UUID id) {
		this.id = id;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public Set<String> getRole() {
		return role;
	}
	public void setRole(Set<String> role) {
		this.role = role;
	}
	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
	
	
	@Override
	public String toString() {
		return "UserEntity [id=" + id + ", name=" + name + ", email=" + email + ", password=" + password + ", role="
				+ role + ", createdAt=" + createdAt + "]";
	}
	@PrePersist
	protected void onCreate() {
	    this.createdAt = LocalDateTime.now();
	}
}
