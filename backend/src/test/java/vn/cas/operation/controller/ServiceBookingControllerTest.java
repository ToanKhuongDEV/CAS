package vn.cas.operation.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.model.ServiceBookingView;
import vn.cas.operation.service.ServiceBookingService;

class ServiceBookingControllerTest {
    private final ServiceBookingService service = mock(ServiceBookingService.class);
    private final ServiceBookingController controller = new ServiceBookingController(service);
    private final OperationalPrincipal operator = new OperationalPrincipal(2L, 3L, "uid",
            "Operator", "OPERATOR");

    @Test
    void shouldReturnBookingsForCurrentStore() {
        ServiceBookingView booking = new ServiceBookingView(9L, "booking-1", "Khach A",
                "0901234567", "Dat tiec", null, BigDecimal.TEN, "PAY_LATER", "Operator", null, null,
                LocalDateTime.of(2026, 9, 10, 10, 0));
        when(service.findAll(operator)).thenReturn(List.of(booking));

        var response = controller.findAll(operator, new MockHttpServletRequest());

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().data()).containsExactly(booking);
    }
}
