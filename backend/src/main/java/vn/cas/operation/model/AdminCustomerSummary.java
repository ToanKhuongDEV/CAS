package vn.cas.operation.model;

import java.time.LocalDateTime;
import java.math.BigDecimal;

public record AdminCustomerSummary(long id, String displayName, String maskedPhone,
        long sessionCount, LocalDateTime lastVisitedAt, BigDecimal totalPaid) {
}
