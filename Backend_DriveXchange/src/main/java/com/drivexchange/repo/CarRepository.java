package com.drivexchange.repo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.drivexchange.entity.CarEntity;

import jakarta.persistence.LockModeType;

public interface CarRepository extends JpaRepository<CarEntity, UUID>{
	List<CarEntity> findByUser_Email(String email);
	
	Optional<CarEntity> findByVin(String vin);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from CarEntity c where c.id = :id")
	Optional<CarEntity> findByIdForUpdate(@Param("id") UUID id);
	
}
