package vn.cas.store.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import vn.cas.common.contract.ApiMessages;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;
import vn.cas.store.application.LongWaitWarningSettingService;
import vn.cas.store.domain.LongWaitWarningSetting;

class LongWaitWarningSettingControllerTest {

    private final LongWaitWarningSettingService settingService = mock(LongWaitWarningSettingService.class);
    private final LongWaitWarningSettingController controller = new LongWaitWarningSettingController(settingService);
    private final OperationalPrincipal principal = new OperationalPrincipal(
            7L,
            2L,
            "firebase-user-1",
            "Admin One",
            "ADMIN");

    @Test
    void shouldReturnConfiguredLongWaitWarningMinutes() {
        when(settingService.get(2L)).thenReturn(new LongWaitWarningSetting(25));
        var request = requestWithId();

        var response = controller.get(principal, request);

        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo(ApiMessages.LONG_WAIT_WARNING_SETTING_RETRIEVED);
        assertThat(response.getBody().data().longWaitWarningMinutes()).isEqualTo(25);
    }

    @Test
    void shouldReturnUpdatedLongWaitWarningMinutes() {
        when(settingService.update(any(), any(Integer.class), any())).thenReturn(new LongWaitWarningSetting(0));
        var request = requestWithId();

        var response = controller.update(
                principal,
                new LongWaitWarningSettingController.UpdateLongWaitWarningSettingRequest(0),
                request);

        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo(ApiMessages.LONG_WAIT_WARNING_SETTING_UPDATED);
        assertThat(response.getBody().data().longWaitWarningMinutes()).isZero();
    }

    private MockHttpServletRequest requestWithId() {
        var request = new MockHttpServletRequest();
        request.setAttribute(RequestId.ATTRIBUTE_NAME, UUID.randomUUID());
        return request;
    }
}
