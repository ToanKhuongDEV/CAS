package vn.cas.ordering.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.service.AuditLogService;
import vn.cas.ordering.mapper.OrderingMapper;
import vn.cas.ordering.model.PreparationItemRow;
import vn.cas.ordering.model.StoredPreparationTableCompletion;
import vn.cas.store.service.LongWaitWarningSettingService;
import vn.cas.store.service.SalesSessionService;
import vn.cas.store.model.SalesSessionLookup;

class PreparationServiceTest {

    private static final String EMPTY_OPTIONS_HASH = "e3b0c44298fc1c149afbf4c8996fb924"
            + "27ae41e4649b934ca495991b7852b855";

    private final OrderingMapper mapper = mock(OrderingMapper.class);
    private final SalesSessionService sessions = mock(SalesSessionService.class);
    private final PreparationService service = new PreparationService(mapper,
            mock(LongWaitWarningSettingService.class), mock(AuditLogService.class),
            new ObjectMapper(), sessions);
    private final OperationalPrincipal operator = new OperationalPrincipal(3L, 2L, "firebase",
            "Operator One", "OPERATOR");

    @Test
    void shouldAllocateBatchCompletionInFifoOrder() {
        var first = item(11L, "item-1", "order-1", 1, 2, LocalDateTime.of(2026, 8, 30, 9, 0));
        var second = item(12L, "item-2", "order-2", 2, 3, LocalDateTime.of(2026, 8, 30, 9, 1));
        when(mapper.findPendingPreparationItemsForUpdate(2L, 9L))
                .thenReturn(List.of(first, second));
        when(mapper.findPreparationOptions(List.of(11L, 12L))).thenReturn(List.of());
        when(mapper.lastInsertId()).thenReturn(99L);

        var result = service.complete(operator, "9-" + EMPTY_OPTIONS_HASH, "batch-key", 4,
                UUID.randomUUID());

        assertThat(result.remainingQuantity()).isEqualTo(1);
        assertThat(result.allocations()).extracting(PreparationService.Allocation::quantity)
                .containsExactly(2, 2);
        verify(mapper).addPreparedQuantity(11L, 2, true);
        verify(mapper).addPreparedQuantity(12L, 2, false);
        verify(mapper).insertPreparationBatchCompletion(any(), eq(2L), eq(9L),
                eq(EMPTY_OPTIONS_HASH), eq("batch-key"), any(), eq(4), any(), eq(3L));
    }

    @Test
    void shouldReturnPendingPreparationTableCountForOperatorStore() {
        when(mapper.countPendingPreparationTables(2L)).thenReturn(4);

        assertThat(service.pendingTableCount(operator)).isEqualTo(4);
        verify(mapper).countPendingPreparationTables(2L);
    }

    @Test
    void shouldIncludeTakeawayInFifoPreparationBatch() {
        var takeaway = new PreparationItemRow(11L, "item-1", 11L, "order-1", "session-1", null,
                null, "An", 9L, "Mì cay", 1, 0, 0, LocalDateTime.of(2026, 8, 30, 9, 0));
        var dineIn = item(12L, "item-2", "order-2", 2, 2, LocalDateTime.of(2026, 8, 30, 9, 1));
        when(mapper.findPendingPreparationItemsForUpdate(2L, 9L))
                .thenReturn(List.of(takeaway, dineIn));
        when(mapper.findPreparationOptions(List.of(11L, 12L))).thenReturn(List.of());

        var result = service.complete(operator, "9-" + EMPTY_OPTIONS_HASH, "batch-key", 2,
                UUID.randomUUID());

        assertThat(result.allocations()).extracting(PreparationService.Allocation::tableCode)
                .containsExactly(null, 2);
        verify(mapper).addPreparedQuantity(11L, 1, true);
        verify(mapper).addPreparedQuantity(12L, 1, false);
    }

