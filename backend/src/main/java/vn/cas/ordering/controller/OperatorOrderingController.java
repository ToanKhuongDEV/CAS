package vn.cas.ordering.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.constants.ApiPaths;
import vn.cas.common.response.ApiResponse;
import vn.cas.common.response.ApiResponses;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.web.RequestId;
import vn.cas.ordering.service.CustomerOrderingService;
import vn.cas.store.service.CustomerTableSessionService;
import vn.cas.store.service.DiningTableService;

@RestController
@RequestMapping(ApiPaths.API_OPERATOR_PREFIX + "/table-sessions")
public class OperatorOrderingController {
    private final CustomerTableSessionService sessions;
    private final CustomerOrderingService orders;
    private final DiningTableService tables;

    public OperatorOrderingController(CustomerTableSessionService sessions,
            CustomerOrderingService orders, DiningTableService tables) {
        this.sessions = sessions;
        this.orders = orders;
        this.tables = tables;
    }

    @GetMapping("/tables")
    public ResponseEntity<ApiResponse<List<TableResponse>>> listTables(
            @AuthenticationPrincipal OperationalPrincipal principal, HttpServletRequest request) {
        var response = tables.list(principal).stream().map(table -> new TableResponse(table.id(),
                table.code(), table.sessionStatus(), table.sessionPublicId())).toList();
        return ApiResponses.success(HttpStatus.OK, "Đã lấy danh sách bàn phục vụ.", response,
                request);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TableSessionResponse>> openOrGet(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @Valid @RequestBody OpenTableSessionRequest body, HttpServletRequest request) {
        var session = sessions.openOrGetForOperator(principal.storeId(), body.tableId(),
                normalize(body.customerName()), normalize(body.customerPhone()));
        return ApiResponses.success(HttpStatus.CREATED, ApiMessages.OPERATOR_TABLE_SESSION_READY,
                new TableSessionResponse(session.sessionPublicId(), session.tableCode(),
                        session.sessionStatus()),
                request);
    }

    @PostMapping("/{sessionPublicId}/orders")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(
            @AuthenticationPrincipal OperationalPrincipal principal,
            @PathVariable String sessionPublicId, @Valid @RequestBody CreateOrderRequest body,
            HttpServletRequest request) {
        var created = orders.createForOperator(principal, sessionPublicId, body.idempotencyKey(),
                normalize(body.note()),
                body.items().stream()
                        .map(item -> new CustomerOrderingService.OrderLine(item.menuItemId(),
                                item.quantity(), item.optionValueIds()))
                        .toList(),
                (UUID) request.getAttribute(RequestId.ATTRIBUTE_NAME));
        return ApiResponses.success(HttpStatus.CREATED, ApiMessages.OPERATOR_ORDER_CREATED,
                new OrderResponse(created.orderId(), created.payableAmount()), request);
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    public record OpenTableSessionRequest(@Positive long tableId,
            @Size(max = 150) String customerName, @Size(max = 20) String customerPhone) {
    }

    public record CreateOrderRequest(@NotBlank @Size(max = 100) String idempotencyKey,
            @Size(max = 1000) String note, @NotEmpty List<@Valid OrderItemRequest> items) {
    }

    public record OrderItemRequest(@NotNull @Positive long menuItemId, @Positive int quantity,
            List<@NotNull @Positive Long> optionValueIds) {
        public List<Long> optionValueIds() {
            return optionValueIds == null ? List.of() : optionValueIds;
        }
    }

    public record TableSessionResponse(String sessionId, long tableCode, String status) {
    }

    public record TableResponse(long tableId, long tableCode, String sessionStatus,
            String sessionPublicId) {
    }

    public record OrderResponse(String orderId, BigDecimal payableAmount) {
    }
}
