package vn.cas.notification.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;
import vn.cas.notification.model.SystemNotification;
import vn.cas.notification.service.SystemNotificationService;

class SystemNotificationControllerTest {
    private final SystemNotificationService service = mock(SystemNotificationService.class);
    private final SystemNotificationController controller = new SystemNotificationController(
            service);
    private final OperationalPrincipal principal = new OperationalPrincipal(7L, 2L,
            "firebase-admin-1", "Admin One", "ADMIN");

    @Test
    void shouldCreateNotification() {
        var notification = new SystemNotification(12L, "Bảo trì", "Tạm dừng phục vụ", "WARNING",
                "BOTH", LocalDateTime.now(), LocalDateTime.now());
        when(service.create(any(), any(), any(), any(), any(), any())).thenReturn(notification);

        var response = controller.create(principal,
                new SystemNotificationController.CreateSystemNotificationRequest("Bảo trì",
                        "Tạm dừng phục vụ", "WARNING", "BOTH"),
                requestWithId());

        assertThat(response.getStatusCodeValue()).isEqualTo(201);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().message()).isEqualTo(ApiMessages.NOTIFICATION_CREATED);
        assertThat(response.getBody().data().id()).isEqualTo(12L);
        verify(service).create(any(), any(), any(), any(), any(), any());
    }

    @Test
    void shouldListAdminNotifications() {
        when(service.listForAdmin(principal)).thenReturn(List.of());

        var response = controller.listAdmin(principal, requestWithId());

        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().data()).isEmpty();
    }

    private MockHttpServletRequest requestWithId() {
        var request = new MockHttpServletRequest();
        request.setAttribute(RequestId.ATTRIBUTE_NAME, UUID.randomUUID());
        return request;
    }
}