    @Test
    void completesAllRemainingItemsInOneSession() {
        when(sessions.requireForPreparationUpdate("session-1"))
                .thenReturn(new SalesSessionLookup(7L, null, 2L, null, "session-1", "OPEN"));
        var first = new PreparationItemRow(11L, "item-1", 11L, "order-1", "session-1", null, null,
                "An", 9L, "Mì cay", 2, 1, 0, LocalDateTime.now());
        var second = new PreparationItemRow(12L, "item-2", 12L, "order-2", "session-1", null, null,
                "An", 9L, "Mì cay", 3, 0, 1, LocalDateTime.now());
        when(mapper.findPreparationItemsBySessionForUpdate(2L, "session-1"))
                .thenReturn(List.of(first, second));
        var result = service.completeSession(operator, "session-1", "key", UUID.randomUUID());
        assertThat(result.completedQuantity()).isEqualTo(3);
        verify(mapper).addPreparedQuantity(11L, 1, true);
        verify(mapper).addPreparedQuantity(12L, 2, true);
        verify(mapper).insertPreparationTableCompletion(any(), eq(2L), eq(7L), eq("key"), any(),
                any(), eq(3L));
    }

    @Test
    void completesRemainingItemsAfterPaymentRequestOrConfirmation() {
        for (String status : List.of("PAYMENT_PENDING", "CLOSED")) {
            String sessionId = "session-" + status;
            when(sessions.requireForPreparationUpdate(sessionId))
                    .thenReturn(new SalesSessionLookup(7L, null, 2L, null, sessionId, status));
            var item = new PreparationItemRow(11L, "item-1", 11L, "order-1", sessionId, null, null,
                    "An", 9L, "Mì cay", 2, 1, 0, LocalDateTime.now());
            when(mapper.findPreparationItemsBySessionForUpdate(2L, sessionId))
                    .thenReturn(List.of(item));
            assertThat(service.completeSession(operator, sessionId, status, UUID.randomUUID())
                    .completedQuantity()).isEqualTo(1);
        }
    }

    @Test
    void replaysTheSameSessionAndRejectsOtherOrLegacySessionKeys() {
        var snapshot = "[{\"orderItemId\":11,\"orderItemPublicId\":\"item-1\",\"orderId\":\"order-1\",\"tableCode\":null,\"quantity\":1}]";
        when(mapper.findPreparationTableCompletion(2L, "key")).thenReturn(
                new StoredPreparationTableCompletion("session-1", "fingerprint", snapshot));
        assertThat(service.completeSession(operator, "session-1", "key", UUID.randomUUID())
                .completedQuantity()).isEqualTo(1);
        assertThatThrownBy(
                () -> service.completeSession(operator, "session-2", "key", UUID.randomUUID()))
                .isInstanceOf(vn.cas.common.exception.ApiException.class);
        when(mapper.findPreparationTableCompletion(2L, "legacy"))
                .thenReturn(new StoredPreparationTableCompletion(null, "fingerprint", snapshot));
        assertThatThrownBy(
                () -> service.completeSession(operator, "session-1", "legacy", UUID.randomUUID()))
                .isInstanceOf(vn.cas.common.exception.ApiException.class);
    }

    @Test
    void rejectsSessionsFromAnotherStore() {
        when(sessions.requireForPreparationUpdate("other-session"))
                .thenReturn(new SalesSessionLookup(7L, null, 3L, null, "other-session", "OPEN"));
        assertThatThrownBy(
                () -> service.completeSession(operator, "other-session", "key", UUID.randomUUID()))
                .isInstanceOf(vn.cas.common.exception.ApiException.class);
        verify(mapper, org.mockito.Mockito.never()).findPreparationItemsBySessionForUpdate(
                org.mockito.ArgumentMatchers.anyLong(), any());
    }

    private static PreparationItemRow item(long id, String publicId, String orderId, int tableCode,
            int quantity, LocalDateTime createdAt) {
        return new PreparationItemRow(id, publicId, id, orderId, "session-" + tableCode, id,
                tableCode, "Khách", 9L, "Mì cay", quantity, 0, 0, createdAt);
    }
}
