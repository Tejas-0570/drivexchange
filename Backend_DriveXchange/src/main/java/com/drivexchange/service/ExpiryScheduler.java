package com.drivexchange.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.drivexchange.entity.TransactionStatus;
import com.drivexchange.repo.TransactionRepository;

/**
 * Every minute: unpaid orders whose time is up become EXPIRED and their car goes back on sale.
 * Each order is handled in its OWN transaction (expireOne lives in another bean) so one bad row can't block the rest.
 */
@Component
public class ExpiryScheduler {

    private static final Logger log = LoggerFactory.getLogger(ExpiryScheduler.class);

    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;

    public ExpiryScheduler(TransactionRepository transactionRepository, TransactionService transactionService) {
        this.transactionRepository = transactionRepository;
        this.transactionService = transactionService;
    }

    @Scheduled(fixedDelay = 60_000, initialDelay = 30_000)
    public void releaseExpiredHolds() {
        List<UUID> ids = transactionRepository.findIdsByStatusAndExpiresAtBefore(
                TransactionStatus.CREATED, Instant.now(), PageRequest.of(0, 100));
        for (UUID id : ids) {
            try {
                transactionService.expireOne(id);
            } catch (Exception e) {
                log.error("Could not expire order {}", id, e);
            }
        }
    }
}
