package vn.cas.payment.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.service.AuditLogService;
import vn.cas.ordering.mapper.OrderingMapper;
import vn.cas.ordering.service.CustomerOrderingService;
import vn.cas.payment.mapper.PaymentMapper;
import vn.cas.payment.model.PaymentView;
import vn.cas.payment.model.UnpaidRecordView;
import vn.cas.promotion.service.PromotionService;
import vn.cas.store.mapper.DiningTableMapper;
import vn.cas.store.model.CustomerTableSessionLookup;
import vn.cas.store.service.CustomerTableSessionService;

class PaymentServiceTest {

    private final PaymentMapper payments = mock(PaymentMapper.class);
    private final CustomerTableSessionService sessions = mock(CustomerTableSessionService.class);
    private final DiningTableMapper tables = mock(DiningTableMapper.class);
    private final CustomerOrderingService orders = mock(CustomerOrderingService.class);
    private final OrderingMapper ordering = mock(OrderingMapper.class);
    private final AuditLogService auditLogs = mock(AuditLogService.class);
    private final PaymentService service = new PaymentService(payments, sessions, tables, orders,
            ordering, auditLogs, new ObjectMapper());

    @Test
    void shouldRejectPaymentForSessionThatIsNotOpen() {
        when(sessions.requireCurrentForUpdate("session-1")).thenReturn(session("PAYMENT_PENDING"));

        assertThatThrownBy(() -> service.create("session-1")).isInstanceOf(ApiException.class);

        verify(orders, never()).currentBill(any());
    }

    @Test
    void shouldRejectPaymentWhileCancellationIsPending() {
        when(sessions.requireCurrentForUpdate("session-1")).thenReturn(session("OPEN"));
        when(ordering.hasPendingCancellationRequests(10L)).thenReturn(true);

        assertThatThrownBy(() -> service.create("session-1")).isInstanceOf(ApiException.class);

        verify(orders, never()).currentBill(any());
    }

    @Test
    void shouldCreatePendingPaymentForZeroAmountBill() {
        when(sessions.requireCurrentForUpdate("session-1")).thenReturn(session("OPEN"));
        when(orders.currentBill("session-1")).thenReturn(new CustomerOrderingService.Bill(5L,
                "OPEN", BigDecimal.valueOf(100_000), BigDecimal.ZERO, List.of()));

        service.create("session-1");

        verify(payments).insert(any(), org.mockito.ArgumentMatchers.eq(10L),
                org.mockito.ArgumentMatchers.eq(BigDecimal.ZERO), any());
        verify(tables).moveSessionToPaymentPending(10L);
    }

    @Test
    void shouldResolveUnpaidRecordCloseSessionAndAuditWhenConfirming() {
        var pending = payment("PENDING");
        var confirmed = payment("PAID");
        var principal = new OperationalPrincipal(2L, 3L, "firebase-uid", "Operator One",
                "OPERATOR");
        when(payments.findByPublicId(3L, "payment-1")).thenReturn(pending, confirmed);
        when(payments.confirm(1L, 2L, "Operator One")).thenReturn(1);

        service.confirm(principal, "payment-1");

        verify(payments).resolveOpenUnpaidRecord(10L, 1L);
        verify(tables).closePaymentSession(10L);
        verify(auditLogs).record(any());
    }

    @Test
    void shouldNotRepeatSideEffectsWhenPaymentIsAlreadyPaid() {
        var principal = new OperationalPrincipal(2L, 3L, "firebase-uid", "Operator One",
                "OPERATOR");
        when(payments.findByPublicId(3L, "payment-1")).thenReturn(payment("PAID"));

        service.confirm(principal, "payment-1");

        verify(payments, never()).confirm(any(Long.class), any(Long.class), any());
        verify(tables, never()).closePaymentSession(any(Long.class));
        verify(auditLogs, never()).record(any());
    }

