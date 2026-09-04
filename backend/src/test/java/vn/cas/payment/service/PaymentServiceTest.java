package vn.cas.payment.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.service.AuditLogService;
import vn.cas.ordering.mapper.OrderingMapper;
import vn.cas.ordering.service.CustomerOrderingService;
import vn.cas.payment.mapper.PaymentMapper;
import vn.cas.payment.model.PaymentView;
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

    private static CustomerTableSessionLookup session(String status) {
        return new CustomerTableSessionLookup(10L, 20L, 3L, 5L, "session-1", status);
    }

    private static PaymentView payment(String status) {
        return new PaymentView(1L, "payment-1", 10L, 5L, BigDecimal.valueOf(170000), "{}", status,
                null, null);
    }
}
