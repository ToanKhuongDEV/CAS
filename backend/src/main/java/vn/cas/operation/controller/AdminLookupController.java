package vn.cas.operation.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.model.AdminCustomerDetail;
import vn.cas.operation.model.AdminCustomerSummary;
import vn.cas.operation.model.AuditLogPage;
import vn.cas.operation.service.AdminLookupService;

@RestController
@Validated
public class AdminLookupController {
    private final AdminLookupService lookup;

    public AdminLookupController(AdminLookupService lookup) {
        this.lookup = lookup;
    }

    @GetMapping(ApiPaths.CustomerAccount.COMMON)
    public ResponseEntity<ApiResponse<List<AdminCustomerSummary>>> customers(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @RequestParam(required = false) @Size(max = 150) String query,
            HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, ApiMessages.CUSTOMERS_RETRIEVED,
                lookup.customers(principal, query), request);
    }

    @GetMapping(ApiPaths.CustomerAccount.DETAIL)
    public ResponseEntity<ApiResponse<AdminCustomerDetail>> customer(
            @AuthenticationPrincipal OperationalPrincipal principal, @PathVariable long customerId,
            HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, ApiMessages.CUSTOMER_RETRIEVED,
                lookup.customer(principal, customerId), request);
    }

    @GetMapping(ApiPaths.AuditLog.ADMIN)
    public ResponseEntity<ApiResponse<AuditLogPage>> auditLogs(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @RequestParam(required = false) @Size(max = 150) String query,
            @RequestParam(required = false) @Size(max = 50) String action,
            @RequestParam(required = false) @Size(max = 50) String entityType,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, ApiMessages.AUDIT_LOGS_RETRIEVED,
                lookup.auditLogs(principal, query, action, entityType, page, size), request);
    }
}
