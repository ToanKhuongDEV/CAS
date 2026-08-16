package vn.cas.operation.dto;

import java.util.UUID;

public record AuditLogCommand(
        long storeId,
        UUID requestId,
        String action,
        String entityType,
        long entityId,
        String entityName,
        String changeData,
        long actorAccountId,
        String actorName,
        String description) {
}
