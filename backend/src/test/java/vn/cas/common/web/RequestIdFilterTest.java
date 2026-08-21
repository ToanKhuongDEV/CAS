package vn.cas.common.web;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RequestIdFilterTest {

  private final RequestIdFilter filter = new RequestIdFilter();

  @Test
  void shouldPreserveValidRequestId() throws Exception {
    UUID requestId = UUID.randomUUID();
    var request = new MockHttpServletRequest();
    var response = new MockHttpServletResponse();
    request.addHeader(RequestId.HEADER_NAME, requestId.toString());
    var requestAttribute = new AtomicReference<Object>();

    filter.doFilter(
        request,
        response,
        (servletRequest, servletResponse) ->
            requestAttribute.set(servletRequest.getAttribute(RequestId.ATTRIBUTE_NAME)));

    assertThat(response.getHeader(RequestId.HEADER_NAME)).isEqualTo(requestId.toString());
    assertThat(requestAttribute.get()).isEqualTo(requestId);
  }

  @Test
  void shouldReplaceInvalidRequestId() throws Exception {
    var request = new MockHttpServletRequest();
    var response = new MockHttpServletResponse();
    request.addHeader(RequestId.HEADER_NAME, "not-a-uuid");

    filter.doFilter(request, response, (servletRequest, servletResponse) -> {});

    assertThatCodeCanBeParsedAsUuid(response.getHeader(RequestId.HEADER_NAME));
  }

  private void assertThatCodeCanBeParsedAsUuid(String value) {
    assertThat(UUID.fromString(value)).isNotNull();
  }
}
