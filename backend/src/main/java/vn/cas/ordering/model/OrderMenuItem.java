package vn.cas.ordering.model;

import java.math.BigDecimal;

public record OrderMenuItem(long id, String name, BigDecimal price, String availabilityStatus) {
}
