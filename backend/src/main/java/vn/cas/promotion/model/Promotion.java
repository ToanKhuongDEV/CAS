package vn.cas.promotion.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record Promotion(long id, String publicId, String name, String promotionType,
        BigDecimal discountValue, BigDecimal maxDiscountAmount, BigDecimal minBillAmount,
        Integer maxRedemptions, Integer maxRedemptionsPerCustomer, String status,
        LocalDateTime startAt, LocalDateTime endAt) {
}
