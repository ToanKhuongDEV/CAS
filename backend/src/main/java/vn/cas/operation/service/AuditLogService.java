package vn.cas.operation.service;

import java.util.Objects;
import org.springframework.stereotype.Service;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.mapper.AuditLogMapper;

@Service
public class AuditLogService {

    private final AuditLogMapper auditLogMapper;

    public AuditLogService(AuditLogMapper auditLogMapper) {
        this.auditLogMapper = auditLogMapper;
    }

    public void record(AuditLogCommand command) {
        Objects.requireNonNull(command, "command must not be null");
        auditLogMapper.insert(command);
    }
}
