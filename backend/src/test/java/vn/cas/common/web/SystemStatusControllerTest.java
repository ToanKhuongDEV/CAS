package vn.cas.common.web;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

class SystemStatusControllerTest {

    @Test
    void shouldReturnApplicationStatusInVietnamTimezone() {
        var controller = new SystemStatusController("cas-backend");
        var request = new MockHttpServletRequest();

        var response = controller.getStatus(request);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(200);
        assertThat(response.getBody().data().service()).isEqualTo("cas-backend");
        assertThat(response.getBody().data().status()).isEqualTo("UP");
        assertThat(response.getBody().data().timestamp().getOffset().getTotalSeconds())
                .isEqualTo(7 * 60 * 60);
    }
}
