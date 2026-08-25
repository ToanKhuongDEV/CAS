package vn.cas.store.service;

import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;
import vn.cas.store.mapper.StoreSettingsMapper;
import vn.cas.store.model.StoreSettings;

@Service
public class StoreSettingsService {
    private final StoreSettingsMapper mapper;
    private final AuditLogService auditLogs;

    public StoreSettingsService(StoreSettingsMapper mapper, AuditLogService auditLogs) {
        this.mapper = mapper;
        this.auditLogs = auditLogs;
    }

    @Transactional(readOnly = true)
    public StoreSettings get(long storeId) {
        var settings = mapper.findByStoreId(storeId);
        if (settings == null) throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy cửa hàng.");
        return settings;
    }

    @Transactional
    public StoreSettings update(OperationalPrincipal principal, StoreSettings settings, UUID requestId) {
        mapper.updateStoreSettings(principal.storeId(), settings.name(), settings.address(), settings.phone(),
                settings.email(), settings.logoUrl(), settings.googleMapsLocation(), settings.openTime(),
                settings.closeTime(), settings.welcomeSlogan(), settings.status());
        auditLogs.record(new AuditLogCommand(principal.storeId(), requestId, "UPDATE", "STORE",
                principal.storeId(), settings.name(), "{}", principal.accountId(), principal.displayName(),
                "Updated store settings"));
        return get(principal.storeId());
    }
}
