package vn.cas.operation.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.mapper.AdminDashboardMapper;
import vn.cas.operation.model.AdminDashboard;

class AdminDashboardServiceTest {
    private final AdminDashboardMapper dashboard = mock(AdminDashboardMapper.class);
    private final AdminDashboardService service = new AdminDashboardService(dashboard);
    private final OperationalPrincipal admin = new OperationalPrincipal(2L, 3L, "uid", "Admin",
            "ADMIN");

    @Test
    void shouldReturnDashboardForCurrentStoreAndInclusiveDateRange() {
        LocalDate from = LocalDate.of(2026, 10, 1);
        LocalDate to = LocalDate.of(2026, 10, 10);
        when(dashboard.findRevenueSummary(eq(3L), any(), any()))
                .thenReturn(new AdminDashboard.RevenueSummary(BigDecimal.valueOf(120000), 2));
        when(dashboard.findRevenueSeries(eq(3L), any(), any())).thenReturn(List.of());
        when(dashboard.findCustomerSummary(eq(3L), any(), any()))
                .thenReturn(new AdminDashboard.CustomerSummary(BigDecimal.valueOf(12.5)));
        when(dashboard.findCustomerSeries(eq(3L), any(), any())).thenReturn(List.of());
        when(dashboard.findMenuItems(eq(3L), any(), any())).thenReturn(List
                .of(new AdminDashboard.MenuItem(1L, "Mì cay", 4, BigDecimal.valueOf(100000), 1)));
        when(dashboard.findPromotionSummary(eq(3L), any(), any()))
                .thenReturn(new AdminDashboard.PromotionSummary(BigDecimal.valueOf(10000), 1));
        when(dashboard.findPromotionStatusCounts(3L))
                .thenReturn(new AdminDashboard.PromotionStatusCounts(1, 2, 3, 4));

        var result = service.summary(admin, from, to);

        assertThat(result.range()).isEqualTo(new AdminDashboard.DateRange(from, to));
        assertThat(result.revenue().paidSessionCount()).isEqualTo(2);
        assertThat(result.customers().averageWaitMinutes()).isEqualByComparingTo("12.5");
        assertThat(result.menu().soldQuantity()).isEqualTo(4);
        assertThat(result.menu().remadeQuantity()).isEqualTo(1);
        assertThat(result.promotions().usageRate()).isEqualByComparingTo("50.0");
        verify(dashboard).findRevenueSummary(3L, from.atStartOfDay(),
                to.plusDays(1).atStartOfDay());
    }

    @Test
    void shouldRejectInvertedDateRange() {
        assertThatThrownBy(
                () -> service.summary(admin, LocalDate.of(2026, 10, 2), LocalDate.of(2026, 10, 1)))
                .isInstanceOf(ApiException.class);
    }
}
