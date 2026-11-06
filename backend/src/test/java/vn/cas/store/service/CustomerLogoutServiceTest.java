package vn.cas.store.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import org.junit.jupiter.api.Test;
import vn.cas.common.exception.ApiException;
import vn.cas.operation.service.AuditLogService;
import vn.cas.payment.mapper.PaymentMapper;
import vn.cas.payment.model.PaymentView;
import vn.cas.store.mapper.DiningTableMapper;
import vn.cas.store.model.SalesSessionLookup;

class CustomerLogoutServiceTest {
    private final DiningTableMapper tables = mock(DiningTableMapper.class);
    private final PaymentMapper payments = mock(PaymentMapper.class);
    private final SalesSessionService service = new SalesSessionService(tables,
            mock(AuditLogService.class), payments);

    private void session(String status, boolean hasOrders) {
        when(tables.findSalesSessionByPublicIdForUpdate("session"))
                .thenReturn(new SalesSessionLookup(1L, 2L, 3L, 4L, "session", status));
        when(tables.hasOrders(1L)).thenReturn(hasOrders);
    }

    @Test
    void closesOpenSessionWithoutOrders() {
        session("OPEN", false);
        when(tables.closeSessionWithoutOrders(1L)).thenReturn(1);
        service.logout("session");
        verify(tables).closeSessionWithoutOrders(1L);
        verifyNoInteractions(payments);
    }

    @Test
    void rejectsOrderWithoutPaidPaymentEvenWhenSessionClosed() {
        session("CLOSED", true);
        assertThatThrownBy(() -> service.logout("session")).isInstanceOf(ApiException.class)
                .hasMessageContaining("thanh toán đầy đủ");
        verify(tables, never()).closeSessionWithoutOrders(anyLong());
    }

    @Test
    void rejectsPendingPayment() {
        session("PAYMENT_PENDING", true);
        when(payments.findBySessionId(1L)).thenReturn(new PaymentView(1, "payment", 1, 4L,
                BigDecimal.TEN, "{}", "PENDING", null, null, null));
        assertThatThrownBy(() -> service.logout("session")).isInstanceOf(ApiException.class)
                .hasMessageContaining("thanh toán đầy đủ");
    }

    @Test
    void allowsPaidClosedSession() {
        session("CLOSED", true);
        when(payments.findBySessionId(1L)).thenReturn(new PaymentView(1, "payment", 1, 4L,
                BigDecimal.ZERO, "{}", "PAID", "operator", null, null));
        service.logout("session");
        verify(tables, never()).closeSessionWithoutOrders(anyLong());
    }
}
