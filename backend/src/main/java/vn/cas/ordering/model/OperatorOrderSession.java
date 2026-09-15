package vn.cas.ordering.model;

public record OperatorOrderSession(long sessionId, long tableCode, String customerName,
        String customerPhone) {
}
