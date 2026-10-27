package com.drivexchange.repo;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.drivexchange.entity.UserEntity;
import com.drivexchange.entity.UserStatus;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID>{
	Optional<UserEntity> findByEmail(String email);

	// ---- admin screens ----------------------------------------------------------------
	@Query("select u from UserEntity u where (lower(u.name) like :q or lower(u.email) like :q) "
			+ "and not exists (select r from UserEntity x join x.role r where x.id = u.id and upper(r) like '%ADMIN%')")
	Page<UserEntity> adminSearch(@Param("q") String q, Pageable pageable);

	@Query("select u from UserEntity u where u.status = :status and (lower(u.name) like :q or lower(u.email) like :q) "
			+ "and not exists (select r from UserEntity x join x.role r where x.id = u.id and upper(r) like '%ADMIN%')")
	Page<UserEntity> adminSearchByStatus(@Param("status") UserStatus status, @Param("q") String q, Pageable pageable);

	@Query("select count(u) from UserEntity u "
			+ "where not exists (select r from UserEntity x join x.role r where x.id = u.id and upper(r) like '%ADMIN%')")
	long countCustomers();

	long countByStatus(UserStatus status);
}
