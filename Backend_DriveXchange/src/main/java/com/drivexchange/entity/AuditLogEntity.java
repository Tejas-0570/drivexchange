package com.drivexchange.entity;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;

/** One row for EVERY admin write action: who, what, on which thing, and why. Never updated, never deleted. */
@Entity
@Table(name = "admin_audit_log", indexes = @Index(name = "idx_audit_target", columnList = "target_type, target_id"))
public class AuditLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "admin_id", nullable = false)
    private UUID adminId;

    @Column(name = "admin_name", nullable = false)
    private String adminName;

    @Column(nullable = false, length = 40)
    private String action;        // e.g. LISTING_APPROVED

    @Column(name = "target_type", nullable = false, length = 20)
    private String targetType;    // LISTING | USER | TRANSACTION

    @Column(name = "target_id", nullable = false)
    private UUID targetId;

    @Column(length = 1000)
    private String reason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public UUID getId() { return id; }
    public UUID getAdminId() { return adminId; }
    public void setAdminId(UUID adminId) { this.adminId = adminId; }
    public String getAdminName() { return adminName; }
    public void setAdminName(String adminName) { this.adminName = adminName; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }
    public UUID getTargetId() { return targetId; }
    public void setTargetId(UUID targetId) { this.targetId = targetId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public Instant getCreatedAt() { return createdAt; }
}
