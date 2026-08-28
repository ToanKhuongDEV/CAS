package vn.cas.store.model;

public record AdminDiningTable(long id, long code, Integer capacity, String activeQrToken,
        String sessionStatus, String sessionPublicId) {
}
