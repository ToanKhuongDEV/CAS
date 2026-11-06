package vn.cas.promotion.model;

public record PromotionTarget(long id, long promotionId, String targetType, long targetId) {
}
