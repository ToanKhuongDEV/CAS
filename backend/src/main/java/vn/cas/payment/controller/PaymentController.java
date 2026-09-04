package vn.cas.payment.controller;
import jakarta.servlet.http.HttpServletRequest;
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
}
