package com.drivexchange.repo;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.drivexchange.entity.CarEntity;

public interface CarRepository extends JpaRepository<CarEntity, UUID>{
	List<CarEntity> findByUser_Email(String email);
}
