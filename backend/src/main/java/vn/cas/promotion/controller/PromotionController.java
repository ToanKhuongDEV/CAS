package vn.cas.promotion.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;
import vn.cas.promotion.model.Promotion;
import vn.cas.promotion.service.PromotionService;

@RestController
@RequestMapping("/api/v1")
public class PromotionController {
    private static final String CUSTOMER_COOKIE = "cas_customer_session";
    private final PromotionService promotions;

    public PromotionController(PromotionService promotions) {
        this.promotions = promotions;
    }

    @GetMapping("/admin/promotions")
    public ResponseEntity<ApiResponse<List<PromotionService.AdminPromotion>>> list(
            @AuthenticationPrincipal OperationalPrincipal p, HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy khuyến mãi.", promotions.list(p), r);
    }
    @GetMapping("/admin/promotions/{id}")
    public ResponseEntity<ApiResponse<PromotionService.AdminPromotion>> get(
            @AuthenticationPrincipal OperationalPrincipal p, @PathVariable String id,
            HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy khuyến mãi.", promotions.get(p, id), r);
    }
    @GetMapping("/admin/promotions/{id}/redemptions")
    public ResponseEntity<ApiResponse<PromotionService.RedemptionPage>> redemptions(
            @AuthenticationPrincipal OperationalPrincipal p, @PathVariable String id,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size, HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy lịch sử sử dụng khuyến mãi.",
                promotions.redemptions(p, id, page, size), r);
    }
    @PostMapping("/admin/promotions")
    public ResponseEntity<ApiResponse<PromotionService.AdminPromotion>> create(
            @AuthenticationPrincipal OperationalPrincipal p, @Valid @RequestBody PromotionRequest b,
            HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.CREATED, "Đã tạo khuyến mãi.",
                promotions.create(p, b.toPromotion(), b.codeCommands(), b.targetCommands(),
                        (UUID) r.getAttribute(RequestId.ATTRIBUTE_NAME)),
                r);
    }
    @PutMapping("/admin/promotions/{id}")
    public ResponseEntity<ApiResponse<PromotionService.AdminPromotion>> update(
            @AuthenticationPrincipal OperationalPrincipal p, @PathVariable String id,
            @Valid @RequestBody PromotionRequest b, HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã cập nhật khuyến mãi.",
                promotions.update(p, id, b.toPromotion(), b.codeCommands(), b.targetCommands(),
                        (UUID) r.getAttribute(RequestId.ATTRIBUTE_NAME)),
                r);
    }
    @PatchMapping("/admin/promotions/{id}/status")
    public ResponseEntity<ApiResponse<PromotionService.AdminPromotion>> status(
            @AuthenticationPrincipal OperationalPrincipal p, @PathVariable String id,
            @Valid @RequestBody StatusRequest b, HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã cập nhật trạng thái khuyến mãi.", promotions
                .updateStatus(p, id, b.status(), (UUID) r.getAttribute(RequestId.ATTRIBUTE_NAME)),
                r);
    }

    @GetMapping("/customer/promotions/eligible")
    public ResponseEntity<ApiResponse<List<PromotionService.Eligible>>> eligible(
            @CookieValue(name = CUSTOMER_COOKIE, required = false) String s,
            @RequestParam(required = false) @Size(max = 100) String code, HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy khuyến mãi hợp lệ.",
                promotions.eligible(s, code), r);
    }
    @GetMapping("/customer/promotions")
    public ResponseEntity<ApiResponse<List<PromotionService.CustomerPromotion>>> customerPromotions(
            @CookieValue(name = CUSTOMER_COOKIE, required = false) String s, HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy danh sách khuyến mãi.",
                promotions.customerPromotions(s), r);
    }
    @PutMapping("/customer/promotions/selection")
    public ResponseEntity<ApiResponse<PromotionService.Eligible>> select(
            @CookieValue(name = CUSTOMER_COOKIE, required = false) String s,
            @Valid @RequestBody SelectionRequest b, HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã chọn khuyến mãi.",
                promotions.select(s, b.promotionId(), b.code()), r);
    }
    @DeleteMapping("/customer/promotions/selection")
    public ResponseEntity<ApiResponse<Void>> clear(
            @CookieValue(name = CUSTOMER_COOKIE, required = false) String s, HttpServletRequest r) {
        promotions.clear(s);
        return ApiResponses.success(HttpStatus.OK, "Đã bỏ khuyến mãi.", null, r);
    }
    @GetMapping("/operator/table-sessions/{sessionId}/promotions/eligible")
    public ResponseEntity<ApiResponse<List<PromotionService.Eligible>>> operatorEligible(
            @AuthenticationPrincipal OperationalPrincipal p, @PathVariable String sessionId,
            HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy khuyến mãi hợp lệ.",
                promotions.eligibleForOperator(p, sessionId), r);
    }
    @PutMapping("/operator/table-sessions/{sessionId}/promotions/selection")
    public ResponseEntity<ApiResponse<PromotionService.Eligible>> operatorSelect(
            @AuthenticationPrincipal OperationalPrincipal p, @PathVariable String sessionId,
            @Valid @RequestBody SelectionRequest b, HttpServletRequest r) {
        return ApiResponses.success(HttpStatus.OK, "Đã chọn khuyến mãi.",
                promotions.selectForOperator(p, sessionId, b.promotionId(), b.code()), r);
    }
    @DeleteMapping("/operator/table-sessions/{sessionId}/promotions/selection")
    public ResponseEntity<ApiResponse<Void>> operatorClear(
            @AuthenticationPrincipal OperationalPrincipal p, @PathVariable String sessionId,
            HttpServletRequest r) {
        promotions.clearForOperator(p, sessionId);
        return ApiResponses.success(HttpStatus.OK, "Đã bỏ khuyến mãi.", null, r);
    }

    public record SelectionRequest(@NotBlank String promotionId, @Size(max = 100) String code) {
    }
    public record StatusRequest(
            @NotBlank @Pattern(regexp = "DRAFT|ACTIVE|INACTIVE") String status) {
    }
    public record CodeRequest(
            @NotBlank @Size(max = 100) @Pattern(regexp = "[A-Z0-9]+") String value,
            @Positive Integer maxRedemptions) {
        PromotionService.Code toCode() {
            return new PromotionService.Code(value, maxRedemptions);
        }
    }
    public record TargetRequest(@NotBlank @Pattern(regexp = "MENU_ITEM|CATEGORY") String type,
            @NotNull Long id) {
        PromotionService.Target toTarget() {
            return new PromotionService.Target(type, id);
        }
    }
    public record PromotionRequest(@NotBlank @Size(max = 150) String name,
            @NotBlank @Pattern(regexp = "PERCENT_OFF|FIXED_AMOUNT_OFF|ITEM_PERCENT_OFF|ITEM_FIXED_OFF") String promotionType,
            @NotNull @DecimalMin(value = "0", inclusive = false) BigDecimal discountValue,
            @DecimalMin(value = "0") BigDecimal maxDiscountAmount,
            @DecimalMin(value = "0") BigDecimal minBillAmount, @Positive Integer maxRedemptions,
            @Positive Integer maxRedemptionsPerCustomer,
            @NotBlank @Pattern(regexp = "DRAFT|ACTIVE|INACTIVE") String status,
            LocalDateTime startAt, LocalDateTime endAt, List<@Valid CodeRequest> codes,
            List<@Valid TargetRequest> targets) {
        Promotion toPromotion() {
            return new Promotion(0, null, name, promotionType, discountValue, maxDiscountAmount,
                    minBillAmount, maxRedemptions, maxRedemptionsPerCustomer, status, startAt,
                    endAt);
        }
        List<PromotionService.Code> codeCommands() {
            return codes == null ? List.of() : codes.stream().map(CodeRequest::toCode).toList();
        }
        List<PromotionService.Target> targetCommands() {
            return targets == null
                    ? List.of()
                    : targets.stream().map(TargetRequest::toTarget).toList();
        }
    }
}
