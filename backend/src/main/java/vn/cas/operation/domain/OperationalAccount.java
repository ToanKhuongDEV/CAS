package vn.cas.operation.domain;

public record OperationalAccount(
        long id,
        long storeId,
        String firebaseUid,
        String displayName,
        AccountRole role) {
}
