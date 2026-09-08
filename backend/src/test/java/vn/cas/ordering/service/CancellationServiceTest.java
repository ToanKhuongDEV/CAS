package vn.cas.ordering.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;
import vn.cas.ordering.mapper.OrderingMapper;
import vn.cas.ordering.model.OperatorCancellationRequestRow;

class CancellationServiceTest {

    private final OrderingMapper mapper = mock(OrderingMapper.class);
    private final AuditLogService auditLogs = mock(AuditLogService.class);
    private final CancellationService service = new CancellationService(mapper, auditLogs);
    private final OperationalPrincipal operator = new OperationalPrincipal(3L, 2L, "firebase",
            "Operator One", "OPERATOR");

    @Test
    void shouldReturnPendingCountForOperatorStore() {
        when(mapper.countPendingCancellationRequests(2L)).thenReturn(4);

        assertThat(service.pendingCount(operator)).isEqualTo(4);
        verify(mapper).countPendingCancellationRequests(2L);
    }

    @Test
    void shouldRecordAuditLogWhenRejectingCancellationRequest() {
        var cancellation = cancellationRequest();
        UUID requestId = UUID.randomUUID();
        when(mapper.findOperatorCancellationRequestForUpdate(2L, "request-1"))
                .thenReturn(cancellation);

        var result = service.resolve(operator, "request-1", "REJECT", false, null, 0, requestId);

        assertThat(result.status()).isEqualTo("REJECTED");
        verify(mapper).resolveCancellationRequest(91L, "REJECTED", false, 3L, "Operator One");
        var command = ArgumentCaptor.forClass(AuditLogCommand.class);
        verify(auditLogs).record(command.capture());
        assertThat(command.getValue())
                .extracting(AuditLogCommand::action, AuditLogCommand::entityId,
                        AuditLogCommand::entityName, AuditLogCommand::requestId)
                .containsExactly("CANCELLATION_REQUEST_RESOLVED", 91L, "request-1", requestId);
    }

    private static OperatorCancellationRequestRow cancellationRequest() {
        return new OperatorCancellationRequestRow(91L, "request-1", 41L, "order-1", 51L, "item-1",
                9L, "Bún bò", 2, 0, 0, 1, "Gọi nhầm", "PENDING", 12,
                LocalDateTime.of(2026, 9, 5, 8, 0));
    }
}
