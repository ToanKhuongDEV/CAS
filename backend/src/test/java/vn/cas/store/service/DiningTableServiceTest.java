package vn.cas.store.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;
import vn.cas.store.dto.CreateDiningTableCommand;
import vn.cas.store.mapper.DiningTableMapper;

class DiningTableServiceTest {

    private final DiningTableMapper diningTableMapper = mock(DiningTableMapper.class);
    private final AuditLogService auditLogService = mock(AuditLogService.class);
    private final DiningTableService service = new DiningTableService(diningTableMapper,
            auditLogService);
    private final OperationalPrincipal principal = new OperationalPrincipal(7L, 2L,
            "firebase-user-1", "Admin One", "ADMIN");

    @Test
    void shouldCreateDiningTableWithActiveQrCodeAndAuditLog() {
        when(diningTableMapper.existsByStoreIdAndCode(2L, 5L)).thenReturn(false);
        doAnswer(invocation -> {
            invocation.getArgument(0, CreateDiningTableCommand.class).setId(11L);
            return 1;
        }).when(diningTableMapper).insertDiningTable(any());
        UUID requestId = UUID.randomUUID();

        var result = service.create(principal, 5L, 4, requestId);

        assertThat(result.id()).isEqualTo(11L);
        assertThat(result.code()).isEqualTo(5L);
        assertThat(result.capacity()).isEqualTo(4);
        assertThat(result.activeQrToken()).matches("[0-9a-f]{64}");
        verify(diningTableMapper).insertActiveQrCode(anyLong(), any(), any());

        var auditCaptor = ArgumentCaptor.forClass(AuditLogCommand.class);
        verify(auditLogService).record(auditCaptor.capture());
        assertThat(auditCaptor.getValue()).extracting(AuditLogCommand::action,
                AuditLogCommand::entityType, AuditLogCommand::entityId)
                .containsExactly("CREATE", "DINING_TABLE", 11L);
        assertThat(auditCaptor.getValue().changeData()).isEqualTo("{\"code\":5,\"capacity\":4}");
    }

    @Test
    void shouldRejectExistingDiningTableCodeWithinStore() {
        when(diningTableMapper.existsByStoreIdAndCode(2L, 5L)).thenReturn(true);

        assertThatThrownBy(() -> service.create(principal, 5L, null, UUID.randomUUID()))
                .isInstanceOf(ApiException.class)
                .extracting(throwable -> ((ApiException) throwable).status(), Throwable::getMessage)
                .containsExactly(org.springframework.http.HttpStatus.CONFLICT,
                        ApiMessages.DINING_TABLE_CODE_ALREADY_EXISTS);

        verify(diningTableMapper, never()).insertDiningTable(any());
        verify(auditLogService, never()).record(any());
    }
}
