package com.drivexchange.repo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.drivexchange.entity.ApprovalStatus;
import com.drivexchange.entity.CarEntity;
import com.drivexchange.entity.UserStatus;

import jakarta.persistence.LockModeType;

public interface CarRepository extends JpaRepository<CarEntity, UUID>{
	List<CarEntity> findByUser_Email(String email);
	
	Optional<CarEntity> findByVin(String vin);

	@Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from CarEntity c where c.id = :id")
	Optional<CarEntity> findByIdForUpdate(@Param("id") UUID id);

	// ---- admin screens ----------------------------------------------------------------
	@Query("select c from CarEntity c where c.approvalStatus = :approval and ("
			+ "lower(coalesce(c.title_header,'')) like :q or lower(c.vin) like :q "
			+ "or lower(c.user.name) like :q or lower(c.user.email) like :q)")
	Page<CarEntity> adminSearch(@Param("approval") ApprovalStatus approval, @Param("q") String q, Pageable pageable);
	
	// public browse: approved cars whose owner is not suspended
	List<CarEntity> findByApprovalStatusAndUser_Status(ApprovalStatus approval, UserStatus ownerStatus);

	long countByApprovalStatus(ApprovalStatus status);

	long countByUser_Id(UUID userId);

	List<CarEntity> findTop5ByUser_IdOrderBySubmittedAtDesc(UUID userId);
}
