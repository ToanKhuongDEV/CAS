package vn.cas.notification.model;

import java.time.LocalDateTime;

public record RecipientNotification(long id, String title, String content, String type,
        String targetRole, String status, LocalDateTime readAt, LocalDateTime createdAt) {
}
