package vn.cas.operation.service;

import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.dto.CreateOperatorAccountCommand;
import vn.cas.operation.mapper.OperationalAccountMapper;
import vn.cas.operation.service.firebase.FirebaseUserProvisioner;

@Service
@Slf4j
public class OperatorManagementService {
    private static final String DEFAULT_OPERATOR_PASSWORD = "password123";

    private final OperationalAccountMapper accountMapper;
    private final AuditLogService auditLogService;
    private final FirebaseUserProvisioner firebaseUserProvisioner;

    public OperatorManagementService(OperationalAccountMapper accountMapper,
            AuditLogService auditLogService, FirebaseUserProvisioner firebaseUserProvisioner) {
        this.accountMapper = accountMapper;
        this.auditLogService = auditLogService;
        this.firebaseUserProvisioner = firebaseUserProvisioner;
    }

    @Transactional
    public Operator create(OperationalPrincipal principal, String email, String phone,
            String displayName, UUID requestId) {
        var firebaseUid = firebaseUserProvisioner.createUser(email, DEFAULT_OPERATOR_PASSWORD,
                displayName);
        var command = new CreateOperatorAccountCommand(principal.storeId(), firebaseUid, email,
                phone, displayName);
        try {
            accountMapper.insertOperatorAccount(command);
            auditLogService.record(new AuditLogCommand(principal.storeId(), requestId, "CREATE",
                    "ACCOUNT", command.getId(), displayName, "{\"role\":\"OPERATOR\"}",
                    principal.accountId(), principal.displayName(), "Created operator account"));
        } catch (DataIntegrityViolationException exception) {
            log.warn(
                    "Operator account creation failed while persisting CAS account: requestId={}, actorAccountId={}",
                    requestId, principal.accountId());
            firebaseUserProvisioner.deleteUser(firebaseUid);
            throw new ApiException(HttpStatus.CONFLICT, ApiMessages.FIREBASE_UID_ALREADY_EXISTS);
        } catch (RuntimeException exception) {
            log.error(
                    "Operator account creation failed while persisting CAS account: requestId={}, actorAccountId={}",
                    requestId, principal.accountId(), exception);
            firebaseUserProvisioner.deleteUser(firebaseUid);
            throw exception;
        }
        return new Operator(command.getId(), firebaseUid, displayName, "ACTIVE");
    }

    @Transactional
    public void deactivate(OperationalPrincipal principal, long operatorId, UUID requestId) {
        if (accountMapper.deactivateOperatorAccount(operatorId, principal.storeId()) != 1) {
            throw new ApiException(HttpStatus.NOT_FOUND, ApiMessages.OPERATOR_NOT_FOUND);
        }
        auditLogService.record(new AuditLogCommand(principal.storeId(), requestId, "DEACTIVATE",
                "ACCOUNT", operatorId, "Operator " + operatorId, "{\"status\":\"INACTIVE\"}",
                principal.accountId(), principal.displayName(), "Deactivated operator account"));
    }

    public record Operator(long id, String firebaseUid, String displayName, String status) {
    }
}
