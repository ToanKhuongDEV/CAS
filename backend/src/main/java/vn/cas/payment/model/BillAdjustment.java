package vn.cas.payment.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BillAdjustment(String publicId, String adjustmentType, BigDecimal amount,
        String reason, LocalDateTime createdAt) {
}
