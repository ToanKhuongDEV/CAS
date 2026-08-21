package vn.cas.store.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HexFormat;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;
import vn.cas.store.dto.CreateDiningTableCommand;
import vn.cas.store.mapper.DiningTableMapper;
import vn.cas.store.model.DiningTable;

@Service
public class DiningTableService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final DiningTableMapper diningTableMapper;
    private final AuditLogService auditLogService;

    public DiningTableService(DiningTableMapper diningTableMapper,
            AuditLogService auditLogService) {
        this.diningTableMapper = diningTableMapper;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public DiningTable create(OperationalPrincipal principal, long code, Integer capacity,
            UUID requestId) {
        if (diningTableMapper.existsByStoreIdAndCode(principal.storeId(), code)) {
            throw new ApiException(HttpStatus.CONFLICT,
                    ApiMessages.DINING_TABLE_CODE_ALREADY_EXISTS);
        }

        var command = new CreateDiningTableCommand(principal.storeId(), code, capacity,
                principal.accountId());
        try {
            diningTableMapper.insertDiningTable(command);
        } catch (DataIntegrityViolationException exception) {
            throw new ApiException(HttpStatus.CONFLICT,
                    ApiMessages.DINING_TABLE_CODE_ALREADY_EXISTS);
        }

        String qrToken = generateQrToken();
        diningTableMapper.insertActiveQrCode(command.getId(), qrToken,
                LocalDateTime.now(BUSINESS_ZONE));
        auditLogService.record(new AuditLogCommand(principal.storeId(), requestId, "CREATE",
                "DINING_TABLE", command.getId(), "Table " + code, changeData(code, capacity),
                principal.accountId(), principal.displayName(),
                "Created dining table and issued an active QR code"));
        return new DiningTable(command.getId(), code, capacity, qrToken);
    }

    private String generateQrToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String changeData(long code, Integer capacity) {
        return "{\"code\":" + code + ",\"capacity\":" + (capacity == null ? "null" : capacity)
                + "}";
    }
}
