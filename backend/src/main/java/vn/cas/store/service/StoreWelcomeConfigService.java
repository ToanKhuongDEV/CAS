package vn.cas.store.service;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.catalog.service.CloudinarySignatureService;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;
import vn.cas.store.mapper.StoreWelcomeConfigMapper;
import vn.cas.store.model.PublicStoreWelcomeConfig;
import vn.cas.store.model.StoreWelcomeConfig;

@Service
public class StoreWelcomeConfigService {
    private final StoreWelcomeConfigMapper mapper;
    private final CloudinarySignatureService cloudinary;
    private final AuditLogService audit;

    public StoreWelcomeConfigService(StoreWelcomeConfigMapper mapper,
            CloudinarySignatureService cloudinary, AuditLogService audit) {
        this.mapper = mapper;
        this.cloudinary = cloudinary;
        this.audit = audit;
    }

    @Transactional(readOnly = true)
    public StoreWelcomeConfig get(long storeId) {
        var config = mapper.findByStoreId(storeId);
        if (config == null)
            throw notFound();
        return config;
    }

    @Transactional(readOnly = true)
    public PublicStoreWelcomeConfig getPublic(long storeId) {
        var config = mapper.findActiveByStoreId(storeId);
        if (config == null)
            throw notFound();
        return PublicStoreWelcomeConfig.from(config);
    }

    @Transactional
    public StoreWelcomeConfig save(OperationalPrincipal principal, StoreWelcomeConfig config,
            UUID requestId) {
        validate(principal.storeId(), config);
        var current = mapper.findByStoreId(principal.storeId());
        if (current == null) {
            mapper.insert(config);
            record(principal, requestId, "CREATE");
        } else {
            mapper.update(config);
            cloudinary.deleteUnusedAfterCommit(principal.storeId(), current.storageKeys(),
                    config.storageKeys());
            record(principal, requestId, "UPDATE");
        }
        return get(principal.storeId());
    }

    @Transactional
    public void delete(OperationalPrincipal principal, UUID requestId) {
        var current = get(principal.storeId());
        mapper.deleteByStoreId(principal.storeId());
        cloudinary.deleteUnusedAfterCommit(principal.storeId(), current.storageKeys(),
                java.util.List.of());
        record(principal, requestId, "DELETE");
    }

    private void validate(long storeId, StoreWelcomeConfig config) {
        cloudinary.validateAsset(storeId, config.heroPrimaryImageUrl(),
                config.heroPrimaryImageStorageKey());
        cloudinary.validateAsset(storeId, config.heroSecondaryImageUrl(),
                config.heroSecondaryImageStorageKey());
        cloudinary.validateAsset(storeId, config.menuPreview1ImageUrl(),
                config.menuPreview1ImageStorageKey());
        cloudinary.validateAsset(storeId, config.menuPreview2ImageUrl(),
                config.menuPreview2ImageStorageKey());
        cloudinary.validateAsset(storeId, config.menuPreview3ImageUrl(),
                config.menuPreview3ImageStorageKey());
        cloudinary.validateAsset(storeId, config.menuPreview4ImageUrl(),
                config.menuPreview4ImageStorageKey());
        cloudinary.validateAsset(storeId, config.menuPreview5ImageUrl(),
                config.menuPreview5ImageStorageKey());
        cloudinary.validateAsset(storeId, config.bannerImageUrl(), config.bannerImageStorageKey());
    }

    private void record(OperationalPrincipal principal, UUID requestId, String action) {
        audit.record(new AuditLogCommand(principal.storeId(), requestId, action, "STORE_WELCOME",
                principal.storeId(), "Welcome configuration", "{}", principal.accountId(),
                principal.displayName(), action + " store welcome configuration"));
    }

    private ApiException notFound() {
        return new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy cấu hình Welcome.");
    }
}
