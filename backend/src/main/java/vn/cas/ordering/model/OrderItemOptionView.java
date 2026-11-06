package vn.cas.ordering.model;

import java.math.BigDecimal;

public record OrderItemOptionView(long orderItemId, String groupName, String optionName,
        BigDecimal unitPrice, int quantityPerItem) {
}
