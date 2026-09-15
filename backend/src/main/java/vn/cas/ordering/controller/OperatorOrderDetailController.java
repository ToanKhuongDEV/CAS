package vn.cas.ordering.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.ordering.service.CustomerOrderingService;

@RestController
@RequestMapping(ApiPaths.API_OPERATOR_PREFIX + "/orders")
public class OperatorOrderDetailController {
    private final CustomerOrderingService orders;

    public OperatorOrderDetailController(CustomerOrderingService orders) {
        this.orders = orders;
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<CustomerOrderingService.OperatorOrderDetail>> get(
            @AuthenticationPrincipal OperationalPrincipal principal, @PathVariable String orderId,
            HttpServletRequest request) {
        return ApiResponses.success(HttpStatus.OK, "Đã lấy chi tiết order.",
                orders.getForOperator(principal, orderId), request);
    }
}
