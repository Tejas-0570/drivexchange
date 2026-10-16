package com.drivexchange.repo;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.drivexchange.entity.FavouriteEntity;

@Repository
public interface FavouriteRepository extends JpaRepository<FavouriteEntity, UUID>{
	
	boolean existsByUser_IdAndCar_Id(UUID userId, UUID carId);
	
	void deleteByUser_IdAndCar_Id(UUID userId, UUID carId);
	
	@Query("select f.car.id from FavouriteEntity f where f.user.id = :userId")
    List<UUID> findCarIdsByUserId(@Param("userId") UUID userId);
	
	@Query("select f from FavouriteEntity f join fetch f.car where f.user.id = :userId order by f.created_at desc")
    List<FavouriteEntity> findAllWithCarByUserId(@Param("userId") UUID userId);
}
