package vn.cas.operation.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ServiceBookingView(long id, String publicId, String clientName, String clientPhone,
        String serviceName, String note, BigDecimal agreedPrice, String paymentStatus,
        String createdByName, String confirmedByName, LocalDateTime confirmedAt,
        LocalDateTime createdAt) {
}
