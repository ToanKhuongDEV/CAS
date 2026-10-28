package vn.cas.operation.service;

import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.dto.CreateAdminAccountCommand;
import vn.cas.operation.mapper.OperationalAccountMapper;
import vn.cas.operation.mapper.AdminAccountView;
import vn.cas.operation.service.firebase.FirebaseUserProvisioner;

@Service
public class AdminAccountService {
    private static final String DEFAULT_ADMIN_PASSWORD = "password123";
    private final OperationalAccountMapper accountMapper;
    private final AuditLogService auditLogService;
    private final FirebaseUserProvisioner firebaseUserProvisioner;

    public AdminAccountService(OperationalAccountMapper accountMapper,
            AuditLogService auditLogService, FirebaseUserProvisioner firebaseUserProvisioner) {
        this.accountMapper = accountMapper;
        this.auditLogService = auditLogService;
        this.firebaseUserProvisioner = firebaseUserProvisioner;
    }

    @Transactional
    public AdminAccount create(OperationalPrincipal principal, String email, String phone,
            String displayName, UUID requestId) {
        if (!"SUPER_ADMIN".equals(principal.role()))
            throw new ApiException(HttpStatus.FORBIDDEN, ApiMessages.FORBIDDEN);
        var firebaseUid = firebaseUserProvisioner.createUser(email, DEFAULT_ADMIN_PASSWORD,
                displayName);
        var command = new CreateAdminAccountCommand(principal.storeId(), firebaseUid, email, phone,
                displayName);
        try {
            accountMapper.insertAdminAccount(command);
            auditLogService.record(new AuditLogCommand(principal.storeId(), requestId, "CREATE",
                    "ACCOUNT", command.getId(), displayName, "{\"role\":\"ADMIN\"}",
                    principal.accountId(), principal.displayName(), "Created admin account"));
        } catch (DataIntegrityViolationException exception) {
            firebaseUserProvisioner.deleteUser(firebaseUid);
            throw new ApiException(HttpStatus.CONFLICT, ApiMessages.FIREBASE_UID_ALREADY_EXISTS);
        } catch (RuntimeException exception) {
            firebaseUserProvisioner.deleteUser(firebaseUid);
            throw exception;
        }
        return new AdminAccount(command.getId(), firebaseUid, displayName);
    }

    public record AdminAccount(long id, String firebaseUid, String displayName) {
    }

    @Transactional(readOnly = true)
    public java.util.List<AdminAccountView> findAll(OperationalPrincipal principal) {
        if (!"SUPER_ADMIN".equals(principal.role()))
            throw new ApiException(HttpStatus.FORBIDDEN, ApiMessages.FORBIDDEN);
        return accountMapper.findAdminsByStoreId(principal.storeId());
    }

    @Transactional
    public void deactivate(OperationalPrincipal principal, long adminId, UUID requestId) {
        if (!"SUPER_ADMIN".equals(principal.role()))
            throw new ApiException(HttpStatus.FORBIDDEN, ApiMessages.FORBIDDEN);
        if (accountMapper.deactivateAdminAccount(adminId, principal.storeId()) != 1)
            throw new ApiException(HttpStatus.NOT_FOUND,
                    "Không tìm thấy tài khoản quản trị viên đang hoạt động.");
        auditLogService.record(new AuditLogCommand(principal.storeId(), requestId, "DEACTIVATE",
                "ACCOUNT", adminId, "Admin " + adminId, "{\"status\":\"INACTIVE\"}",
                principal.accountId(), principal.displayName(), "Deactivated admin account"));
    }

    @Transactional
    public void activate(OperationalPrincipal principal, long adminId, UUID requestId) {
        if (!"SUPER_ADMIN".equals(principal.role()))
            throw new ApiException(HttpStatus.FORBIDDEN, ApiMessages.FORBIDDEN);
        if (accountMapper.activateAdminAccount(adminId, principal.storeId()) != 1)
            throw new ApiException(HttpStatus.NOT_FOUND,
                    "Không tìm thấy tài khoản quản trị viên đã khóa.");
        auditLogService.record(new AuditLogCommand(principal.storeId(), requestId, "ACTIVATE",
                "ACCOUNT", adminId, "Admin " + adminId, "{\"status\":\"ACTIVE\"}",
                principal.accountId(), principal.displayName(), "Activated admin account"));
    }
}
