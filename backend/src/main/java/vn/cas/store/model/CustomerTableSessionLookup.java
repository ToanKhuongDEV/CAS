package vn.cas.store.model;

public record CustomerTableSessionLookup(long sessionId, long tableId, long storeId, long tableCode,
        String sessionPublicId, String sessionStatus) {
}
