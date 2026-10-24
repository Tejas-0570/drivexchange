package com.drivexchange.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.drivexchange.dto.AdminDtos.AuditRow;
import com.drivexchange.dto.AdminDtos.HistoryItem;
import com.drivexchange.dto.AdminDtos.PageDto;
import com.drivexchange.entity.AuditLogEntity;
import com.drivexchange.entity.UserEntity;
import com.drivexchange.repo.AuditLogRepository;

/** Writes (and reads) the admin activity log. Called INSIDE the same DB transaction as the action itself:
 *  if the action fails, no log row; if the log fails, no action. */
@Service
public class AuditService {

    private final AuditLogRepository repo;

    public AuditService(AuditLogRepository repo) {
        this.repo = repo;
    }

    public void log(UserEntity admin, String action, String targetType, UUID targetId, String reason) {
        AuditLogEntity a = new AuditLogEntity();
        a.setAdminId(admin.getId());
        a.setAdminName(admin.getName());
        a.setAction(action);
        a.setTargetType(targetType);
        a.setTargetId(targetId);
        a.setReason(reason);
        repo.save(a);
    }

    @Transactional(readOnly = true)
    public PageDto<AuditRow> list(String targetType, int page, int size) {
        PageRequest pr = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var p = (targetType == null ? repo.findAll(pr) : repo.findByTargetType(targetType, pr))
                .map(a -> new AuditRow(a.getId(), a.getCreatedAt(), a.getAdminName(), a.getAction(),
                        a.getTargetType(), a.getTargetId(), a.getReason()));
        return PageDto.of(p);
    }

    @Transactional(readOnly = true)
    public List<HistoryItem> historyOf(String targetType, UUID targetId) {
        return repo.findByTargetTypeAndTargetIdOrderByCreatedAtDesc(targetType, targetId).stream()
                .map(a -> new HistoryItem(a.getAction(), a.getReason(), a.getAdminName(), a.getCreatedAt())).toList();
    }
}
