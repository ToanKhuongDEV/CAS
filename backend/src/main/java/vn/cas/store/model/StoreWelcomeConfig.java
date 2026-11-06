package vn.cas.store.model;

import java.util.Arrays;
import java.util.List;

public record StoreWelcomeConfig(long id, long storeId, String heroPrimaryImageUrl,
        String heroPrimaryImageStorageKey, String heroSecondaryImageUrl,
        String heroSecondaryImageStorageKey, String menuPreview1ImageUrl,
        String menuPreview1ImageStorageKey, String menuPreview2ImageUrl,
        String menuPreview2ImageStorageKey, String menuPreview3ImageUrl,
        String menuPreview3ImageStorageKey, String menuPreview4ImageUrl,
        String menuPreview4ImageStorageKey, String menuPreview5ImageUrl,
        String menuPreview5ImageStorageKey, String bannerImageUrl, String bannerImageStorageKey,
        String status, Long createdBy, Long updatedBy) {

    public List<String> storageKeys() {
        return Arrays.asList(heroPrimaryImageStorageKey, heroSecondaryImageStorageKey,
                menuPreview1ImageStorageKey, menuPreview2ImageStorageKey,
                menuPreview3ImageStorageKey, menuPreview4ImageStorageKey,
                menuPreview5ImageStorageKey, bannerImageStorageKey);
    }
}
