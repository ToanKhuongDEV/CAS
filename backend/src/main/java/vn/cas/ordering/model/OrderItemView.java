package vn.cas.ordering.model;

import java.math.BigDecimal;

public record OrderItemView(long id, long orderId, String publicId, String itemName,
        BigDecimal unitPrice, BigDecimal optionsAmount, int quantity, int preparedQuantity,
        int cancelledQuantity, BigDecimal totalAmount) {
}
