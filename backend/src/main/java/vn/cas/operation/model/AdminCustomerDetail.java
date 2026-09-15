package vn.cas.operation.model;

import java.util.List;

public record AdminCustomerDetail(long id, String displayName, String phone,
        List<AdminCustomerSession> sessions) {
}
