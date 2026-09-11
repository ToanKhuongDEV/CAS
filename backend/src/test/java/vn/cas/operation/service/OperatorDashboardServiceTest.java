package vn.cas.operation.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.mapper.OperatorDashboardMapper;
import vn.cas.operation.model.OperatorDashboardSummary;

class OperatorDashboardServiceTest {
    private final OperatorDashboardMapper dashboard = mock(OperatorDashboardMapper.class);
    private final OperatorDashboardService service = new OperatorDashboardService(dashboard);
    private final OperationalPrincipal operator = new OperationalPrincipal(2L, 3L, "uid",
            "Operator", "OPERATOR");

    @Test
    void shouldReturnSummaryForCurrentStore() {
        OperatorDashboardSummary expected = new OperatorDashboardSummary(8, 12, 20, 3);
        when(dashboard.findSummary(anyLong(), any(), any())).thenReturn(expected);

        assertThat(service.summary(operator)).isEqualTo(expected);
        verify(dashboard).findSummary(org.mockito.ArgumentMatchers.eq(3L), any(), any());
    }
}
