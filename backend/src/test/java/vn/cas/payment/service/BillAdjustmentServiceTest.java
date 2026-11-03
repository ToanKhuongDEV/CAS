package vn.cas.payment.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.service.AuditLogService;
import vn.cas.ordering.service.CustomerOrderingService;
import vn.cas.payment.mapper.BillAdjustmentMapper;
import vn.cas.payment.mapper.PaymentMapper;
import vn.cas.payment.model.BillAdjustment;
import vn.cas.promotion.service.PromotionService;
import vn.cas.store.model.SalesSessionLookup;
import vn.cas.store.service.SalesSessionService;

class BillAdjustmentServiceTest {
    private final BillAdjustmentMapper mapper = mock(BillAdjustmentMapper.class);
    private final PaymentMapper payments = mock(PaymentMapper.class);
    private final SalesSessionService sessions = mock(SalesSessionService.class);
    private final CustomerOrderingService orders = mock(CustomerOrderingService.class);
    private final PromotionService promotions = mock(PromotionService.class);
    private final AuditLogService audit = mock(AuditLogService.class);
    private final BillAdjustmentService service = new BillAdjustmentService(mapper, payments,
            sessions, orders, promotions, audit, new ObjectMapper());
    private final OperationalPrincipal operator = new OperationalPrincipal(1, 3, "uid", "Name",
            "OPERATOR");

    @Test
    void appliesAdjustmentsAfterDiscountAndClampsAtZero() {
        var increase = new BillAdjustment("one", "INCREASE", new BigDecimal("40"), "Đền đồ", null);
        var decrease = new BillAdjustment("two", "DECREASE", new BigDecimal("150"), "Giảm", null);
        assertThat(BillAdjustmentService.total(new BigDecimal("90"), List.of(increase)))
                .isEqualByComparingTo("130");
        assertThat(BillAdjustmentService.total(new BigDecimal("90"), List.of(increase, decrease)))
                .isEqualByComparingTo("0");
    }

    @Test
    void rejectsOperatorEditAndExcessiveDecrease() {
        assertThatThrownBy(() -> service.delete(operator, "s", "a"))
                .isInstanceOf(ApiException.class);
        var session = new SalesSessionLookup(1L, 2L, 3, 4L, "s", "OPEN");
        when(sessions.requireCurrentForUpdate("s")).thenReturn(session);
        when(mapper.findBySessionId(1)).thenReturn(List.of());
        when(orders.currentBill("s")).thenReturn(new CustomerOrderingService.Bill(4L, "OPEN",
                new BigDecimal("90"), new BigDecimal("90"), List.of()));
        assertThatThrownBy(() -> service.add(operator, "s", UUID.randomUUID(), "DECREASE",
                new BigDecimal("91"), "Giảm")).isInstanceOf(ApiException.class)
                .hasMessageContaining("vượt");
        verify(mapper, never()).insert(any(), anyLong(), any(), any(), any(), anyLong());
    }
}
