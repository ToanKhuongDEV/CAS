package vn.cas.operation.model;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AdminCustomerSession(String publicId, long tableCode, String status, long orderCount,
        String paymentStatus, BigDecimal paymentAmount, String unpaidStatus,
        BigDecimal unpaidAmount, LocalDateTime openedAt, LocalDateTime closedAt) {
}
