package vn.cas.ordering.model;

import java.math.BigDecimal;

public record OrderItemRemakeSnapshot(long tableSessionId, long menuItemId, String itemName,
        BigDecimal unitPrice, BigDecimal optionsAmount) {
}
