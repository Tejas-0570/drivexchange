package com.drivexchange.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.drivexchange.dto.AdminDtos.HistoryItem;
import com.drivexchange.dto.AdminDtos.ListingDetail;
import com.drivexchange.dto.AdminDtos.ListingRow;
import com.drivexchange.dto.AdminDtos.PageDto;
import com.drivexchange.dto.AdminDtos.SellerInfo;
import com.drivexchange.entity.ApprovalStatus;
import com.drivexchange.entity.CarEntity;
import com.drivexchange.entity.UserEntity;
import com.drivexchange.repo.CarRepository;
import com.drivexchange.repo.TransactionRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class AdminListingService {

    private final AdminSupport support;
    private final AuditService audit;
    private final CarRepository carRepository;
    private final TransactionRepository transactionRepository;

    public AdminListingService(AdminSupport support, AuditService audit, CarRepository carRepository,
                               TransactionRepository transactionRepository) {
        this.support = support;
        this.audit = audit;
        this.carRepository = carRepository;
        this.transactionRepository = transactionRepository;
    }

    // ---- reading ---------------------------------------------------------------------------
    @Transactional(readOnly = true)
    public PageDto<ListingRow> list(String adminEmail, String approval, String search, int page, int size) {
        support.requireAdmin(adminEmail);
        ApprovalStatus a = approval == null || approval.isBlank() ? ApprovalStatus.PENDING
                : AdminSupport.parse(ApprovalStatus.class, approval);
        var pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "submittedAt"));
        return PageDto.of(carRepository.adminSearch(a, AdminSupport.like(search), pr).map(this::toRow));
    }

    @Transactional(readOnly = true)
    public ListingDetail get(String adminEmail, UUID id) {
        support.requireAdmin(adminEmail);
        CarEntity c = carRepository.findById(id).orElseThrow(() -> AdminSupport.notFound("Listing"));
        UserEntity s = c.getUser();
        List<HistoryItem> history = audit.historyOf("LISTING", id);
        return new ListingDetail(c.getId(), title(c), c.getBrand(), c.getModel(), c.getManufactured_year(),
                c.getPrice(), c.getMileage(), c.getFuel_type(), c.getTransmission_type(), c.getColor(), c.getVin(),
                c.getDescription(), c.getPhotUrls() == null ? List.of() : List.copyOf(c.getPhotUrls()),
                c.getStatus(), name(c.getApprovalStatus()), c.getRejectionReason(), c.getSubmittedAt(),
                c.getReviewedAt(), c.getReviewedBy(),
                new SellerInfo(s.getId(), s.getName(), s.getEmail(), s.getMobile(), s.getCreatedAt()), history);
    }

    // ---- decisions ---------------------------------------------------------------------------
    public void approve(String adminEmail, UUID id) {
        UserEntity admin = support.requireAdmin(adminEmail);
        CarEntity c = load(id, admin);
        if (c.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw AdminSupport.conflict("Only pending listings can be approved.");
        }
        decide(c, admin, ApprovalStatus.APPROVED, null);
        audit.log(admin, "LISTING_APPROVED", "LISTING", id, null);
    }

    public void reject(String adminEmail, UUID id, String reason) {
        UserEntity admin = support.requireAdmin(adminEmail);
        CarEntity c = load(id, admin);
        if (c.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw AdminSupport.conflict("Only pending listings can be rejected.");
        }
        decide(c, admin, ApprovalStatus.REJECTED, reason);
        audit.log(admin, "LISTING_REJECTED", "LISTING", id, reason);
    }

    /** Remove an already-live listing (scam found later). Not allowed while a buyer has paid for it. */
    public void takedown(String adminEmail, UUID id, String reason) {
        UserEntity admin = support.requireAdmin(adminEmail);
        CarEntity c = load(id, admin);
        if (c.getApprovalStatus() != ApprovalStatus.APPROVED) {
            throw AdminSupport.conflict("Only live listings can be taken down.");
        }
        if (transactionRepository.existsByCar_IdAndStatusIn(id, TransactionService.PAID_STATES)) {
            throw AdminSupport.conflict("A buyer has already paid for this car. Resolve the order first.");
        }
        decide(c, admin, ApprovalStatus.REJECTED, reason);
        audit.log(admin, "LISTING_TAKEN_DOWN", "LISTING", id, reason);
    }

    // ---- helpers ---------------------------------------------------------------------------
    private CarEntity load(UUID id, UserEntity admin) {
        CarEntity c = carRepository.findByIdForUpdate(id).orElseThrow(() -> AdminSupport.notFound("Listing"));
        if (c.getUser().getId().equals(admin.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can't review your own listing.");
        }
        return c;
    }

    private void decide(CarEntity c, UserEntity admin, ApprovalStatus to, String reason) {
        c.setApprovalStatus(to);
        c.setRejectionReason(to == ApprovalStatus.REJECTED ? reason : null);
        c.setReviewedAt(Instant.now());
        c.setReviewedBy(admin.getName());
        carRepository.save(c);
    }

    private ListingRow toRow(CarEntity c) {
        UserEntity s = c.getUser();
        List<String> photos = c.getPhotUrls();
        return new ListingRow(c.getId(), title(c), c.getVin(), s.getName(), s.getEmail(), c.getPrice(),
                c.getSubmittedAt(), name(c.getApprovalStatus()), c.getStatus(),
                photos == null || photos.isEmpty() ? null : photos.get(0));
    }

    private static String name(ApprovalStatus a) {
        return a == null ? null : a.name();
    }

    static String title(CarEntity c) {
        String t = c.getTitle_header();
        return t != null && !t.isBlank() ? t : TransactionService.titleOf(c);
    }
}
