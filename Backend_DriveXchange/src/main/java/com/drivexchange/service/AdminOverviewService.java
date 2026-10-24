package com.drivexchange.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.drivexchange.dto.AdminDtos.Overview;
import com.drivexchange.entity.ApprovalStatus;
import com.drivexchange.entity.TransactionStatus;
import com.drivexchange.entity.UserStatus;
import com.drivexchange.repo.CarRepository;
import com.drivexchange.repo.TransactionRepository;
import com.drivexchange.repo.UserRepository;

@Service
@Transactional(readOnly = true)
public class AdminOverviewService {

    private final AdminSupport support;
    private final CarRepository carRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public AdminOverviewService(AdminSupport support, CarRepository carRepository, UserRepository userRepository,
                                TransactionRepository transactionRepository) {
        this.support = support;
        this.carRepository = carRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    public Overview get(String adminEmail) {
        support.requireAdmin(adminEmail);
        return new Overview(
                carRepository.countByApprovalStatus(ApprovalStatus.PENDING),
                carRepository.countByApprovalStatus(ApprovalStatus.APPROVED),
                userRepository.count(),
                userRepository.countByStatus(UserStatus.SUSPENDED),
                transactionRepository.countByStatus(TransactionStatus.PAID_HELD),
                transactionRepository.countByStatus(TransactionStatus.DELIVERED),
                transactionRepository.countByStatus(TransactionStatus.DISPUTED),
                transactionRepository.sumAmountByStatusIn(List.of(TransactionStatus.PAID_HELD,
                        TransactionStatus.DELIVERED, TransactionStatus.DISPUTED)));
    }
}
