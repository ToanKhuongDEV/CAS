package vn.cas.ordering.model;

public record StoredPreparationBatchCompletion(long menuItemId, String optionConfigurationHash,
        String requestFingerprint, String allocationSnapshot) {
}
