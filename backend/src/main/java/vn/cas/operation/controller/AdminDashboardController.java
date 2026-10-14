package vn.cas.operation.controller;

import java.time.LocalDate;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.model.AdminDashboard;
import vn.cas.operation.service.AdminDashboardService;

@RestController
@Validated
public class AdminDashboardController {
    private final AdminDashboardService dashboard;

    public AdminDashboardController(AdminDashboardService dashboard) {
        this.dashboard = dashboard;
    }

    @GetMapping(ApiPaths.AdminDashboard.SUMMARY)
    public ResponseEntity<ApiResponse<AdminDashboard>> summary(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, ApiMessages.ADMIN_DASHBOARD_RETRIEVED,
                dashboard.summary(principal, from, to), request);
    }
}
