package vn.cas.operation.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.model.OperatorDashboardSummary;
import vn.cas.operation.service.OperatorDashboardService;

class OperatorDashboardControllerTest {
    private final OperatorDashboardService service = mock(OperatorDashboardService.class);
    private final OperatorDashboardController controller = new OperatorDashboardController(service);
    private final OperationalPrincipal operator = new OperationalPrincipal(2L, 3L, "uid",
            "Operator", "OPERATOR");

    @Test
    void shouldReturnDashboardSummary() {
        OperatorDashboardSummary expected = new OperatorDashboardSummary(8, 12, 20, 3);
        when(service.summary(operator)).thenReturn(expected);

        var response = controller.summary(operator, new MockHttpServletRequest());

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().data()).isEqualTo(expected);
    }
}
