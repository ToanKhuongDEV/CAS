package vn.cas.operation.model;

public record ServiceBookingRecord(long id, String publicId, long clientAccountId,
        String paymentStatus) {
}
