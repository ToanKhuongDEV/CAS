package vn.cas.ordering.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;
import static org.mockito.ArgumentMatchers.any;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDateTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;
import vn.cas.notification.service.SystemNotificationService;
import vn.cas.ordering.mapper.OrderingMapper;
import vn.cas.ordering.model.OperatorCancellationRequestRow;
import vn.cas.ordering.model.OperatorOrderSession;
import vn.cas.ordering.model.PreparationItemRow;

class CancellationServiceTest {

    private final OrderingMapper mapper = mock(OrderingMapper.class);
    private final AuditLogService auditLogs = mock(AuditLogService.class);
    private final SystemNotificationService notifications = mock(SystemNotificationService.class);
    private final CancellationService service = new CancellationService(mapper, auditLogs,
            notifications);
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
        when(mapper.findSessionByOrderPublicIdAndStoreId(2L, "order-1"))
                .thenReturn(new OperatorOrderSession(7L, 12L, "Khách", null));

        var result = service.resolve(operator, "request-1", "REJECT", false, null, 0, "Đã chế biến",
                requestId);

        assertThat(result.status()).isEqualTo("REJECTED");
        verify(mapper).resolveCancellationRequest(91L, "REJECTED", false, 3L, "Operator One");
        verify(notifications).createForCustomerSession(operator, 7L, "Yêu cầu hủy món bị từ chối",
                "Yêu cầu hủy 1 phần Bún bò đã bị từ chối. Lý do: Đã chế biến");
        var command = ArgumentCaptor.forClass(AuditLogCommand.class);
        verify(auditLogs).record(command.capture());
        assertThat(command.getValue())
                .extracting(AuditLogCommand::action, AuditLogCommand::entityId,
                        AuditLogCommand::entityName, AuditLogCommand::requestId)
                .containsExactly("CANCELLATION_REQUEST_RESOLVED", 91L, "request-1", requestId);
    }

    @Test
    void rejectsWithoutReasonBeforeChangingAnything() {
        assertThatThrownBy(() -> service.resolve(operator, "request-1", "REJECT", false, null, 0,
                "  ", UUID.randomUUID())).isInstanceOf(vn.cas.common.exception.ApiException.class);
        verify(mapper, never()).resolveCancellationRequest(org.mockito.ArgumentMatchers.anyLong(),
                any(), org.mockito.ArgumentMatchers.anyBoolean(),
                org.mockito.ArgumentMatchers.anyLong(), any());
    }

    @Test
    void notifiesOnlyTheOrderSessionWhenApproved() {
        when(mapper.findOperatorCancellationRequestForUpdate(2L, "request-1"))
                .thenReturn(cancellationRequest());
        when(mapper.findSessionByOrderPublicIdAndStoreId(2L, "order-1"))
                .thenReturn(new OperatorOrderSession(7L, 12L, "Khách", null));
        when(mapper.findPreparationItemsForUpdate(2L, 9L)).thenReturn(
                java.util.List.of(new PreparationItemRow(51L, "item-1", 41L, "order-1", "session-1",
                        10L, 12, "Khách", 9L, "Bún bò", 2, 0, 0, LocalDateTime.now())));
        service.resolve(operator, "request-1", "APPROVE", false, null, 0, null, UUID.randomUUID());
        verify(notifications).createForCustomerSession(operator, 7L,
                "Yêu cầu hủy món đã được đồng ý", "Yêu cầu hủy 1 phần Bún bò đã được đồng ý.");
    }

    @Test
    void approvesAndNotifiesTakeawayOrderWithoutTable() {
        var takeaway = new OperatorCancellationRequestRow(91L, "request-1", 41L, "order-1", 51L,
                "item-1", 9L, "Bún bò", 2, 0, 0, 1, "Gọi nhầm", "PENDING", null, "An",
                LocalDateTime.now());
        when(mapper.findOperatorCancellationRequestForUpdate(2L, "request-1")).thenReturn(takeaway);
        when(mapper.findSessionByOrderPublicIdAndStoreId(2L, "order-1"))
                .thenReturn(new OperatorOrderSession(7L, null, "An", null));
        when(mapper.findPreparationItemsForUpdate(2L, 9L)).thenReturn(
                java.util.List.of(new PreparationItemRow(51L, "item-1", 41L, "order-1", "session-1",
                        null, null, "An", 9L, "Bún bò", 2, 0, 0, LocalDateTime.now())));

        var result = service.resolve(operator, "request-1", "APPROVE", false, null, 0, null,
                UUID.randomUUID());

        assertThat(result.status()).isEqualTo("APPROVED");
        verify(notifications).createForCustomerSession(operator, 7L,
                "Yêu cầu hủy món đã được đồng ý", "Yêu cầu hủy 1 phần Bún bò đã được đồng ý.");
    }

    @Test
    void rejectsAndNotifiesTakeawayOrderWithoutTable() {
        var takeaway = new OperatorCancellationRequestRow(91L, "request-1", 41L, "order-1", 51L,
                "item-1", 9L, "Bún bò", 2, 0, 0, 1, "Gọi nhầm", "PENDING", null, "An",
                LocalDateTime.now());
        when(mapper.findOperatorCancellationRequestForUpdate(2L, "request-1")).thenReturn(takeaway);
        when(mapper.findSessionByOrderPublicIdAndStoreId(2L, "order-1"))
                .thenReturn(new OperatorOrderSession(7L, null, "An", null));

        var result = service.resolve(operator, "request-1", "REJECT", false, null, 0, "Đã chế biến",
                UUID.randomUUID());

        assertThat(result.status()).isEqualTo("REJECTED");
        verify(notifications).createForCustomerSession(operator, 7L, "Yêu cầu hủy món bị từ chối",
                "Yêu cầu hủy 1 phần Bún bò đã bị từ chối. Lý do: Đã chế biến");
    }

    private static OperatorCancellationRequestRow cancellationRequest() {
        return new OperatorCancellationRequestRow(91L, "request-1", 41L, "order-1", 51L, "item-1",
                9L, "Bún bò", 2, 0, 0, 1, "Gọi nhầm", "PENDING", 12, "Khách",
                LocalDateTime.of(2026, 9, 5, 8, 0));
    }
}
