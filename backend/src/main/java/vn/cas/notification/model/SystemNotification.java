package vn.cas.notification.model;

import java.time.LocalDateTime;

public record SystemNotification(long id, String title, String content, String type,
        String targetRole, LocalDateTime createdAt, LocalDateTime updatedAt) {
}
