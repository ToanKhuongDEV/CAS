package vn.cas.ordering.model;

import java.time.LocalDateTime;

public record PreparationItemRow(long orderItemId, String orderItemPublicId, long orderId,
        String orderPublicId, long tableId, int tableCode, long menuItemId, String itemName,
        int quantity, int preparedQuantity, int cancelledQuantity, LocalDateTime orderCreatedAt) {
}
