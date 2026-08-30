package vn.cas.ordering.model;

public record PreparedItemTransfer(long cancellationRequestId, long sourceOrderItemId,
        long targetOrderItemId, int quantity, long transferredByAccountId) {
}
