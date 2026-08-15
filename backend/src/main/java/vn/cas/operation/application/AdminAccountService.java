package vn.cas.operation.application;

import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.contract.ApiMessages;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.ApiException;
import vn.cas.operation.infrastructure.persistence.mybatis.CreateAdminAccountCommand;
import vn.cas.operation.infrastructure.persistence.mybatis.OperationalAccountMapper;

@Service
public class AdminAccountService {
    private final OperationalAccountMapper accountMapper;
    private final AuditLogService auditLogService;
    public AdminAccountService(OperationalAccountMapper accountMapper, AuditLogService auditLogService) {
        this.accountMapper = accountMapper; this.auditLogService = auditLogService;
    }
    @Transactional
    public AdminAccount create(OperationalPrincipal principal, String firebaseUid, String displayName, UUID requestId) {
        if (!"SUPER_ADMIN".equals(principal.role())) throw new ApiException(HttpStatus.FORBIDDEN, ApiMessages.FORBIDDEN);
        if (accountMapper.existsByFirebaseUid(firebaseUid)) throw new ApiException(HttpStatus.CONFLICT, ApiMessages.FIREBASE_UID_ALREADY_EXISTS);
        var command = new CreateAdminAccountCommand(principal.storeId(), firebaseUid, displayName);
        try { accountMapper.insertAdminAccount(command); }
        catch (DataIntegrityViolationException exception) { throw new ApiException(HttpStatus.CONFLICT, ApiMessages.FIREBASE_UID_ALREADY_EXISTS); }
        auditLogService.record(new AuditLogCommand(principal.storeId(), requestId, "CREATE", "ACCOUNT", command.getId(), displayName,
                "{\"role\":\"ADMIN\"}", principal.accountId(), principal.displayName(), "Created admin account"));
        return new AdminAccount(command.getId(), firebaseUid, displayName);
    }
    public record AdminAccount(long id, String firebaseUid, String displayName) { }
}
