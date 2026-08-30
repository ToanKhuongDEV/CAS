package vn.cas.ordering.model;

import java.time.LocalDateTime;

public record OperatorCancellationRequestRow(long id, String publicId, long orderId,
        String orderPublicId, long orderItemId, String orderItemPublicId, long menuItemId,
        String itemName, int quantity, int preparedQuantity, int approvedCancellationQuantity,
        int requestedQuantity, String reason, String status, int tableCode,
        LocalDateTime createdAt) {
}
