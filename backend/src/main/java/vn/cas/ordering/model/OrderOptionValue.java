package vn.cas.ordering.model;

import java.math.BigDecimal;

public record OrderOptionValue(long id, long groupId, String groupName, String name,
        BigDecimal extraPrice) {
}
