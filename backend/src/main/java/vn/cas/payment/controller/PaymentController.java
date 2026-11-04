package vn.cas.payment.controller;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Digits;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.http.*;
import org.springframework.format.annotation.DateTimeFormat;
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
    private final vn.cas.payment.service.BillAdjustmentService adjustments;
    public PaymentController(PaymentService s,
            vn.cas.payment.service.BillAdjustmentService adjustments) {
        service = s;
        this.adjustments = adjustments;
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
    @GetMapping(ApiPaths.API_CUSTOMER_PREFIX + "/bill-adjustments")
    public ResponseEntity<?> customerAdjustments(
            @CookieValue(name = "cas_customer_session", required = false) String sessionId,
            HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy điều chỉnh hóa đơn.",
                adjustments.listForCustomer(sessionId), request);
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
    @GetMapping(ApiPaths.API_ADMIN_PREFIX + "/payments")
    public ResponseEntity<?> paidByDate(@AuthenticationPrincipal OperationalPrincipal principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy thanh toán theo khoảng ngày.",
                service.paidBetween(principal, from, to), request);
    }
    @GetMapping(ApiPaths.Payment.OPERATOR_PENDING_COUNT)
    public ResponseEntity<?> pendingCount(@AuthenticationPrincipal OperationalPrincipal p,
            HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy số payment chờ xác nhận.",
                service.pendingCount(p), r);
    }
    @PostMapping(ApiPaths.API_OPERATOR_PREFIX + "/sales-sessions/{sessionId}/payments")
    public ResponseEntity<?> createForOperator(@AuthenticationPrincipal OperationalPrincipal p,
            @PathVariable String sessionId, HttpServletRequest r) {
        return ApiResponses.success(
                HttpStatus.CREATED, "Đã tạo yêu cầu thanh toán hộ khách.", service
                        .createForOperator(p, sessionId,
                                (java.util.UUID) r
                                        .getAttribute(vn.cas.common.web.RequestId.ATTRIBUTE_NAME)),
                r);
    }
    @PostMapping(ApiPaths.Payment.OPERATOR + "/{id}/confirm")
    public ResponseEntity<?> confirm(@AuthenticationPrincipal OperationalPrincipal p,
            @PathVariable String id, @Valid @RequestBody ConfirmPaymentRequest body,
            HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã xác nhận thanh toán.",
                service.confirm(p, id, body.billSnapshot(), commands(body.additions()),
                        commands(body.updates()), body.deletions()),
                r);
    }
    @PutMapping(ApiPaths.API_ADMIN_PREFIX + "/payments/{id}/adjustments")
    public ResponseEntity<?> updatePaidAdjustments(@AuthenticationPrincipal OperationalPrincipal p,
            @PathVariable String id, @Valid @RequestBody PaidAdjustmentRequest body,
            HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã cập nhật điều chỉnh hóa đơn.",
                adjustments.updatePaid(p, id, body.billSnapshot(), commands(body.additions()),
                        commands(body.updates()),
                        body.deletions() == null ? List.of() : body.deletions()),
                r);
    }
    public record PaidAdjustmentRequest(@NotBlank String billSnapshot,
            List<@NotNull @Valid AdjustmentChange> additions,
            List<@NotNull @Valid AdjustmentChange> updates, List<@NotNull UUID> deletions) {
    }
    private List<PaymentService.AdjustmentChange> commands(List<AdjustmentChange> values) {
        return values == null
                ? List.of()
                : values.stream().map(value -> new PaymentService.AdjustmentChange(value.id(),
                        value.adjustmentType(), value.amount(), value.reason())).toList();
    }
    public record ConfirmPaymentRequest(@NotBlank String billSnapshot,
            List<@NotNull @Valid AdjustmentChange> additions,
            List<@NotNull @Valid AdjustmentChange> updates, List<@NotNull UUID> deletions) {
    }
    public record AdjustmentChange(@NotNull UUID id,
            @NotNull @Pattern(regexp = "INCREASE|DECREASE") String adjustmentType,
            @NotNull @Positive @Digits(integer = 13, fraction = 2) BigDecimal amount,
            @NotBlank @Size(max = 1000) String reason) {
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
