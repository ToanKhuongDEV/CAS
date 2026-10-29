package vn.cas.ordering.model;

import java.time.LocalDateTime;

public record PreparationItemRow(long orderItemId, String orderItemPublicId, long orderId,
        String orderPublicId, String sessionPublicId, Long tableId, Integer tableCode,
        String customerName, long menuItemId, String itemName, int quantity, int preparedQuantity,
        int cancelledQuantity, LocalDateTime orderCreatedAt) {
}
