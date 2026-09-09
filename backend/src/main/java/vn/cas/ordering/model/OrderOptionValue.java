package vn.cas.ordering.model;

import java.math.BigDecimal;

public record OrderOptionValue(long menuItemId, long id, long groupId, String groupName,
        String name, BigDecimal extraPrice) {
}
