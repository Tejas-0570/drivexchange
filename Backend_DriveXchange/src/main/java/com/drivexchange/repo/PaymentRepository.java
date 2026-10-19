package com.drivexchange.repo;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.drivexchange.entity.PaymentEntity;

public interface PaymentRepository extends JpaRepository<PaymentEntity, UUID> {

    Optional<PaymentEntity> findByRazorpayPaymentId(String razorpayPaymentId);

    List<PaymentEntity> findByTransaction_IdOrderByCreatedAtDesc(UUID transactionId);
}
