package vn.cas.payment.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.payment.service.BillAdjustmentService;

@RestController
@RequestMapping(ApiPaths.API_OPERATOR_PREFIX + "/sales-sessions/{sessionId}/bill-adjustments")
public class BillAdjustmentController {
    private final BillAdjustmentService service;

    public BillAdjustmentController(BillAdjustmentService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> list(@AuthenticationPrincipal OperationalPrincipal principal,
            @PathVariable String sessionId, HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy điều chỉnh hóa đơn.",
                service.list(principal, sessionId), request);
    }

}
