package vn.cas.store.model;

public record PublicStoreWelcomeConfig(String heroPrimaryImageUrl, String heroSecondaryImageUrl,
        String menuPreview1ImageUrl, String menuPreview2ImageUrl, String menuPreview3ImageUrl,
        String menuPreview4ImageUrl, String menuPreview5ImageUrl, String bannerImageUrl) {

    public static PublicStoreWelcomeConfig from(StoreWelcomeConfig config) {
        return new PublicStoreWelcomeConfig(config.heroPrimaryImageUrl(),
                config.heroSecondaryImageUrl(), config.menuPreview1ImageUrl(),
                config.menuPreview2ImageUrl(), config.menuPreview3ImageUrl(),
                config.menuPreview4ImageUrl(), config.menuPreview5ImageUrl(),
                config.bannerImageUrl());
    }
}
