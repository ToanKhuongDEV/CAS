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
    void onlyAdminCanChangePaidAdjustmentsAndChangesAreAudited() {
        assertThatThrownBy(() -> service.updatePaid(operator, "p", "snapshot", List.of(), List.of(),
                List.of())).isInstanceOf(ApiException.class);
        var admin = new OperationalPrincipal(2, 3, "admin", "Admin", "ADMIN");
        var id = UUID.randomUUID();
        var before = new BillAdjustment(id.toString(), "INCREASE", new BigDecimal("40"), "Cũ",
                null);
        var after = new BillAdjustment(id.toString(), "DECREASE", new BigDecimal("150"), "Mới",
                null);
        String snapshot = "{\"bill\":{\"payableAmount\":90},\"discount\":null}";
        var payment = new vn.cas.payment.model.PaymentView(1, "p", 2, null, new BigDecimal("130"),
                snapshot, "PAID", null, null, null);
        when(payments.findByPublicId(3, "p")).thenReturn(payment);
        when(mapper.findBySessionId(2)).thenReturn(List.of(before), List.of(after));
        when(mapper.findId(2, id.toString())).thenReturn(5L);
        when(payments.updatePaidAdjustment(eq(1L), eq(BigDecimal.ZERO), anyString())).thenReturn(1);
        service.updatePaid(admin, "p", snapshot, List.of(), List.of(
                new PaymentService.AdjustmentChange(id, "DECREASE", new BigDecimal("150"), "Mới")),
                List.of());
        verify(payments).updatePaidAdjustment(eq(1L), eq(BigDecimal.ZERO), anyString());
        var command = org.mockito.ArgumentCaptor
                .forClass(vn.cas.operation.dto.AuditLogCommand.class);
        verify(audit).record(command.capture());
        assertThat(command.getValue().changeData()).contains("before", "after", "Cũ", "Mới");
        assertThatThrownBy(
                () -> service.updatePaid(admin, "p", "stale", List.of(), List.of(), List.of()))
                .isInstanceOf(ApiException.class).hasMessageContaining("đã thay đổi");
    }

    @Test
    void superAdminCanDeletePaidAdjustmentAndAuditKeepsPreviousValue() {
        var admin = new OperationalPrincipal(2, 3, "admin", "Admin", "SUPER_ADMIN");
        var id = UUID.randomUUID();
        var before = new BillAdjustment(id.toString(), "INCREASE", new BigDecimal("40"), "Phí",
                null);
        String snapshot = "{\"bill\":{\"payableAmount\":90},\"discount\":null}";
        var payment = new vn.cas.payment.model.PaymentView(1, "p", 2, null, new BigDecimal("130"),
                snapshot, "PAID", null, null, null);
        when(payments.findByPublicId(3, "p")).thenReturn(payment);
        when(mapper.findBySessionId(2)).thenReturn(List.of(before), List.of());
        when(mapper.findId(2, id.toString())).thenReturn(5L);
        when(payments.updatePaidAdjustment(eq(1L), eq(new BigDecimal("90")), anyString()))
                .thenReturn(1);
        service.updatePaid(admin, "p", snapshot, List.of(), List.of(), List.of(id));
        verify(mapper).delete(2, id.toString());
        var command = org.mockito.ArgumentCaptor
                .forClass(vn.cas.operation.dto.AuditLogCommand.class);
        verify(audit).record(command.capture());
        assertThat(command.getValue().action()).isEqualTo("BILL_ADJUSTMENT_DELETED");
        assertThat(command.getValue().changeData()).contains("Phí", "\"after\":null");
    }

    @Test
    void adminCanAddAdjustmentToPaidBillAndAuditIt() {
        var admin = new OperationalPrincipal(2, 3, "admin", "Admin", "ADMIN");
        var id = UUID.randomUUID();
        var added = new BillAdjustment(id.toString(), "INCREASE", new BigDecimal("40"), "Phí",
                null);
        String snapshot = "{\"bill\":{\"payableAmount\":90},\"discount\":null}";
        var payment = new vn.cas.payment.model.PaymentView(1, "p", 2, null, new BigDecimal("90"),
                snapshot, "PAID", null, null, null);
        when(payments.findByPublicId(3, "p")).thenReturn(payment);
        when(mapper.findBySessionId(2)).thenReturn(List.of(), List.of(added));
        when(mapper.findId(2, id.toString())).thenReturn(5L);
        when(payments.updatePaidAdjustment(eq(1L), eq(new BigDecimal("130")), anyString()))
                .thenReturn(1);
        service.updatePaid(admin, "p", snapshot, List.of(
                new PaymentService.AdjustmentChange(id, "INCREASE", new BigDecimal("40"), "Phí")),
                List.of(), List.of());
        verify(mapper).insert(id.toString(), 2L, "INCREASE", new BigDecimal("40"), "Phí", 2L);
        var command = org.mockito.ArgumentCaptor
                .forClass(vn.cas.operation.dto.AuditLogCommand.class);
        verify(audit).record(command.capture());
        assertThat(command.getValue().action()).isEqualTo("BILL_ADJUSTMENT_ADDED");
        assertThat(command.getValue().changeData()).contains("\"before\":null", "Phí");
    }
}
