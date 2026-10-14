package vn.cas.operation.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.model.AdminDashboard;
import vn.cas.operation.service.AdminDashboardService;

class AdminDashboardControllerTest {
    private final AdminDashboardService service = mock(AdminDashboardService.class);
    private final AdminDashboardController controller = new AdminDashboardController(service);
    private final OperationalPrincipal admin = new OperationalPrincipal(2L, 3L, "uid", "Admin",
            "ADMIN");

    @Test
    void shouldReturnDashboard() {
        LocalDate from = LocalDate.of(2026, 10, 1);
        LocalDate to = LocalDate.of(2026, 10, 10);
        AdminDashboard expected = new AdminDashboard(new AdminDashboard.DateRange(from, to),
                new AdminDashboard.Revenue(BigDecimal.ZERO, 0, List.of()),
                new AdminDashboard.Customers(0, null, List.of()),
                new AdminDashboard.Menu(0, 0, List.of()),
                new AdminDashboard.Promotions(BigDecimal.ZERO, 0, BigDecimal.ZERO,
                        new AdminDashboard.PromotionStatusCounts(0, 0, 0, 0)));
        when(service.summary(admin, from, to)).thenReturn(expected);

        var response = controller.summary(admin, from, to, new MockHttpServletRequest());

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().data()).isEqualTo(expected);
    }
}
