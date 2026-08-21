package vn.cas.catalog.model;

import java.math.BigDecimal;

public record CatalogOptionValue(
    long id,
    String name,
    BigDecimal extraPrice,
    boolean isDefault,
    int displayOrder,
    String status) {}
