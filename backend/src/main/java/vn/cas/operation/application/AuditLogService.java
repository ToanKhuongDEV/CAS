package vn.cas.operation.application;

import java.util.Objects;

import org.springframework.stereotype.Service;

import vn.cas.operation.infrastructure.persistence.mybatis.AuditLogMapper;

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
