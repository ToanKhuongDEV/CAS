package vn.cas.ordering.model;

public record StoredPreparationTableCompletion(int tableCode, String requestFingerprint,
        String allocationSnapshot) {
}
