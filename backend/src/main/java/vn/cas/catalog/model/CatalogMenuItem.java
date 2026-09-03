package vn.cas.catalog.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CatalogMenuItem(long id, long categoryId, String name, String description,
        BigDecimal price, String imageUrl, String imageStorageKey, String availabilityStatus,
        int displayOrder, LocalDateTime createdAt, List<CatalogTag> tags,
        List<CatalogOptionGroup> optionGroups) {

    public CatalogMenuItem(long id, long categoryId, String name, String description,
            BigDecimal price, String imageUrl, String imageStorageKey, String availabilityStatus,
            int displayOrder, LocalDateTime createdAt) {
        this(id, categoryId, name, description, price, imageUrl, imageStorageKey,
                availabilityStatus, displayOrder, createdAt, List.of(), List.of());
    }
}
