package vn.cas.operation.controller;

import java.time.LocalDate;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiError;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.exception.GlobalExceptionHandler;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.model.AdminReport;
import vn.cas.operation.service.AdminReportService;

@RestController
@Validated
public class AdminReportController {
    private final AdminReportService reports;
    public AdminReportController(AdminReportService reports) {
        this.reports = reports;
    }

    @ExceptionHandler({MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class})
    public ResponseEntity<ApiError> invalidParameter(Exception exception,
            HttpServletRequest request) {
        return new GlobalExceptionHandler().handleBadRequest(exception, request);
    }

    @GetMapping(value = "/api/v1/admin/reports", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<AdminReport.Page>> list(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @RequestParam AdminReport.Type type,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size,
            HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, "Đã tải báo cáo.",
                reports.page(principal, type, from, to, page, size), request);
    }

    @GetMapping("/api/v1/admin/reports/export")
    public ResponseEntity<StreamingResponseBody> export(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @RequestParam AdminReport.Type type,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        reports.validate(type, from, to, true);
        StreamingResponseBody body = output -> reports.export(principal, type, from, to, output);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=cas-reports.xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(body);
    }
}
