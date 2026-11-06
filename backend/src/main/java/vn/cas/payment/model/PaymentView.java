package vn.cas.payment.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentView(long id, String publicId, long salesSessionId, Long tableCode,
        BigDecimal amount, String billSnapshot, String status, String confirmedByName,
        LocalDateTime confirmedAt, LocalDateTime createdAt) {
}
