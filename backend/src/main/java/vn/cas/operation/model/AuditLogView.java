package vn.cas.operation.model;

import java.time.LocalDateTime;

public record AuditLogView(long id, String action, String entityType, long entityId,
        String entityName, String actorName, String description, LocalDateTime createdAt) {
}
