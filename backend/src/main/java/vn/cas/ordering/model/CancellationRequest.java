package vn.cas.ordering.model;

public record CancellationRequest(String publicId, int requestedQuantity, String reason,
        String status) {
}
