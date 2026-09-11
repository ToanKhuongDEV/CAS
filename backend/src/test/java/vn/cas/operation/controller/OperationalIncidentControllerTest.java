package vn.cas.operation.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;
import vn.cas.operation.model.OperationalIncident;
import vn.cas.operation.service.OperationalIncidentService;

class OperationalIncidentControllerTest {
    private final OperationalIncidentService service = mock(OperationalIncidentService.class);
    private final OperationalIncidentController controller = new OperationalIncidentController(
            service);
    private final OperationalPrincipal operator = new OperationalPrincipal(2L, 3L, "uid",
            "Operator", "OPERATOR");

    @Test
    void shouldCreateIncident() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setAttribute(RequestId.ATTRIBUTE_NAME, UUID.randomUUID());
        when(service.create(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.any()))
                .thenReturn(incident());

        var response = controller.create(operator,
                new OperationalIncidentController.CreateOperationalIncidentRequest("Operator",
                        "Máy in bị kẹt giấy."),
                request);

        assertThat(response.getStatusCode().value()).isEqualTo(201);
        assertThat(response.getBody().data()).isEqualTo(incident());
    }

    @Test
    void shouldReturnAllIncidentsForAdminStore() {
        when(service.findAllForAdmin(operator)).thenReturn(List.of(incident()));

        var response = controller.findAllForAdmin(operator, new MockHttpServletRequest());

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().data()).containsExactly(incident());
    }

    private static OperationalIncident incident() {
        return new OperationalIncident("incident-1", "Operator", "Máy in bị kẹt giấy.",
                LocalDateTime.of(2026, 9, 11, 10, 0));
    }
}
