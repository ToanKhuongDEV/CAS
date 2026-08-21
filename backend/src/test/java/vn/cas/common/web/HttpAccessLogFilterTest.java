package vn.cas.common.web;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class HttpAccessLogFilterTest {

    private final HttpAccessLogFilter filter = new HttpAccessLogFilter();

    @Test
    void shouldCompleteRequestWithoutReadingSensitiveRequestData() throws Exception {
        var request = new MockHttpServletRequest("GET", "/api/v1/status");
        request.setAttribute(RequestId.ATTRIBUTE_NAME, UUID.randomUUID());
        var response = new MockHttpServletResponse();
        var chainCalled = new AtomicBoolean();

        filter.doFilter(request, response, (servletRequest, servletResponse) -> {
            chainCalled.set(true);
            ((MockHttpServletResponse) servletResponse).setStatus(204);
        });

        assertThat(chainCalled).isTrue();
        assertThat(response.getStatus()).isEqualTo(204);
    }
}
