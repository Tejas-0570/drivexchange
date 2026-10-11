package com.drivexchange.repo;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.drivexchange.entity.CarEntity;

public interface CarRepository extends JpaRepository<CarEntity, UUID>{

}
