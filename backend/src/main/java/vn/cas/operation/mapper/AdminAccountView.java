package vn.cas.operation.mapper;

import java.time.LocalDateTime;

public record AdminAccountView(long id, String email, String phone, String displayName,
        String status, LocalDateTime createdAt, LocalDateTime lastLoginAt) {
}
