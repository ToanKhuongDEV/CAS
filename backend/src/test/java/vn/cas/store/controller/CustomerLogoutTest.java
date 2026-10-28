package vn.cas.store.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import vn.cas.store.service.SalesSessionService;
import vn.cas.store.service.StoreSettingsService;
import vn.cas.common.exception.ApiException;

class CustomerLogoutTest {
    @Test
    void clearsCustomerCookieWithoutChangingSession() {
        var sessions = mock(SalesSessionService.class);
        var stores = mock(StoreSettingsService.class);
        var controller = new CustomerSalesSessionController(sessions, stores);
        var request = new MockHttpServletRequest();
        var response = new MockHttpServletResponse();

        assertThat(controller.logout(null, request, response).getStatusCode().value())
                .isEqualTo(200);
        assertThat(response.getHeader("Set-Cookie")).contains("cas_customer_session=", "Max-Age=0",
                "Path=/api/v1/customer", "HttpOnly");
        verify(sessions).logout(null);
        verifyNoInteractions(stores);
    }

    @Test
    void retainsCookieWhenSessionCannotLogout() {
        var sessions = mock(SalesSessionService.class);
        doThrow(new ApiException(HttpStatus.CONFLICT, "Chưa thanh toán")).when(sessions)
                .logout("session");
        var controller = new CustomerSalesSessionController(sessions,
                mock(StoreSettingsService.class));
        var response = new MockHttpServletResponse();
        org.assertj.core.api.Assertions
                .assertThatThrownBy(
                        () -> controller.logout("session", new MockHttpServletRequest(), response))
                .isInstanceOf(ApiException.class);
        assertThat(response.getHeader("Set-Cookie")).isNull();
    }
}
