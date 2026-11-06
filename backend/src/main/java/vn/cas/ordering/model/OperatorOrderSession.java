package vn.cas.ordering.model;

public record OperatorOrderSession(long sessionId, Long tableCode, String customerName,
        String customerPhone) {
}
