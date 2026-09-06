package vn.cas.store.model;

public record CustomerTableSessionLookup(Long sessionId, long tableId, long storeId, long tableCode,
        Long clientAccountId, Long selectedPromotionId, Long selectedPromotionCodeId,
        String sessionPublicId, String sessionStatus) {
    public CustomerTableSessionLookup(Long sessionId, long tableId, long storeId, long tableCode,
            String sessionPublicId, String sessionStatus) {
        this(sessionId, tableId, storeId, tableCode, null, null, null, sessionPublicId,
                sessionStatus);
    }
}
