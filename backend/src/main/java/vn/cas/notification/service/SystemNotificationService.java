package vn.cas.notification.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.notification.dto.CreateSystemNotificationCommand;
import vn.cas.notification.mapper.SystemNotificationMapper;
import vn.cas.notification.model.RecipientNotification;
import vn.cas.notification.model.SystemNotification;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;
import vn.cas.store.service.CustomerTableSessionService;

@Service
public class SystemNotificationService {
    private final SystemNotificationMapper mapper;
    private final CustomerTableSessionService sessions;
    private final AuditLogService auditLogs;

    public SystemNotificationService(SystemNotificationMapper mapper,
            CustomerTableSessionService sessions, AuditLogService auditLogs) {
        this.mapper = mapper;
        this.sessions = sessions;
        this.auditLogs = auditLogs;
    }

    @Transactional(readOnly = true)
    public List<SystemNotification> listForAdmin(OperationalPrincipal principal) {
        return mapper.findByStoreId(principal.storeId());
    }

    @Transactional
    public SystemNotification create(OperationalPrincipal principal, String title, String content,
            String type, String targetRole, UUID requestId) {
        requireSupported(type, targetRole);
        var command = new CreateSystemNotificationCommand(principal.storeId(), title.trim(),
                content.trim(), type, targetRole, principal.accountId());
        mapper.insert(command);
        if ("OPERATOR".equals(targetRole) || "BOTH".equals(targetRole))
            mapper.insertRecipientsForActiveOperators(command.getId(), principal.storeId());
        if ("CUSTOMER".equals(targetRole) || "BOTH".equals(targetRole))
            mapper.insertRecipientsForActiveCustomerSessions(command.getId(), principal.storeId());
        auditLogs.record(new AuditLogCommand(principal.storeId(), requestId, "CREATE",
                "SYSTEM_NOTIFICATION", command.getId(), title.trim(),
                "{\"type\":\"" + type + "\",\"targetRole\":\"" + targetRole + "\"}",
                principal.accountId(), principal.displayName(), "Created system notification"));
        return new SystemNotification(command.getId(), command.getTitle(), command.getContent(),
                type, targetRole, LocalDateTime.now(), LocalDateTime.now());
    }

    @Transactional
    public void delete(OperationalPrincipal principal, long notificationId, UUID requestId) {
        if (mapper.deleteByStoreIdAndId(principal.storeId(), notificationId) != 1)
            throw notFound();
        auditLogs.record(new AuditLogCommand(principal.storeId(), requestId, "DELETE",
                "SYSTEM_NOTIFICATION", notificationId, "Notification " + notificationId, "{}",
                principal.accountId(), principal.displayName(), "Deleted system notification"));
    }

    @Transactional(readOnly = true)
    public RecipientNotificationList listForOperator(OperationalPrincipal principal) {
        return new RecipientNotificationList(mapper.findByAccountId(principal.accountId()),
                mapper.countUnreadByAccountId(principal.accountId()));
    }

    @Transactional(readOnly = true)
    public RecipientNotificationList listForCustomer(String sessionPublicId) {
        var session = sessions.requireCurrent(sessionPublicId);
        return new RecipientNotificationList(mapper.findByTableSessionId(session.sessionId()),
                mapper.countUnreadByTableSessionId(session.sessionId()));
    }

    @Transactional
    public void markReadForOperator(OperationalPrincipal principal, long notificationId) {
        if (!mapper.existsForAccount(notificationId, principal.accountId()))
            throw notFound();
        mapper.markReadForAccount(notificationId, principal.accountId(), LocalDateTime.now());
    }

    @Transactional
    public void markReadForCustomer(String sessionPublicId, long notificationId) {
        var session = sessions.requireCurrent(sessionPublicId);
        if (!mapper.existsForTableSession(notificationId, session.sessionId()))
            throw notFound();
        mapper.markReadForTableSession(notificationId, session.sessionId(), LocalDateTime.now());
    }

    @Transactional
    public void markAllReadForOperator(OperationalPrincipal principal) {
        mapper.markAllReadForAccount(principal.accountId(), LocalDateTime.now());
    }

    @Transactional
    public void markAllReadForCustomer(String sessionPublicId) {
        mapper.markAllReadForTableSession(sessions.requireCurrent(sessionPublicId).sessionId(),
                LocalDateTime.now());
    }

    private static void requireSupported(String type, String targetRole) {
        if (!List.of("INFO", "WARNING", "URGENT").contains(type)
                || !List.of("OPERATOR", "CUSTOMER", "BOTH").contains(targetRole))
            throw new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST);
    }

    private static ApiException notFound() {
        return new ApiException(HttpStatus.NOT_FOUND, ApiMessages.NOTIFICATION_NOT_FOUND);
    }

    public record RecipientNotificationList(List<RecipientNotification> notifications,
            long unreadCount) {
    }
}
