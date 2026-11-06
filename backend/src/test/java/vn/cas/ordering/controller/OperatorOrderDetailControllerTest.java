package vn.cas.ordering.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.ordering.service.CustomerOrderingService;

class OperatorOrderDetailControllerTest {

    private final CustomerOrderingService orders = mock(CustomerOrderingService.class);
    private final OperatorOrderDetailController controller = new OperatorOrderDetailController(
            orders);

    @Test
    void shouldReturnOrderDetailForOperator() {
        var principal = new OperationalPrincipal(7L, 2L, "firebase-user-1", "Operator One",
                "OPERATOR");
        var detail = new CustomerOrderingService.OrderDetail("order-1", "ORD-001",
                new BigDecimal("55000.00"), new BigDecimal("55000.00"), null, LocalDateTime.now(),
                List.of());
        when(orders.getForOperator(principal, "order-1"))
                .thenReturn(new CustomerOrderingService.OperatorOrderDetail(5L, "Nguyễn An",
                        "0901234567", detail));

        var response = controller.get(principal, "order-1", new MockHttpServletRequest());

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().data().tableCode()).isEqualTo(5L);
        assertThat(response.getBody().data().customerPhone()).isEqualTo("0901234567");
        assertThat(response.getBody().data().order().orderNumber()).isEqualTo("ORD-001");
    }
}
