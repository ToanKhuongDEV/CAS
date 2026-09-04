package vn.cas.store.model;

public record CustomerTableSessionLookup(Long sessionId, long tableId, long storeId, long tableCode,
        String sessionPublicId, String sessionStatus) {
}
