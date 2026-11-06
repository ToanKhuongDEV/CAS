package vn.cas.ordering.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderOverview(long id, String publicId, String orderNumber, BigDecimal originalAmount,
        BigDecimal payableAmount, String note, LocalDateTime createdAt) {
}
