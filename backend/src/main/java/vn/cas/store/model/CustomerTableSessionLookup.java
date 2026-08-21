package vn.cas.store.model;

public record CustomerTableSessionLookup(
    long tableId, long storeId, long tableCode, String sessionPublicId, String sessionStatus) {}
