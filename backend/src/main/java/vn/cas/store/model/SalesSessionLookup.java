package vn.cas.store.model;

public record SalesSessionLookup(Long sessionId, Long tableId, long storeId, Long tableCode,
        Long clientAccountId, Long selectedPromotionId, Long selectedPromotionCodeId,
        String sessionPublicId, String sessionStatus, String sessionType) {
    public SalesSessionLookup(Long sessionId, Long tableId, long storeId, Long tableCode,
            String sessionPublicId, String sessionStatus) {
        this(sessionId, tableId, storeId, tableCode, null, null, null, sessionPublicId,
                sessionStatus, "DINE_IN");
    }

    public SalesSessionLookup(Long sessionId, Long tableId, long storeId, Long tableCode,
            Long clientAccountId, Long selectedPromotionId, Long selectedPromotionCodeId,
            String sessionPublicId, String sessionStatus) {
        this(sessionId, tableId, storeId, tableCode, clientAccountId, selectedPromotionId,
                selectedPromotionCodeId, sessionPublicId, sessionStatus, "DINE_IN");
    }
}
