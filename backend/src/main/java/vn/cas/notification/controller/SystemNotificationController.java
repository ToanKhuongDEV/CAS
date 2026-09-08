package vn.cas.notification.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;
import vn.cas.notification.model.SystemNotification;
import vn.cas.notification.service.SystemNotificationService;
import vn.cas.store.controller.CustomerTableSessionController;

@RestController
public class SystemNotificationController {
    private final SystemNotificationService notifications;

    public SystemNotificationController(SystemNotificationService notifications) {
        this.notifications = notifications;
    }

    @GetMapping(ApiPaths.Notification.ADMIN)
    public ResponseEntity<ApiResponse<List<SystemNotification>>> listAdmin(
            @AuthenticationPrincipal OperationalPrincipal principal, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, ApiMessages.NOTIFICATIONS_RETRIEVED,
                notifications.listForAdmin(principal), request);
    }

    @PostMapping(ApiPaths.Notification.ADMIN)
    public ResponseEntity<ApiResponse<SystemNotification>> create(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @Valid @RequestBody CreateSystemNotificationRequest body, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.CREATED, ApiMessages.NOTIFICATION_CREATED,
                notifications.create(principal, body.title(), body.content(), body.type(),
                        body.targetRole(), (UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME)),
                request);
    }

    @DeleteMapping(ApiPaths.Notification.ADMIN_ID)
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @PathVariable long notificationId, HttpServletRequest request) {
        notifications.delete(principal, notificationId,
                (UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses.success(HttpStatus.OK, ApiMessages.NOTIFICATION_DELETED, null, request);
    }

    @GetMapping(ApiPaths.Notification.OPERATOR)
    public ResponseEntity<ApiResponse<SystemNotificationService.RecipientNotificationList>> listOperator(
            @AuthenticationPrincipal OperationalPrincipal principal, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, ApiMessages.NOTIFICATIONS_RETRIEVED,
                notifications.listForOperator(principal), request);
    }

    @PatchMapping(ApiPaths.Notification.OPERATOR_READ)
    public ResponseEntity<ApiResponse<Void>> markOperatorRead(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @PathVariable long notificationId, HttpServletRequest request) {
        notifications.markReadForOperator(principal, notificationId);
        return ApiResponses.success(HttpStatus.OK, ApiMessages.NOTIFICATION_MARKED_READ, null,
                request);
    }

    @PatchMapping(ApiPaths.Notification.OPERATOR_READ_ALL)
    public ResponseEntity<ApiResponse<Void>> markAllOperatorRead(
            @AuthenticationPrincipal OperationalPrincipal principal, HttpServletRequest request) {
        notifications.markAllReadForOperator(principal);
        return ApiResponses.success(HttpStatus.OK, ApiMessages.NOTIFICATIONS_MARKED_READ, null,
                request);
    }

    @GetMapping(ApiPaths.Notification.CUSTOMER)
    public ResponseEntity<ApiResponse<SystemNotificationService.RecipientNotificationList>> listCustomer(
            @CookieValue(name = CustomerTableSessionController.CUSTOMER_SESSION_COOKIE, required = false) String sessionPublicId,
            HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, ApiMessages.NOTIFICATIONS_RETRIEVED,
                notifications.listForCustomer(sessionPublicId), request);
    }

    @PatchMapping(ApiPaths.Notification.CUSTOMER_READ)
    public ResponseEntity<ApiResponse<Void>> markCustomerRead(
            @CookieValue(name = CustomerTableSessionController.CUSTOMER_SESSION_COOKIE, required = false) String sessionPublicId,
            @PathVariable long notificationId, HttpServletRequest request) {
        notifications.markReadForCustomer(sessionPublicId, notificationId);
        return ApiResponses.success(HttpStatus.OK, ApiMessages.NOTIFICATION_MARKED_READ, null,
                request);
    }

    @PatchMapping(ApiPaths.Notification.CUSTOMER_READ_ALL)
    public ResponseEntity<ApiResponse<Void>> markAllCustomerRead(
            @CookieValue(name = CustomerTableSessionController.CUSTOMER_SESSION_COOKIE, required = false) String sessionPublicId,
            HttpServletRequest request) {
        notifications.markAllReadForCustomer(sessionPublicId);
        return ApiResponses.success(HttpStatus.OK, ApiMessages.NOTIFICATIONS_MARKED_READ, null,
                request);
    }

    public record CreateSystemNotificationRequest(@NotBlank @Size(max = 200) String title,
            @NotBlank @Size(max = 65535) String content, @NotBlank String type,
            @NotBlank String targetRole) {
    }

}
