package vn.cas.operation.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record AdminDashboard(DateRange range, Revenue revenue, Customers customers, Menu menu,
        Promotions promotions) {
    public record DateRange(LocalDate from, LocalDate to) {
    }

    public record Revenue(BigDecimal total, BigDecimal salesRevenue, BigDecimal serviceRevenue,
            long paidSessionCount, List<RevenuePoint> series) {
    }

    public record RevenuePoint(LocalDate date, BigDecimal revenue, long paidSessionCount) {
    }

    public record Customers(long paidSessionCount, long sessionCount, BigDecimal averageWaitMinutes,
            List<CustomerPoint> series) {
    }

    public record CustomerPoint(LocalDate date, long paidSessionCount, long sessionCount,
            BigDecimal averageWaitMinutes) {
    }

    public record Menu(long soldQuantity, long remadeQuantity, List<MenuItem> topItems) {
    }

    public record MenuItem(long menuItemId, String name, long soldQuantity, BigDecimal revenue,
            long remadeQuantity) {
    }

    public record RevenueSummary(BigDecimal total, BigDecimal salesRevenue,
            BigDecimal serviceRevenue, long paidSessionCount) {
    }

    public record CustomerSummary(long sessionCount, BigDecimal averageWaitMinutes) {
    }

    public record Promotions(BigDecimal totalDiscountAmount, long discountedSessionCount,
            BigDecimal usageRate, PromotionStatusCounts statusCounts) {
    }

    public record PromotionSummary(BigDecimal totalDiscountAmount, long discountedSessionCount) {
    }

    public record PromotionStatusCounts(long active, long upcoming, long expired, long inactive) {
    }
}
