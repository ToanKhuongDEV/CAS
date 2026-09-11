package vn.cas.operation.service;

import java.time.LocalDate;
import java.time.ZoneId;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.mapper.OperatorDashboardMapper;
import vn.cas.operation.model.OperatorDashboardSummary;

@Service
public class OperatorDashboardService {
    private static final ZoneId STORE_TIME_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final OperatorDashboardMapper dashboard;

    public OperatorDashboardService(OperatorDashboardMapper dashboard) {
        this.dashboard = dashboard;
    }

    @Transactional(readOnly = true)
    public OperatorDashboardSummary summary(OperationalPrincipal principal) {
        LocalDate today = LocalDate.now(STORE_TIME_ZONE);
        return dashboard.findSummary(principal.storeId(), today.atStartOfDay(),
                today.plusDays(1).atStartOfDay());
    }
}
