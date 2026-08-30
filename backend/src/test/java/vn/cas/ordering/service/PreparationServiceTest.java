package vn.cas.ordering.service;

import static org.assertj.core.api.Assertions.assertThat;
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
import vn.cas.store.service.LongWaitWarningSettingService;

class PreparationServiceTest {

    private static final String EMPTY_OPTIONS_HASH = "e3b0c44298fc1c149afbf4c8996fb924"
            + "27ae41e4649b934ca495991b7852b855";

    private final OrderingMapper mapper = mock(OrderingMapper.class);
    private final PreparationService service = new PreparationService(mapper,
            mock(LongWaitWarningSettingService.class), mock(AuditLogService.class),
            new ObjectMapper());
    private final OperationalPrincipal operator = new OperationalPrincipal(3L, 2L, "firebase",
            "Operator One", "OPERATOR");

    @Test
    void shouldAllocateBatchCompletionInFifoOrder() {
        var first = item(11L, "item-1", "order-1", 1, 2, LocalDateTime.of(2026, 8, 30, 9, 0));
        var second = item(12L, "item-2", "order-2", 2, 3, LocalDateTime.of(2026, 8, 30, 9, 1));
        when(mapper.findPreparationItemsForUpdate(2L, 9L)).thenReturn(List.of(first, second));
        when(mapper.findPreparationOptions(List.of(11L, 12L))).thenReturn(List.of());
        when(mapper.lastInsertId()).thenReturn(99L);

        var result = service.complete(operator, "9-" + EMPTY_OPTIONS_HASH, "batch-key", 4,
                UUID.randomUUID());

        assertThat(result.remainingQuantity()).isEqualTo(1);
        assertThat(result.allocations()).extracting(PreparationService.Allocation::quantity)
                .containsExactly(2, 2);
        verify(mapper).addPreparedQuantity(11L, 2);
        verify(mapper).addPreparedQuantity(12L, 2);
        verify(mapper).insertPreparationBatchCompletion(any(), eq(2L), eq(9L),
                eq(EMPTY_OPTIONS_HASH), eq("batch-key"), any(), eq(4), any(), eq(3L));
    }

    private static PreparationItemRow item(long id, String publicId, String orderId, int tableCode,
            int quantity, LocalDateTime createdAt) {
        return new PreparationItemRow(id, publicId, id, orderId, id, tableCode, 9L, "Mì cay",
                quantity, 0, 0, createdAt);
    }
}
