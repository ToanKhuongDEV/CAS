package vn.cas.ordering.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.ordering.service.PreparationService;

class PreparationControllerTest {

    private final PreparationService service = mock(PreparationService.class);
    private final PreparationController controller = new PreparationController(service);
    private final OperationalPrincipal operator = new OperationalPrincipal(3L, 2L, "firebase",
            "Operator One", "OPERATOR");

    @Test
    void shouldReturnPendingPreparationTableCount() {
        when(service.pendingTableCount(operator)).thenReturn(4);

        var response = controller.pendingTableCount(operator, new MockHttpServletRequest());

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().data()).isEqualTo(4);
    }
}
