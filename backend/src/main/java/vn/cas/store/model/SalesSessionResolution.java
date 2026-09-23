package vn.cas.store.model;

public record SalesSessionResolution(ResolutionStatus status, String sessionPublicId,
        long tableCode) {

    public enum ResolutionStatus {
        CUSTOMER_INFORMATION_REQUIRED, OPEN, PAYMENT_PENDING
    }

    public boolean requiresCustomerInformation() {
        return status == ResolutionStatus.CUSTOMER_INFORMATION_REQUIRED;
    }
}
