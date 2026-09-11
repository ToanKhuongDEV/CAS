package vn.cas.operation.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.model.OperatorDashboardSummary;
import vn.cas.operation.service.OperatorDashboardService;

@RestController
public class OperatorDashboardController {
    private final OperatorDashboardService dashboard;

    public OperatorDashboardController(OperatorDashboardService dashboard) {
        this.dashboard = dashboard;
    }

    @GetMapping(ApiPaths.OperatorDashboard.SUMMARY)
    public ResponseEntity<ApiResponse<OperatorDashboardSummary>> summary(
            @AuthenticationPrincipal OperationalPrincipal principal, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, ApiMessages.OPERATOR_DASHBOARD_SUMMARY_RETRIEVED,
                dashboard.summary(principal), request);
    }
}
