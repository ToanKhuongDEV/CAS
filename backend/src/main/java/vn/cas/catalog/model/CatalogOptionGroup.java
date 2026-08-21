package vn.cas.catalog.model;

import java.util.List;

public record CatalogOptionGroup(
    long id,
    String name,
    String selectionType,
    int minSelect,
    Integer maxSelect,
    int displayOrder,
    String status,
    List<CatalogOptionValue> values) {}
