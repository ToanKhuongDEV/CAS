package vn.cas.ordering.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.ordering.mapper.OrderingMapper;
import vn.cas.ordering.model.OrderMenuItem;
import vn.cas.ordering.model.OrderOptionGroup;
import vn.cas.ordering.model.OrderOptionValue;
import vn.cas.ordering.model.StoredOrder;
import vn.cas.operation.service.AuditLogService;
import vn.cas.store.model.CustomerTableSessionLookup;
import vn.cas.store.service.CustomerTableSessionService;

class CustomerOrderingServiceTest {

    private final OrderingMapper mapper = mock(OrderingMapper.class);
    private final CustomerTableSessionService sessions = mock(CustomerTableSessionService.class);
    private final CustomerOrderingService service = new CustomerOrderingService(mapper, sessions,
            mock(AuditLogService.class));

    @Test
    void shouldCreateOrderWithServerCalculatedSnapshots() {
        currentOpenSession();
        when(mapper.findActiveMenuItem(2L, 11L)).thenReturn(
                new OrderMenuItem(11L, "Trà đào", new BigDecimal("32000.00"), "ACTIVE"));
        when(mapper.findActiveOptionGroups(2L, 11L))
                .thenReturn(List.of(new OrderOptionGroup(9L, 1, 1)));
        when(mapper.findActiveOptionValues(2L, 11L, List.of(21L))).thenReturn(
                List.of(new OrderOptionValue(21L, 9L, "Size", "L", new BigDecimal("5000.00"))));
        when(mapper.lastInsertId()).thenReturn(44L);
        when(mapper.lastInsertOrderItemId()).thenReturn(45L);

        var result = service.create("session-1", "key-1", "Ít đá",
                List.of(new CustomerOrderingService.OrderLine(11L, 2, List.of(21L))));

        assertThat(result.orderId()).isNotBlank();
        assertThat(result.payableAmount()).isEqualByComparingTo("74000.00");
        verify(mapper).insertOrderItem(any(), eq(44L), eq(11L), eq("Trà đào"),
                eq(new BigDecimal("32000.00")), eq(new BigDecimal("5000.00")), eq(2),
                eq(new BigDecimal("74000.00")));
        verify(mapper).insertOrderItemOption(eq(45L), eq(21L), eq("Size"), eq("L"),
                eq(new BigDecimal("5000.00")), eq(1), eq(new BigDecimal("10000.00")));
    }

    @Test
    void shouldReturnExistingOrderForMatchingIdempotentRequest() {
        currentOpenSession();
        var lines = List.of(new CustomerOrderingService.OrderLine(11L, 1, List.of()));
        when(mapper.findBySessionIdAndIdempotencyKey(7L, "key-1")).thenReturn(
                new StoredOrder("order-1", CustomerOrderingService.fingerprint(null, lines),
                        new BigDecimal("32000.00")));

        var result = service.create("session-1", "key-1", null, lines);

        assertThat(result).isEqualTo(
                new CustomerOrderingService.CreatedOrder("order-1", new BigDecimal("32000.00")));
        verify(mapper, never()).insertOrder(any(), anyLong(), any(), any(), any(), any(), any(),
                any());
    }

    @Test
    void shouldRejectMissingRequiredOptionBeforeCreatingOrder() {
        currentOpenSession();
        when(mapper.findActiveMenuItem(2L, 11L)).thenReturn(
                new OrderMenuItem(11L, "Trà đào", new BigDecimal("32000.00"), "ACTIVE"));
        when(mapper.findActiveOptionGroups(2L, 11L))
                .thenReturn(List.of(new OrderOptionGroup(9L, 1, 1)));

        assertThatThrownBy(() -> service.create("session-1", "key-1", null,
                List.of(new CustomerOrderingService.OrderLine(11L, 1, List.of()))))
                .isInstanceOf(ApiException.class)
                .extracting(throwable -> ((ApiException) throwable).status(), Throwable::getMessage)
                .containsExactly(org.springframework.http.HttpStatus.BAD_REQUEST,
                        ApiMessages.INVALID_REQUEST);

        verify(mapper, never()).insertOrder(any(), anyLong(), any(), any(), any(), any(), any(),
                any());
    }

    @Test
    void shouldRejectReusingIdempotencyKeyForDifferentPayload() {
        currentOpenSession();
        var originalLines = List.of(new CustomerOrderingService.OrderLine(11L, 1, List.of()));
        when(mapper.findBySessionIdAndIdempotencyKey(7L, "key-1")).thenReturn(
                new StoredOrder("order-1", CustomerOrderingService.fingerprint(null, originalLines),
                        new BigDecimal("32000.00")));

        assertThatThrownBy(() -> service.create("session-1", "key-1", null,
                List.of(new CustomerOrderingService.OrderLine(11L, 2, List.of()))))
                .isInstanceOf(ApiException.class)
                .extracting(throwable -> ((ApiException) throwable).status(), Throwable::getMessage)
                .containsExactly(org.springframework.http.HttpStatus.CONFLICT,
                        ApiMessages.INVALID_REQUEST);

        verify(mapper, never()).insertOrder(any(), anyLong(), any(), any(), any(), any(), any(),
                any());
    }

    @Test
    void shouldRecordOperatorAsOrderCreatorAndWriteAuditLog() {
        currentOpenSession();
        when(mapper.findActiveMenuItem(2L, 11L)).thenReturn(
                new OrderMenuItem(11L, "Trà đào", new BigDecimal("32000.00"), "ACTIVE"));
        when(mapper.findActiveOptionGroups(2L, 11L)).thenReturn(List.of());
        when(mapper.lastInsertId()).thenReturn(44L);
        var auditLogs = mock(AuditLogService.class);
        var operatorService = new CustomerOrderingService(mapper, sessions, auditLogs);

        operatorService.createForOperator(
                new OperationalPrincipal(3L, 2L, "firebase-uid", "Operator One", "OPERATOR"),
                "session-1", "key-1", null,
                List.of(new CustomerOrderingService.OrderLine(11L, 1, List.of())),
                UUID.randomUUID());

        verify(mapper).insertOrder(any(), eq(7L), eq(3L), eq("key-1"), any(), any(), any(), any());
        verify(auditLogs).record(any());
    }

    @Test
    void shouldRejectOperatorOrderForAnotherStoreSession() {
        currentOpenSession();

        var auditLogs = mock(AuditLogService.class);
        var operatorService = new CustomerOrderingService(mapper, sessions, auditLogs);

        assertThatThrownBy(
                () -> operatorService.createForOperator(
                        new OperationalPrincipal(3L, 8L, "firebase-uid", "Operator One",
                                "OPERATOR"),
                        "session-1", "key-1", null,
                        List.of(new CustomerOrderingService.OrderLine(11L, 1, List.of())),
                        UUID.randomUUID()))
                .isInstanceOf(ApiException.class)
                .extracting(throwable -> ((ApiException) throwable).status())
                .isEqualTo(org.springframework.http.HttpStatus.FORBIDDEN);
    }

    private void currentOpenSession() {
        when(sessions.requireCurrentForUpdate("session-1"))
                .thenReturn(new CustomerTableSessionLookup(7L, 9L, 2L, 5L, "session-1", "OPEN"));
    }
}
