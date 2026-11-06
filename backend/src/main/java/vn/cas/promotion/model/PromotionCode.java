package vn.cas.promotion.model;

public record PromotionCode(long id, long promotionId, String code, Integer maxRedemptions) {
}
