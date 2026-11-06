package vn.cas.operation.model;

public record OperatorDashboardSummary(long ordersToday, long activeTableCount,
        long totalTableCount, long pendingPaymentCount) {
}
