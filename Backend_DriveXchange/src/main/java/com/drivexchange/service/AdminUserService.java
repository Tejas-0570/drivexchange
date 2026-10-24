package com.drivexchange.service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.drivexchange.dto.AdminDtos.PageDto;
import com.drivexchange.dto.AdminDtos.RecentListing;
import com.drivexchange.dto.AdminDtos.RecentOrder;
import com.drivexchange.dto.AdminDtos.UserDetail;
import com.drivexchange.dto.AdminDtos.UserRow;
import com.drivexchange.entity.UserEntity;
import com.drivexchange.entity.UserStatus;
import com.drivexchange.repo.CarRepository;
import com.drivexchange.repo.TransactionRepository;
import com.drivexchange.repo.UserRepository;

@Service
@Transactional
public class AdminUserService {

    private final AdminSupport support;
    private final AuditService audit;
    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final TransactionRepository transactionRepository;

    public AdminUserService(AdminSupport support, AuditService audit, UserRepository userRepository,
                            CarRepository carRepository, TransactionRepository transactionRepository) {
        this.support = support;
        this.audit = audit;
        this.userRepository = userRepository;
        this.carRepository = carRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public PageDto<UserRow> list(String adminEmail, String status, String search, int page, int size) {
        support.requireAdmin(adminEmail);
        UserStatus st = AdminSupport.parse(UserStatus.class, status);
        String q = AdminSupport.like(search);
        var pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var result = st == null ? userRepository.adminSearch(q, pr) : userRepository.adminSearchByStatus(st, q, pr);
        return PageDto.of(result.map(this::toRow));
    }

    @Transactional(readOnly = true)
    public UserDetail get(String adminEmail, UUID id) {
        support.requireAdmin(adminEmail);
        UserEntity u = userRepository.findById(id).orElseThrow(() -> AdminSupport.notFound("User"));
        List<RecentListing> listings = carRepository.findTop5ByUser_IdOrderBySubmittedAtDesc(id).stream()
                .map(c -> new RecentListing(c.getId(), AdminListingService.title(c), c.getPrice(),
                        c.getApprovalStatus() == null ? null : c.getApprovalStatus().name(), c.getStatus()))
                .toList();
        List<RecentOrder> orders = transactionRepository.findTop5ByBuyer_IdOrSeller_IdOrderByCreatedAtDesc(id, id)
                .stream().map(t -> new RecentOrder(t.getId(), t.getCarTitle(), t.getStatus().name(),
                        t.getAmountPaise(), t.getCreatedAt()))
                .toList();
        return new UserDetail(u.getId(), u.getName(), u.getEmail(), u.getMobile(), AdminSupport.rolesOf(u),
                statusOf(u), u.getCreatedAt(), carRepository.countByUser_Id(id),
                transactionRepository.countByBuyer_IdOrSeller_Id(id, id), u.getSuspensionReason(),
                u.getSuspendedAt(), listings, orders);
    }

    public void suspend(String adminEmail, UUID id, String reason) {
        UserEntity admin = support.requireAdmin(adminEmail);
        UserEntity u = userRepository.findById(id).orElseThrow(() -> AdminSupport.notFound("User"));
        if (u.getId().equals(admin.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can't suspend yourself.");
        }
        if (AdminSupport.isAdmin(u)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin accounts can't be suspended here.");
        }
        if (u.getStatus() == UserStatus.SUSPENDED) {
            throw AdminSupport.conflict("This user is already suspended.");
        }
        u.setStatus(UserStatus.SUSPENDED);
        u.setSuspensionReason(reason);
        u.setSuspendedAt(Instant.now());
        userRepository.save(u);
        audit.log(admin, "USER_SUSPENDED", "USER", id, reason);
        // Their listings disappear on their own: browse/details queries require owner.status = ACTIVE.
    }

    public void reactivate(String adminEmail, UUID id) {
        UserEntity admin = support.requireAdmin(adminEmail);
        UserEntity u = userRepository.findById(id).orElseThrow(() -> AdminSupport.notFound("User"));
        if (u.getStatus() != UserStatus.SUSPENDED) {
            throw AdminSupport.conflict("This user is not suspended.");
        }
        u.setStatus(UserStatus.ACTIVE);
        u.setSuspensionReason(null);
        u.setSuspendedAt(null);
        userRepository.save(u);
        audit.log(admin, "USER_REACTIVATED", "USER", id, null);
    }

    private UserRow toRow(UserEntity u) {
        return new UserRow(u.getId(), u.getName(), u.getEmail(), u.getMobile(), AdminSupport.rolesOf(u), statusOf(u),
                u.getCreatedAt(), carRepository.countByUser_Id(u.getId()),
                transactionRepository.countByBuyer_IdOrSeller_Id(u.getId(), u.getId()));
    }

    private static String statusOf(UserEntity u) {
        return u.getStatus() == null ? UserStatus.ACTIVE.name() : u.getStatus().name();
    }
}
