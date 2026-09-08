package vn.cas.ordering.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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

    @Test
    void shouldIncludePendingCancellationQuantityInBillResponse() {
        when(service.currentBill("session-1")).thenReturn(new CustomerOrderingService.Bill(5L,
                "OPEN", new BigDecimal("55000.00"), new BigDecimal("55000.00"),
                List.of(new CustomerOrderingService.OrderDetail("order-1", "ORD-001",
                        new BigDecimal("55000.00"), new BigDecimal("55000.00"), null,
                        LocalDateTime.now(),
                        List.of(new CustomerOrderingService.OrderItemDetail("item-1", "Mỳ cay",
                                new BigDecimal("55000.00"), BigDecimal.ZERO, 1, 0, 0, 1,
                                new BigDecimal("55000.00"), List.of()))))));
        var request = new MockHttpServletRequest();
        request.setAttribute(RequestId.ATTRIBUTE_NAME, UUID.randomUUID());

        var response = controller.bill("session-1", request);

        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().data().orders().getFirst().items().getFirst()
                .pendingCancellationQuantity()).isEqualTo(1);
    }
}
