package vn.cas.ordering.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import vn.cas.common.web.RequestId;
import vn.cas.ordering.service.CustomerOrderingService;

class CustomerOrderingControllerTest {

    private final CustomerOrderingService service = mock(CustomerOrderingService.class);
    private final CustomerOrderingController controller = new CustomerOrderingController(service);

    @Test
    void shouldCreateCustomerOrder() {
        when(service.create("session-1", "key-1", "Ít đá",
                List.of(new CustomerOrderingService.OrderLine(11L, 2, List.of(21L)))))
                .thenReturn(new CustomerOrderingService.CreatedOrder("order-1",
                        new BigDecimal("74000.00")));
        var request = new MockHttpServletRequest();
        request.setAttribute(RequestId.ATTRIBUTE_NAME, UUID.randomUUID());

        var response = controller.create("session-1",
                new CustomerOrderingController.CreateOrderRequest("key-1", "  Ít đá  ", List
                        .of(new CustomerOrderingController.OrderItemRequest(11L, 2, List.of(21L)))),
                request);

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().data())
                .isEqualTo(new CustomerOrderingController.OrderResponse("order-1",
                        new BigDecimal("74000.00")));
    }
}
