package vn.cas.ordering.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.ordering.service.CustomerOrderingService;
import vn.cas.store.controller.CustomerTableSessionController;

@RestController
@RequestMapping("/api/v1/customer/orders")
public class CustomerOrderingController {
    private final CustomerOrderingService orders;

    public CustomerOrderingController(CustomerOrderingService orders) {
        this.orders = orders;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> create(
            @CookieValue(name = CustomerTableSessionController.CUSTOMER_SESSION_COOKIE, required = false) String session,
            @Valid @RequestBody CreateOrderRequest body, HttpServletRequest request) {
        var result = orders
                .create(session, body.idempotencyKey(), normalize(body.note()),
                        body.items().stream()
                                .map(item -> new CustomerOrderingService.OrderLine(
                                        item.menuItemId(), item.quantity(), item.optionValueIds()))
                                .toList());
        return ApiResponses.success(HttpStatus.CREATED, "Đã gửi món xuống bếp.",
                new OrderResponse(result.orderId(), result.payableAmount()), request);
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    @PostMapping("/items/{orderItemId}/cancellation-requests")
    public ResponseEntity<ApiResponse<CancellationResponse>> requestCancellation(
            @CookieValue(name = CustomerTableSessionController.CUSTOMER_SESSION_COOKIE, required = false) String session,
            @PathVariable String orderItemId, @Valid @RequestBody CancellationRequestBody body,
            HttpServletRequest request) {
        var result = orders.requestCancellation(session, orderItemId, body.idempotencyKey(),
                body.requestedQuantity(), normalize(body.reason()));
        return ApiResponses.success(HttpStatus.CREATED, "Đã gửi yêu cầu hủy món.",
                new CancellationResponse(result.publicId(), result.requestedQuantity(),
                        result.reason(), result.status()),
                request);
    }

    public record CreateOrderRequest(@NotBlank @Size(max = 100) String idempotencyKey,
            @Size(max = 1000) String note, @NotEmpty List<@Valid OrderItemRequest> items) {
    }

    public record OrderItemRequest(@NotNull @Min(1) Long menuItemId, @Min(1) int quantity,
            List<@NotNull @Min(1) Long> optionValueIds) {
        public List<Long> optionValueIds() {
            return optionValueIds == null ? List.of() : optionValueIds;
        }
    }

    public record OrderResponse(String orderId, BigDecimal payableAmount) {
    }

    public record CancellationRequestBody(@NotBlank @Size(max = 100) String idempotencyKey,
            @Min(1) int requestedQuantity, @Size(max = 1000) String reason) {
    }

    public record CancellationResponse(String cancellationRequestId, int requestedQuantity,
            String reason, String status) {
    }
}
