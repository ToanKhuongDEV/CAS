package vn.cas.payment.model;

import java.time.LocalDateTime;

public record UnpaidSessionView(long sessionId, String sessionPublicId, long tableCode,
        String sessionStatus, String paymentPublicId, LocalDateTime openedAt) {
}
