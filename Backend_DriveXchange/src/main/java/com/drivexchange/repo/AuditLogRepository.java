package com.drivexchange.repo;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.drivexchange.entity.AuditLogEntity;

public interface AuditLogRepository extends JpaRepository<AuditLogEntity, UUID> {

    Page<AuditLogEntity> findByTargetType(String targetType, Pageable pageable);

    List<AuditLogEntity> findByTargetTypeAndTargetIdOrderByCreatedAtDesc(String targetType, UUID targetId);
}
