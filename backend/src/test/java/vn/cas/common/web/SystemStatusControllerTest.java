package vn.cas.common.web;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class SystemStatusControllerTest {

    @Test
    void shouldReturnApplicationStatusInVietnamTimezone() {
        var controller = new SystemStatusController("cas-backend");

        var response = controller.getStatus();

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().service()).isEqualTo("cas-backend");
        assertThat(response.getBody().status()).isEqualTo("UP");
        assertThat(response.getBody().timestamp().getOffset().getTotalSeconds()).isEqualTo(7 * 60 * 60);
    }
}
