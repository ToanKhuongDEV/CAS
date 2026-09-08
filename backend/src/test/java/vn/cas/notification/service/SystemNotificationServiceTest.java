package vn.cas.notification.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.notification.dto.CreateSystemNotificationCommand;
import vn.cas.notification.mapper.SystemNotificationMapper;
import vn.cas.operation.service.AuditLogService;
import vn.cas.store.service.CustomerTableSessionService;

class SystemNotificationServiceTest {
    private final SystemNotificationMapper mapper = mock(SystemNotificationMapper.class);
    private final CustomerTableSessionService sessions = mock(CustomerTableSessionService.class);
    private final AuditLogService auditLogs = mock(AuditLogService.class);
    private final SystemNotificationService service = new SystemNotificationService(mapper,
            sessions, auditLogs);
    private final OperationalPrincipal principal = new OperationalPrincipal(7L, 2L,
            "firebase-admin-1", "Admin One", "ADMIN");

    @Test
    void shouldCreateRecipientsForBothTargetRoles() {
        doAnswer(invocation -> {
            invocation.getArgument(0, CreateSystemNotificationCommand.class).setId(12L);
            return 1;
        }).when(mapper).insert(any());

        var result = service.create(principal, "Bảo trì", "Tạm dừng phục vụ", "WARNING", "BOTH",
                UUID.randomUUID());

        assertThat(result.id()).isEqualTo(12L);
        verify(mapper).insertRecipientsForActiveOperators(12L, 2L);
        verify(mapper).insertRecipientsForActiveCustomerSessions(12L, 2L);
        verify(auditLogs).record(any());
    }

    @Test
    void shouldRejectUnsupportedNotificationType() {
        assertThatThrownBy(() -> service.create(principal, "Tin", "Nội dung", "SUCCESS", "OPERATOR",
                UUID.randomUUID())).isInstanceOf(ApiException.class)
                .extracting(exception -> ((ApiException) exception).status())
                .isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void shouldDeleteNotificationWithoutDeletingRecipientsExplicitly() {
        when(mapper.deleteByStoreIdAndId(2L, 12L)).thenReturn(1);

        service.delete(principal, 12L, UUID.randomUUID());

        verify(mapper).deleteByStoreIdAndId(2L, 12L);
        verify(auditLogs).record(any());
    }

    @Test
    void shouldAllowMarkingAnAlreadyReadNotificationAgain() {
        when(mapper.existsForAccount(12L, 7L)).thenReturn(true);

        service.markReadForOperator(principal, 12L);

        verify(mapper).markReadForAccount(eq(12L), eq(7L), any());
    }
}
