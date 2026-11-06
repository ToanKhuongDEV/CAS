package vn.cas.ordering.model;

public record CancellableOrderItem(long id, int quantity, int reservedCancellationQuantity,
        String sessionStatus) {
}
