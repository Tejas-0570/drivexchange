package com.drivexchange.repo;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.drivexchange.entity.UserEntity;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, UUID>{
	Optional<UserEntity> findByEmail(String email);

}
