package vn.cas.operation.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.infrastructure.firebase.FirebaseUserProvisioner;
import vn.cas.operation.infrastructure.persistence.mybatis.CreateOperatorAccountCommand;
import vn.cas.operation.infrastructure.persistence.mybatis.OperationalAccountMapper;

class OperatorManagementServiceTest {

    private final OperationalAccountMapper accountMapper = mock(OperationalAccountMapper.class);
    private final AuditLogService auditLogService = mock(AuditLogService.class);
    private final FirebaseUserProvisioner firebaseUserProvisioner = mock(FirebaseUserProvisioner.class);
    private final OperatorManagementService service = new OperatorManagementService(
            accountMapper, auditLogService, firebaseUserProvisioner);
    private final OperationalPrincipal principal = new OperationalPrincipal(
            7L, 2L, "firebase-admin-1", "Admin One", "ADMIN");

    @Test
    void shouldCreateFirebaseUserThenPersistOperatorAccount() {
        when(firebaseUserProvisioner.createUser("operator@example.com", "password1", "Operator One"))
                .thenReturn("firebase-operator-1");
        doAnswer(invocation -> {
            invocation.getArgument(0, CreateOperatorAccountCommand.class).setId(12L);
            return 1;
        }).when(accountMapper).insertOperatorAccount(any());

        var result = service.create(
                principal, "operator@example.com", "password1", "Operator One", UUID.randomUUID());

        assertThat(result)
                .extracting(OperatorManagementService.Operator::id,
                        OperatorManagementService.Operator::firebaseUid,
                        OperatorManagementService.Operator::status)
                .containsExactly(12L, "firebase-operator-1", "ACTIVE");

        var commandCaptor = ArgumentCaptor.forClass(CreateOperatorAccountCommand.class);
        verify(accountMapper).insertOperatorAccount(commandCaptor.capture());
        assertThat(commandCaptor.getValue())
                .extracting(CreateOperatorAccountCommand::getStoreId,
                        CreateOperatorAccountCommand::getFirebaseUid,
                        CreateOperatorAccountCommand::getDisplayName)
                .containsExactly(2L, "firebase-operator-1", "Operator One");
        verify(auditLogService).record(any());
    }
}
