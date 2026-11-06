package vn.cas.store.model;

public record OperatorTableSession(long tableId, String sessionPublicId, String customerName,
        String sessionStatus) {
}
