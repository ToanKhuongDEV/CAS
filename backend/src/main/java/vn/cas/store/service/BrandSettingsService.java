package vn.cas.store.service;

import java.util.UUID;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.catalog.service.CloudinarySignatureService;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;
import vn.cas.store.mapper.BrandSettingsMapper;
import vn.cas.store.model.BrandSettings;

@Service
public class BrandSettingsService {
    private final BrandSettingsMapper mapper;
    private final CloudinarySignatureService cloudinary;
    private final AuditLogService auditLogs;

    public BrandSettingsService(BrandSettingsMapper mapper, CloudinarySignatureService cloudinary,
            AuditLogService auditLogs) {
        this.mapper = mapper;
        this.cloudinary = cloudinary;
        this.auditLogs = auditLogs;
    }

    @Transactional(readOnly = true)
    public BrandSettings get(OperationalPrincipal principal) {
        requireSuperAdmin(principal);
        return requiredSettings();
    }

    @Transactional
    public BrandSettings update(OperationalPrincipal principal, BrandSettings settings,
            UUID requestId) {
        requireSuperAdmin(principal);
        var current = requiredSettings();
        if (!Objects.equals(current.logoStorageKey(), settings.logoStorageKey()))
            cloudinary.validateBrandAsset(settings.logoUrl(), settings.logoStorageKey());
        mapper.update(settings.name(), settings.logoUrl(), settings.logoStorageKey(),
                settings.welcomeSlogan());
        cloudinary.deleteBrandAfterCommit(current.logoStorageKey(), settings.logoStorageKey());
        auditLogs.record(new AuditLogCommand(principal.storeId(), requestId, "UPDATE", "BRAND", 1,
                settings.name(), "{}", principal.accountId(), principal.displayName(),
                "Updated shared brand settings"));
        return requiredSettings();
    }

    private BrandSettings requiredSettings() {
        var settings = mapper.find();
        if (settings == null)
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy cấu hình thương hiệu.");
        return settings;
    }

    private void requireSuperAdmin(OperationalPrincipal principal) {
        if (!"SUPER_ADMIN".equals(principal.role()))
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "Chỉ SUPER_ADMIN có quyền quản lý thương hiệu chung.");
    }
}
