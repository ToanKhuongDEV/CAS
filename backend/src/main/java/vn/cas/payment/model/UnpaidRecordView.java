package vn.cas.payment.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UnpaidRecordView(String publicId, String tableSessionId, long tableCode,
        BigDecimal amount, String billSnapshot, String status, String reason, String reportedByName,
        String paymentId, LocalDateTime resolvedAt, LocalDateTime createdAt) {
}
