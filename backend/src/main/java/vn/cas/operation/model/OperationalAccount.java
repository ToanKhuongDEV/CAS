package vn.cas.operation.model;

public record OperationalAccount(
        long id,
        long storeId,
        String firebaseUid,
        String email,
        String phone,
        String displayName,
        AccountRole role) {
}
