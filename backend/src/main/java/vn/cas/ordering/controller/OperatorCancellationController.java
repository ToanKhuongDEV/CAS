package vn.cas.ordering.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;
import vn.cas.ordering.service.CancellationService;

@RestController
@RequestMapping(ApiPaths.Cancellation.COMMON)
public class OperatorCancellationController {
    private final CancellationService cancellations;

    public OperatorCancellationController(CancellationService cancellations) {
        this.cancellations = cancellations;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CancellationService.RequestSummary>>> pending(
            @AuthenticationPrincipal OperationalPrincipal principal, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy yêu cầu hủy món đang chờ.",
                cancellations.pending(principal), request);
    }

    @GetMapping("/{cancellationRequestId}")
    public ResponseEntity<ApiResponse<CancellationService.RequestDetail>> detail(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @PathVariable String cancellationRequestId, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy chi tiết yêu cầu hủy món.",
                cancellations.detail(principal, cancellationRequestId), request);
    }

    @PostMapping("/{cancellationRequestId}/resolution")
    public ResponseEntity<ApiResponse<CancellationService.Resolution>> resolve(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @PathVariable String cancellationRequestId, @Valid @RequestBody ResolutionRequest body,
            HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, "Đã xử lý yêu cầu hủy món.",
                cancellations.resolve(principal, cancellationRequestId, body.decision(),
                        body.isRemade(), body.targetOrderItemId(), body.transferQuantity(),
                        (java.util.UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME)),
                request);
    }

    @PostMapping("/incidents")
    public ResponseEntity<ApiResponse<CancellationService.IncidentCancellation>> incident(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @Valid @RequestBody IncidentRequest body, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.CREATED, "Đã hủy món do sự cố.",
                cancellations.incident(principal, body.orderItemId(), body.requestedQuantity(),
                        normalize(body.reason()), body.isRemade(),
                        (java.util.UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME)),
                request);
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public record ResolutionRequest(@NotBlank @Pattern(regexp = "APPROVE|REJECT") String decision,
            boolean isRemade, String targetOrderItemId, @Min(0) @Max(10000) int transferQuantity) {
    }

    public record IncidentRequest(@NotBlank String orderItemId, @Min(1) int requestedQuantity,
            @Size(max = 1000) String reason, boolean isRemade) {
    }
}
