package vn.cas.operation.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.math.RoundingMode;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.mapper.AdminDashboardMapper;
import vn.cas.operation.model.AdminDashboard;

@Service
public class AdminDashboardService {
    private final AdminDashboardMapper dashboard;

    public AdminDashboardService(AdminDashboardMapper dashboard) {
        this.dashboard = dashboard;
    }

    @Transactional(readOnly = true)
    public AdminDashboard summary(OperationalPrincipal principal, LocalDate from, LocalDate to) {
        if (from.isAfter(to))
            throw new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST);
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();
        long storeId = principal.storeId();
        var revenue = dashboard.findRevenueSummary(storeId, start, end);
        var menuItems = dashboard.findMenuItems(storeId, start, end);
        var customerSummary = dashboard.findCustomerSummary(storeId, start, end);
        if (customerSummary == null)
            customerSummary = new AdminDashboard.CustomerSummary(null);
        var promotionSummary = dashboard.findPromotionSummary(storeId, start, end);
        return new AdminDashboard(new AdminDashboard.DateRange(from, to),
                new AdminDashboard.Revenue(revenue.total(), revenue.paidSessionCount(),
                        dashboard.findRevenueSeries(storeId, start, end)),
                new AdminDashboard.Customers(revenue.paidSessionCount(),
                        customerSummary.averageWaitMinutes(),
                        dashboard.findCustomerSeries(storeId, start, end)),
                new AdminDashboard.Menu(
                        menuItems.stream().mapToLong(AdminDashboard.MenuItem::soldQuantity).sum(),
                        menuItems.stream().mapToLong(AdminDashboard.MenuItem::remadeQuantity).sum(),
                        menuItems),
                new AdminDashboard.Promotions(promotionSummary.totalDiscountAmount(),
                        promotionSummary.discountedSessionCount(),
                        percentage(promotionSummary.discountedSessionCount(),
                                revenue.paidSessionCount()),
                        dashboard.findPromotionStatusCounts(storeId)));
    }

    private static java.math.BigDecimal percentage(long part, long total) {
        if (total == 0)
            return java.math.BigDecimal.ZERO;
        return java.math.BigDecimal.valueOf(part).multiply(java.math.BigDecimal.valueOf(100))
                .divide(java.math.BigDecimal.valueOf(total), 1, RoundingMode.HALF_UP);
    }
}
