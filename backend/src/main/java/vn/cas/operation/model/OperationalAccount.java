package vn.cas.operation.model;

public record OperationalAccount(
        long id,
        long storeId,
        String firebaseUid,
        String displayName,
        AccountRole role) {
}
