package vn.cas.operation.model;

import java.time.LocalDateTime;

public record AdminCustomerSummary(long id, String displayName, String maskedPhone,
        long sessionCount, LocalDateTime lastVisitedAt) {
}
