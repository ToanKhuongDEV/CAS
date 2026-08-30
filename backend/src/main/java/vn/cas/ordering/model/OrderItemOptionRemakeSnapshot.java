package vn.cas.ordering.model;

import java.math.BigDecimal;

public record OrderItemOptionRemakeSnapshot(long optionValueId, String groupName, String optionName,
        BigDecimal unitPrice, int quantityPerItem) {
}