    @Test
    void shouldNotRedeemPromotionWhenCollectingRecordedUnpaidPayment() {
        var promotions = mock(PromotionService.class);
        var serviceWithPromotions = new PaymentService(payments, sessions, tables, orders, ordering,
                auditLogs, new ObjectMapper(), promotions);
        var principal = new OperationalPrincipal(2L, 3L, "firebase-uid", "Operator One",
                "OPERATOR");
        var unpaidPayment = new PaymentView(1L, "payment-1", 10L, 5L, BigDecimal.valueOf(200000),
                "{\"discount\":null}", "PENDING", null, null, LocalDateTime.of(2026, 9, 4, 15, 0));
        when(payments.findByPublicId(3L, "payment-1")).thenReturn(unpaidPayment, payment("PAID"));
        when(payments.hasOpenUnpaidRecord(10L)).thenReturn(true);
        when(payments.confirm(1L, 2L, "Operator One")).thenReturn(1);

        serviceWithPromotions.confirm(principal, "payment-1");

        verify(promotions, never()).redeem(org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void shouldRemovePromotionFromLegacyRecordedUnpaidPaymentBeforeCollecting() {
        var promotions = mock(PromotionService.class);
        var serviceWithPromotions = new PaymentService(payments, sessions, tables, orders, ordering,
                auditLogs, new ObjectMapper(), promotions);
        var principal = new OperationalPrincipal(2L, 3L, "firebase-uid", "Operator One",
                "OPERATOR");
        var discountedUnpaidPayment = new PaymentView(1L, "payment-1", 10L, 5L,
                BigDecimal.valueOf(170000),
                "{\"bill\":{\"payableAmount\":200000},\"discount\":{\"amount\":30000}}", "PENDING",
                null, null, LocalDateTime.of(2026, 9, 4, 15, 0));
        when(payments.findByPublicId(3L, "payment-1")).thenReturn(discountedUnpaidPayment,
                payment("PAID"));
        when(payments.hasOpenUnpaidRecord(10L)).thenReturn(true);
        when(payments.removePendingPaymentDiscount(org.mockito.ArgumentMatchers.anyLong(),
                org.mockito.ArgumentMatchers.any(BigDecimal.class),
                org.mockito.ArgumentMatchers.anyString())).thenReturn(1);
        when(payments.removeOpenUnpaidRecordDiscount(org.mockito.ArgumentMatchers.anyLong(),
                org.mockito.ArgumentMatchers.any(BigDecimal.class),
                org.mockito.ArgumentMatchers.anyString())).thenReturn(1);
        when(payments.confirm(1L, 2L, "Operator One")).thenReturn(1);

        serviceWithPromotions.confirm(principal, "payment-1");

        verify(payments).removePendingPaymentDiscount(org.mockito.ArgumentMatchers.eq(1L),
                org.mockito.ArgumentMatchers.eq(BigDecimal.valueOf(200000)),
                org.mockito.ArgumentMatchers.contains("\"discount\":null"));
        verify(payments).removeOpenUnpaidRecordDiscount(org.mockito.ArgumentMatchers.eq(10L),
                org.mockito.ArgumentMatchers.eq(BigDecimal.valueOf(200000)),
                org.mockito.ArgumentMatchers.contains("\"discount\":null"));
        verify(promotions, never()).redeem(org.mockito.ArgumentMatchers.anyLong());
    }

    @Test
    void shouldCountOnlyPendingPaymentsForOperatorsStore() {
        var principal = new OperationalPrincipal(2L, 3L, "firebase-uid", "Operator One",
                "OPERATOR");
        when(payments.countPending(3L)).thenReturn(2L);

        assertThat(service.pendingCount(principal)).isEqualTo(2L);

        verify(payments).countPending(3L);
    }

    @Test
    void shouldFindOnlyTodaysPaidPaymentsForOperatorsStore() {
        var principal = new OperationalPrincipal(2L, 3L, "firebase-uid", "Operator One",
                "OPERATOR");

        service.paidToday(principal);

        verify(payments).findPaidBetween(org.mockito.ArgumentMatchers.eq(3L),
                argThat(start -> start.toLocalDate().equals(java.time.LocalDate.now())),
                argThat(end -> end.toLocalDate().equals(java.time.LocalDate.now().plusDays(1))));
    }

    @Test
    void shouldRecordUnpaidUsingExistingPendingPaymentCloseSessionAndAudit() {
        var principal = new OperationalPrincipal(2L, 3L, "firebase-uid", "Operator One",
                "OPERATOR");
        var recorded = new UnpaidRecordView("unpaid-1", "session-1", 5L, BigDecimal.valueOf(170000),
                "{}", "OPEN", "Customer left", "Operator One", "payment-1", null,
                LocalDateTime.now());
        when(sessions.requireCurrentForUpdate("session-1")).thenReturn(session("OPEN"));
        when(tables.hasOrders(10L)).thenReturn(true);
        when(ordering.hasPendingCancellationRequests(10L)).thenReturn(false);
        when(payments.findBySessionId(10L)).thenReturn(payment("PENDING"));
        when(payments.insertUnpaidRecord(any(), org.mockito.ArgumentMatchers.eq(10L),
                org.mockito.ArgumentMatchers.eq(BigDecimal.valueOf(170000)),
                org.mockito.ArgumentMatchers.eq("{}"),
                org.mockito.ArgumentMatchers.eq("Customer left"),
                org.mockito.ArgumentMatchers.eq(2L),
                org.mockito.ArgumentMatchers.eq("Operator One"))).thenReturn(1);
        when(tables.closePaymentSession(10L)).thenReturn(1);
        when(payments.findUnpaidRecordByPublicId(org.mockito.ArgumentMatchers.eq(3L), any()))
                .thenReturn(recorded);

        var result = service.recordUnpaid(principal, "session-1", " Customer left ");

        assertThat(result).isEqualTo(recorded);
        verify(tables).closePaymentSession(10L);
        verify(auditLogs).record(any());
    }

    @Test
    void shouldRemovePromotionBeforeRecordingUnpaidPayment() {
        var promotions = mock(PromotionService.class);
        var serviceWithPromotions = new PaymentService(payments, sessions, tables, orders, ordering,
                auditLogs, new ObjectMapper(), promotions);
        var principal = new OperationalPrincipal(2L, 3L, "firebase-uid", "Operator One",
                "OPERATOR");
        var discountedPayment = new PaymentView(1L, "payment-1", 10L, 5L,
                BigDecimal.valueOf(170000), "{\"discount\":{\"amount\":30000}}", "PENDING", null,
                null, LocalDateTime.of(2026, 9, 4, 15, 0));
        var bill = new CustomerOrderingService.Bill(5L, "OPEN", BigDecimal.valueOf(200000),
                BigDecimal.valueOf(200000), List.of());
        when(sessions.requireCurrentForUpdate("session-1")).thenReturn(session("OPEN"));
        when(tables.hasOrders(10L)).thenReturn(true);
        when(ordering.hasPendingCancellationRequests(10L)).thenReturn(false);
        when(payments.findBySessionId(10L)).thenReturn(discountedPayment);
        when(orders.currentBill("session-1")).thenReturn(bill);
        when(payments.removePendingPaymentDiscount(org.mockito.ArgumentMatchers.anyLong(),
                org.mockito.ArgumentMatchers.any(BigDecimal.class),
                org.mockito.ArgumentMatchers.anyString())).thenReturn(1);
        when(payments.insertUnpaidRecord(org.mockito.ArgumentMatchers.anyString(),
                org.mockito.ArgumentMatchers.anyLong(),
                org.mockito.ArgumentMatchers.any(BigDecimal.class),
                org.mockito.ArgumentMatchers.anyString(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.anyString()))
                .thenReturn(1);
        when(tables.closePaymentSession(10L)).thenReturn(1);

        serviceWithPromotions.recordUnpaid(principal, "session-1", null);

        verify(payments).removePendingPaymentDiscount(org.mockito.ArgumentMatchers.eq(1L),
                org.mockito.ArgumentMatchers.eq(BigDecimal.valueOf(200000)),
                org.mockito.ArgumentMatchers.contains("\"discount\":null"));
        verify(promotions, never()).redeem(org.mockito.ArgumentMatchers.anyLong());
    }

    private static CustomerTableSessionLookup session(String status) {
        return new CustomerTableSessionLookup(10L, 20L, 3L, 5L, "session-1", status);
    }

    private static PaymentView payment(String status) {
        return new PaymentView(1L, "payment-1", 10L, 5L, BigDecimal.valueOf(170000), "{}", status,
                null, null, LocalDateTime.of(2026, 9, 4, 15, 0));
    }
}
