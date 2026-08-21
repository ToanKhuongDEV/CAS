package vn.cas.common.security;

import vn.cas.operation.model.OperationalAccount;

public record OperationalPrincipal(long accountId, long storeId, String firebaseUid,
        String displayName, String role) {

    public static OperationalPrincipal from(OperationalAccount account) {
        return new OperationalPrincipal(account.id(), account.storeId(), account.firebaseUid(),
                account.displayName(), account.role().name());
    }
}
