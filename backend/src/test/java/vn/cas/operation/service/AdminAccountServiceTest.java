package vn.cas.operation.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.CreateAdminAccountCommand;
import vn.cas.operation.mapper.OperationalAccountMapper;
import vn.cas.operation.service.firebase.FirebaseUserProvisioner;

class AdminAccountServiceTest {
    private final OperationalAccountMapper mapper = mock(OperationalAccountMapper.class);
    private final AuditLogService audit = mock(AuditLogService.class);
    private final FirebaseUserProvisioner firebase = mock(FirebaseUserProvisioner.class);
    private final AdminAccountService service = new AdminAccountService(mapper, audit, firebase);
    private final OperationalPrincipal superAdmin = new OperationalPrincipal(1, 2, "super", "Super",
            "SUPER_ADMIN");

    @Test
    void createsFirebaseUserAndAdminForSelectedStore() {
        when(firebase.createUser("admin@example.com", "password123", "Admin")).thenReturn("uid");
        doAnswer(call -> {
            call.getArgument(0, CreateAdminAccountCommand.class).setId(3);
            return 1;
        }).when(mapper).insertAdminAccount(any());
        var result = service.create(superAdmin, "admin@example.com", "0901234567", "Admin",
                UUID.randomUUID());
        var command = ArgumentCaptor.forClass(CreateAdminAccountCommand.class);
        verify(mapper).insertAdminAccount(command.capture());
        assertThat(command.getValue().getStoreId()).isEqualTo(2);
        assertThat(result.firebaseUid()).isEqualTo("uid");
        verify(audit).record(any());
    }

    @Test
    void rejectsAdminBeforeCreatingFirebaseUser() {
        var admin = new OperationalPrincipal(1, 2, "admin", "Admin", "ADMIN");
        assertThatThrownBy(() -> service.create(admin, "admin@example.com", "0901234567", "Admin",
                UUID.randomUUID())).isInstanceOf(ApiException.class);
        verifyNoInteractions(firebase, mapper, audit);
    }

    @Test
    void deletesFirebaseUserWhenAuditFails() {
        when(firebase.createUser(any(), any(), any())).thenReturn("uid");
        doThrow(new IllegalStateException()).when(audit).record(any());
        assertThatThrownBy(() -> service.create(superAdmin, "admin@example.com", "0901234567",
                "Admin", UUID.randomUUID())).isInstanceOf(IllegalStateException.class);
        verify(firebase).deleteUser("uid");
    }

    @Test
    void superAdminListsOnlySelectedStore() {
        service.findAll(superAdmin);
        verify(mapper).findAdminsByStoreId(2L);
    }

    @Test
    void nonSuperAdminsCannotListAdmins() {
        for (String role : java.util.List.of("ADMIN", "OPERATOR")) {
            var principal = new OperationalPrincipal(1, 2, "uid", "User", role);
            assertThatThrownBy(() -> service.findAll(principal))
                    .isInstanceOfSatisfying(ApiException.class, error -> assertThat(error.status())
                            .isEqualTo(org.springframework.http.HttpStatus.FORBIDDEN));
        }
        verifyNoInteractions(mapper);
    }

    @Test
    void superAdminChangesAdminStatusWithinSelectedStoreAndAudits() {
        when(mapper.deactivateAdminAccount(7, 2)).thenReturn(1);
        when(mapper.activateAdminAccount(7, 2)).thenReturn(1);
        service.deactivate(superAdmin, 7, UUID.randomUUID());
        service.activate(superAdmin, 7, UUID.randomUUID());
        verify(mapper).deactivateAdminAccount(7, 2);
        verify(mapper).activateAdminAccount(7, 2);
        verify(audit, times(2)).record(any());
    }

    @Test
    void rejectsOtherRolesAndMissingOrCrossStoreAdmin() {
        for (String role : java.util.List.of("ADMIN", "OPERATOR")) {
            var principal = new OperationalPrincipal(1, 2, "uid", "User", role);
            assertThatThrownBy(() -> service.deactivate(principal, 7, UUID.randomUUID()))
                    .isInstanceOfSatisfying(ApiException.class, error -> assertThat(error.status())
                            .isEqualTo(org.springframework.http.HttpStatus.FORBIDDEN));
            assertThatThrownBy(() -> service.activate(principal, 7, UUID.randomUUID()))
                    .isInstanceOfSatisfying(ApiException.class, error -> assertThat(error.status())
                            .isEqualTo(org.springframework.http.HttpStatus.FORBIDDEN));
        }
        verifyNoInteractions(mapper, audit);
        assertThatThrownBy(() -> service.deactivate(superAdmin, 7, UUID.randomUUID()))
                .isInstanceOfSatisfying(ApiException.class, error -> assertThat(error.status())
                        .isEqualTo(org.springframework.http.HttpStatus.NOT_FOUND));
        verify(mapper).deactivateAdminAccount(7, 2);
        verifyNoInteractions(audit);
    }
}
