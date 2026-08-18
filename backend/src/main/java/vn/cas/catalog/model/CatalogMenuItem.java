package vn.cas.catalog.model;

import java.math.BigDecimal;
import java.util.List;
public record CatalogMenuItem(long id, long categoryId, String name, String description, BigDecimal price, String imageUrl, String imageStorageKey, String availabilityStatus, int displayOrder, List<CatalogTag> tags, List<CatalogOptionGroup> optionGroups) { }
