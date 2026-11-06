package vn.cas.store.model;

import java.util.List;

public record SalesSessionResolution(ResolutionStatus status, String sessionPublicId,
        Long tableCode, List<JoinableSalesSession> joinableSessions) {

    public enum ResolutionStatus {
        CUSTOMER_INFORMATION_REQUIRED, JOIN_SESSION_REQUIRED, OPEN, PAYMENT_PENDING
    }

    public boolean requiresCustomerInformation() {
        return status == ResolutionStatus.CUSTOMER_INFORMATION_REQUIRED;
    }

    public boolean requiresSessionSelection() {
        return status == ResolutionStatus.JOIN_SESSION_REQUIRED;
    }
}
