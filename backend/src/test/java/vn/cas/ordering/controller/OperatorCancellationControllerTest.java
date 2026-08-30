package vn.cas.ordering.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;
import vn.cas.ordering.service.CancellationService;

class OperatorCancellationControllerTest {

    private final CancellationService service = mock(CancellationService.class);
    private final OperatorCancellationController controller = new OperatorCancellationController(
            service);
    private final OperationalPrincipal operator = new OperationalPrincipal(3L, 2L, "firebase",
            "Operator One", "OPERATOR");

    @Test
    void shouldApproveAndTransferPreparedItem() {
        when(service.resolve(eq(operator), eq("request-1"), eq("APPROVE"), eq(false),
                eq("target-item-1"), eq(1), any(UUID.class)))
                .thenReturn(new CancellationService.Resolution("request-1", "APPROVED", 1,
                        "target-item-1", null));
        var request = new MockHttpServletRequest();
        request.setAttribute(RequestId.ATTRIBUTE_NAME, UUID.randomUUID());

        var response = controller.resolve(operator, "request-1",
                new OperatorCancellationController.ResolutionRequest("APPROVE", false,
                        "target-item-1", 1),
                request);

        assertThat(response.getStatusCode().value()).isEqualTo(200);
        assertThat(response.getBody().data().transferQuantity()).isEqualTo(1);
    }
}
