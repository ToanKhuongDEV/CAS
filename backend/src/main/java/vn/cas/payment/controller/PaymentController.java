package vn.cas.payment.controller;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.*;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.payment.service.PaymentService;
@RestController
public class PaymentController {
    private final PaymentService service;
    public PaymentController(PaymentService s) {
        service = s;
    }
    @PostMapping(ApiPaths.Payment.CUSTOMER)
    public ResponseEntity<?> create(
            @CookieValue(name = "cas_customer_session", required = false) String id,
            HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.CREATED, "Đã gửi yêu cầu thanh toán.",
                service.create(id), r);
    }
    @GetMapping(ApiPaths.Payment.CUSTOMER)
    public ResponseEntity<?> current(
            @CookieValue(name = "cas_customer_session", required = false) String id,
            HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy trạng thái thanh toán.",
                service.current(id), r);
    }
    @GetMapping(ApiPaths.Payment.OPERATOR)
    public ResponseEntity<?> pending(@AuthenticationPrincipal OperationalPrincipal p,
            HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy payment chờ xác nhận.",
                service.pending(p), r);
    }
    @GetMapping(ApiPaths.Payment.OPERATOR_PAID_TODAY)
    public ResponseEntity<?> paidToday(@AuthenticationPrincipal OperationalPrincipal p,
            HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy payment đã thanh toán trong ngày.",
                service.paidToday(p), r);
    }
    @GetMapping(ApiPaths.Payment.OPERATOR_PENDING_COUNT)
    public ResponseEntity<?> pendingCount(@AuthenticationPrincipal OperationalPrincipal p,
            HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy số payment chờ xác nhận.",
                service.pendingCount(p), r);
    }
    @PostMapping(ApiPaths.Payment.OPERATOR + "/{id}/confirm")
    public ResponseEntity<?> confirm(@AuthenticationPrincipal OperationalPrincipal p,
            @PathVariable String id, HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã xác nhận thanh toán.",
                service.confirm(p, id), r);
    }
    @GetMapping(ApiPaths.UnpaidRecord.OPERATOR)
    public ResponseEntity<?> unpaidRecords(@AuthenticationPrincipal OperationalPrincipal p,
            @RequestParam(required = false) @Pattern(regexp = "OPEN|RESOLVED") String status,
            HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy danh sách khoản chưa thanh toán.",
                service.unpaidRecords(p, status), r);
    }
    @GetMapping(ApiPaths.UnpaidRecord.ELIGIBLE_SESSIONS)
    public ResponseEntity<?> eligibleUnpaidSessions(@AuthenticationPrincipal OperationalPrincipal p,
            @RequestParam(defaultValue = "120") @Min(0) @Max(10000) int minimumOpenMinutes,
            HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy phiên có thể ghi nhận chưa thanh toán.",
                service.eligibleUnpaidSessions(p, minimumOpenMinutes), r);
    }
    @PostMapping(ApiPaths.UnpaidRecord.OPERATOR)
    public ResponseEntity<?> recordUnpaid(@AuthenticationPrincipal OperationalPrincipal p,
            @Valid @RequestBody RecordUnpaidRequest body, HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.CREATED, "Đã ghi nhận khoản chưa thanh toán.",
                service.recordUnpaid(p, body.sessionId(), body.reason()), r);
    }
    public record RecordUnpaidRequest(@NotBlank String sessionId, @Size(max = 1000) String reason) {
    }
}
