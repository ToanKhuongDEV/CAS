package vn.cas.operation.application;

import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.contract.ApiMessages;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.ApiException;
import vn.cas.operation.infrastructure.persistence.mybatis.CreateOperatorAccountCommand;
import vn.cas.operation.infrastructure.persistence.mybatis.OperationalAccountMapper;

@Service
public class EmployeeManagementService {
    private final OperationalAccountMapper accountMapper;
    private final AuditLogService auditLogService;
    public EmployeeManagementService(OperationalAccountMapper accountMapper, AuditLogService auditLogService) {
        this.accountMapper = accountMapper;
        this.auditLogService = auditLogService;
    }
    @Transactional
    public Employee create(OperationalPrincipal principal, String firebaseUid, String displayName, UUID requestId) {
        if (accountMapper.existsByFirebaseUid(firebaseUid)) {
            throw new ApiException(HttpStatus.CONFLICT, ApiMessages.FIREBASE_UID_ALREADY_EXISTS);
        }
        var command = new CreateOperatorAccountCommand(principal.storeId(), firebaseUid, displayName);
        try { accountMapper.insertOperatorAccount(command); }
        catch (DataIntegrityViolationException exception) {
            throw new ApiException(HttpStatus.CONFLICT, ApiMessages.FIREBASE_UID_ALREADY_EXISTS);
        }
        auditLogService.record(new AuditLogCommand(principal.storeId(), requestId, "CREATE", "ACCOUNT", command.getId(), displayName,
                "{\"role\":\"OPERATOR\"}", principal.accountId(), principal.displayName(), "Created operator account"));
        return new Employee(command.getId(), firebaseUid, displayName, "ACTIVE");
    }
    @Transactional
    public void deactivate(OperationalPrincipal principal, long employeeId, UUID requestId) {
        if (accountMapper.deactivateOperatorAccount(employeeId, principal.storeId()) != 1) {
            throw new ApiException(HttpStatus.NOT_FOUND, ApiMessages.EMPLOYEE_NOT_FOUND);
        }
        auditLogService.record(new AuditLogCommand(principal.storeId(), requestId, "DEACTIVATE", "ACCOUNT", employeeId, "Employee " + employeeId,
                "{\"status\":\"INACTIVE\"}", principal.accountId(), principal.displayName(), "Deactivated operator account"));
    }
    public record Employee(long id, String firebaseUid, String displayName, String status) { }
}
