package vn.cas.operation.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class AdminReport {
    private AdminReport() {
    }

    public enum Type {
        REVENUE, ORDERS, REMADE, ALL
    }

    public record Page(List<?> items, long total, int page, int size) {
    }

    public record Revenue(LocalDate date, long paidSessionCount, BigDecimal revenue) {
    }

    public record Order(LocalDateTime createdAt, String orderNumber, Long tableCode,
            String customerName, BigDecimal originalAmount, BigDecimal payableAmount) {
    }

    public record Remade(LocalDateTime resolvedAt, String orderNumber, Long tableCode,
            String itemName, int quantity, String reason, String resolvedByName) {
    }
}
