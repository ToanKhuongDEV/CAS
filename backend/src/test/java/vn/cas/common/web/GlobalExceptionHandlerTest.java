package vn.cas.common.web;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void shouldReturnApprovedErrorShape() {
        UUID requestId = UUID.randomUUID();
        var request = new MockHttpServletRequest("POST", "/api/v1/example");
        request.setAttribute(RequestId.ATTRIBUTE_NAME, requestId);

        var response = handler.handleApiException(
                new ApiException(HttpStatus.CONFLICT, "Request payload differs"),
                request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo("Request payload differs");
        assertThat(response.getBody().requestId()).isEqualTo(requestId.toString());
        assertThat(response.getBody().fieldErrors()).isEmpty();
    }
}
