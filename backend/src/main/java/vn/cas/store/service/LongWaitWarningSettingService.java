package vn.cas.store.service;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.store.model.LongWaitWarningSetting;
import vn.cas.store.mapper.StoreSettingsMapper;

@Service
public class LongWaitWarningSettingService {

    static final int FALLBACK_LONG_WAIT_WARNING_MINUTES = 25;

    private final StoreSettingsMapper storeSettingsMapper;
    private final AuditLogService auditLogService;

    public LongWaitWarningSettingService(
            StoreSettingsMapper storeSettingsMapper,
            AuditLogService auditLogService) {
        this.storeSettingsMapper = storeSettingsMapper;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public LongWaitWarningSetting get(long storeId) {
        int longWaitWarningMinutes = storeSettingsMapper.findLongWaitWarningMinutesByStoreId(storeId)
                .filter(this::isValidLongWaitWarningMinutes)
                .orElse(FALLBACK_LONG_WAIT_WARNING_MINUTES);
        return new LongWaitWarningSetting(longWaitWarningMinutes);
    }

    @Transactional
    public LongWaitWarningSetting update(
            OperationalPrincipal principal,
            int longWaitWarningMinutes,
            UUID requestId) {
        storeSettingsMapper.updateLongWaitWarningMinutes(principal.storeId(), longWaitWarningMinutes);
        auditLogService.record(new AuditLogCommand(
                principal.storeId(),
                requestId,
                "UPDATE",
                "STORE_SETTINGS",
                principal.storeId(),
                "Long-wait warning setting",
                "{\"longWaitWarningMinutes\":" + longWaitWarningMinutes + "}",
                principal.accountId(),
                principal.displayName(),
                "Updated long-wait warning setting"));
        return new LongWaitWarningSetting(longWaitWarningMinutes);
    }

    private boolean isValidLongWaitWarningMinutes(int longWaitWarningMinutes) {
        return longWaitWarningMinutes >= 0 && longWaitWarningMinutes <= 1440;
    }
}
