package vn.cas.ordering.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;
import vn.cas.ordering.mapper.OrderingMapper;
import vn.cas.ordering.model.OperatorCancellationRequestRow;
import vn.cas.ordering.model.PreparedItemTransfer;
import vn.cas.ordering.model.PreparationItemRow;
import vn.cas.ordering.model.PreparationOptionRow;

@Service
public class CancellationService {
    private final OrderingMapper mapper;
    private final AuditLogService auditLogs;

    public CancellationService(OrderingMapper mapper, AuditLogService auditLogs) {
        this.mapper = mapper;
        this.auditLogs = auditLogs;
    }

    @Transactional(readOnly = true)
    public List<RequestSummary> pending(OperationalPrincipal principal) {
        return mapper.findPendingCancellationRequests(principal.storeId()).stream()
                .map(RequestSummary::from).toList();
    }

    @Transactional(readOnly = true)
    public RequestDetail detail(OperationalPrincipal principal, String publicId) {
        var request = requireRequest(principal, publicId, false);
        return detailFor(principal.storeId(), request);
    }

    @Transactional
    public Resolution resolve(OperationalPrincipal principal, String publicId, String decision,
            boolean isRemade, String targetOrderItemId, int transferQuantity, UUID requestId) {
        var request = requireRequest(principal, publicId, true);
        if (!"PENDING".equals(request.status()))
            throw new ApiException(HttpStatus.CONFLICT, ApiMessages.INVALID_REQUEST);
        if ("REJECT".equals(decision)) {
            mapper.resolveCancellationRequest(request.id(), "REJECTED", false,
                    principal.accountId(), principal.displayName());
            return new Resolution(request.publicId(), "REJECTED", 0, null, null);
        }
        if (!"APPROVE".equals(decision))
            throw new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST);

        var items = mapper.findPreparationItemsForUpdate(principal.storeId(), request.menuItemId());
        var source = items.stream().filter(item -> item.orderItemId() == request.orderItemId())
                .findFirst().orElseThrow(
                        () -> new ApiException(HttpStatus.CONFLICT, ApiMessages.INVALID_REQUEST));
        int approvedAfter = request.approvedCancellationQuantity() + request.requestedQuantity();
        if (approvedAfter > source.quantity())
            throw new ApiException(HttpStatus.CONFLICT, ApiMessages.INVALID_REQUEST);
        int sourcePreparedAfter = Math.min(source.preparedQuantity(),
                source.quantity() - approvedAfter);
        int movableQuantity = source.preparedQuantity() - sourcePreparedAfter;
        if (transferQuantity < 0 || transferQuantity > movableQuantity)
            throw new ApiException(HttpStatus.CONFLICT, ApiMessages.INVALID_REQUEST);

        PreparationItemRow target = null;
        if (transferQuantity > 0) {
            if (targetOrderItemId == null || targetOrderItemId.isBlank())
                throw new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST);
            target = items.stream()
                    .filter(item -> item.orderItemPublicId().equals(targetOrderItemId)).findFirst()
                    .orElseThrow(() -> new ApiException(HttpStatus.CONFLICT,
                            ApiMessages.INVALID_REQUEST));
            if (target.orderItemId() == source.orderItemId() || remaining(target) < transferQuantity
                    || !optionHash(items, source).equals(optionHash(items, target)))
                throw new ApiException(HttpStatus.CONFLICT, ApiMessages.INVALID_REQUEST);
        }
        mapper.resolveCancellationRequest(request.id(), "APPROVED", isRemade, principal.accountId(),
                principal.displayName());
        mapper.setPreparedQuantity(source.orderItemId(), sourcePreparedAfter);
        mapper.recalculateOrderPayableAmount(request.orderId());
        String remakeOrderPublicId = isRemade
                ? createRemakeOrder(principal, source.orderItemId(), request.requestedQuantity(),
                        request.reason())
                : null;
        if (target != null) {
            mapper.addPreparedQuantity(target.orderItemId(), transferQuantity);
            mapper.insertPreparedItemTransfer(UUID.randomUUID().toString(),
                    new PreparedItemTransfer(request.id(), source.orderItemId(),
                            target.orderItemId(), transferQuantity, principal.accountId()));
        }
        auditLogs.record(
                new AuditLogCommand(principal.storeId(), requestId, "CANCELLATION_REQUEST_RESOLVED",
                        "ORDER_ITEM_CANCELLATION_REQUEST", request.id(), request.publicId(),
                        "{\"decision\":\"APPROVED\",\"transferQuantity\":" + transferQuantity + "}",
                        principal.accountId(), principal.displayName(),
                        "Nhân viên duyệt yêu cầu hủy món."));
        return new Resolution(request.publicId(), "APPROVED", transferQuantity,
                target == null ? null : target.orderItemPublicId(), remakeOrderPublicId);
    }

    @Transactional
    public IncidentCancellation incident(OperationalPrincipal principal, String orderItemPublicId,
            int requestedQuantity, String reason, boolean isRemade, UUID requestId) {
        var current = mapper.findPreparationItems(principal.storeId()).stream()
                .filter(item -> item.orderItemPublicId().equals(orderItemPublicId)).findFirst()
                .orElseThrow(
                        () -> new ApiException(HttpStatus.NOT_FOUND, ApiMessages.INVALID_REQUEST));
        var items = mapper.findPreparationItemsForUpdate(principal.storeId(), current.menuItemId());
        var source = items.stream().filter(item -> item.orderItemId() == current.orderItemId())
                .findFirst().orElseThrow(
                        () -> new ApiException(HttpStatus.CONFLICT, ApiMessages.INVALID_REQUEST));
        if (requestedQuantity > remaining(source))
            throw new ApiException(HttpStatus.CONFLICT, ApiMessages.INVALID_REQUEST);
        String publicId = UUID.randomUUID().toString();
        mapper.insertApprovedOperatorCancellationRequest(publicId, source.orderItemId(),
                UUID.randomUUID().toString(), requestedQuantity, reason, isRemade,
                principal.accountId(), principal.displayName());
        long cancellationRequestId = mapper.lastInsertId();
        mapper.setPreparedQuantity(source.orderItemId(), Math.min(source.preparedQuantity(),
                source.quantity() - source.cancelledQuantity() - requestedQuantity));
        mapper.recalculateOrderPayableAmount(source.orderId());
        String remakeOrderPublicId = isRemade
                ? createRemakeOrder(principal, source.orderItemId(), requestedQuantity, reason)
                : null;
        auditLogs.record(new AuditLogCommand(principal.storeId(), requestId,
                "OPERATOR_INCIDENT_CANCELLATION_CREATED", "ORDER_ITEM_CANCELLATION_REQUEST",
                cancellationRequestId, publicId, "{}", principal.accountId(),
                principal.displayName(), "Nhân viên hủy món do sự cố."));
        return new IncidentCancellation(publicId, "APPROVED", remakeOrderPublicId);
    }

    private String createRemakeOrder(OperationalPrincipal principal, long sourceOrderItemId,
            int quantity, String reason) {
        var source = mapper.findOrderItemRemakeSnapshot(sourceOrderItemId);
        if (source == null)
            throw new ApiException(HttpStatus.CONFLICT, ApiMessages.INVALID_REQUEST);
        BigDecimal amount = source.unitPrice().add(source.optionsAmount())
                .multiply(BigDecimal.valueOf(quantity));
        String publicId = UUID.randomUUID().toString();
        String note = "[LÀM LẠI]" + (reason == null ? "" : " - " + reason);
        mapper.insertOrder(publicId, source.tableSessionId(), principal.accountId(),
                UUID.randomUUID().toString(), publicId, publicId, amount, note);
        long orderId = mapper.lastInsertId();
        mapper.insertOrderItem(UUID.randomUUID().toString(), orderId, source.menuItemId(),
                source.itemName(), source.unitPrice(), source.optionsAmount(), quantity, amount);
        long orderItemId = mapper.lastInsertOrderItemId();
        for (var option : mapper.findOrderItemOptionRemakeSnapshots(sourceOrderItemId)) {
            mapper.insertOrderItemOption(orderItemId, option.optionValueId(), option.groupName(),
                    option.optionName(), option.unitPrice(), option.quantityPerItem(),
                    option.unitPrice().multiply(BigDecimal.valueOf(option.quantityPerItem()))
                            .multiply(BigDecimal.valueOf(quantity)));
        }
        return publicId;
    }

    private RequestDetail detailFor(long storeId, OperatorCancellationRequestRow request) {
        var items = mapper.findPreparationItems(storeId).stream()
                .filter(item -> item.menuItemId() == request.menuItemId()).toList();
        var source = items.stream().filter(item -> item.orderItemId() == request.orderItemId())
                .findFirst().orElse(null);
        if (source == null)
            return new RequestDetail(RequestSummary.from(request), List.of());
        String sourceHash = optionHash(items, source);
        var candidates = items.stream().filter(item -> item.orderItemId() != source.orderItemId())
                .filter(item -> remaining(item) > 0 && sourceHash.equals(optionHash(items, item)))
                .sorted(Comparator.comparing(PreparationItemRow::orderCreatedAt))
                .map(item -> new TransferCandidate(item.orderItemPublicId(), item.tableCode(),
                        remaining(item)))
                .toList();
        return new RequestDetail(RequestSummary.from(request), candidates);
    }

    private OperatorCancellationRequestRow requireRequest(OperationalPrincipal principal,
            String publicId, boolean forUpdate) {
        var request = forUpdate
                ? mapper.findOperatorCancellationRequestForUpdate(principal.storeId(), publicId)
                : mapper.findOperatorCancellationRequest(principal.storeId(), publicId);
        if (request == null)
            throw new ApiException(HttpStatus.NOT_FOUND, ApiMessages.INVALID_REQUEST);
        return request;
    }

    private String optionHash(List<PreparationItemRow> items, PreparationItemRow item) {
        Map<Long, List<PreparationOptionRow>> options = mapper
                .findPreparationOptions(
                        items.stream().map(PreparationItemRow::orderItemId).toList())
                .stream().collect(Collectors.groupingBy(PreparationOptionRow::orderItemId));
        String normalized = options.getOrDefault(item.orderItemId(), List.of()).stream()
                .sorted(Comparator.comparing(PreparationOptionRow::groupName)
                        .thenComparing(PreparationOptionRow::optionName)
                        .thenComparingInt(PreparationOptionRow::quantityPerItem))
                .map(option -> option.groupName() + "\u0000" + option.optionName() + "\u0000"
                        + option.quantityPerItem())
                .collect(Collectors.joining("\u0001"));
        try {
            return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(normalized.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
    }

    private static int remaining(PreparationItemRow item) {
        return Math.max(0, item.quantity() - item.cancelledQuantity() - item.preparedQuantity());
    }

    public record RequestSummary(String cancellationRequestId, String orderItemId, String itemName,
            int tableCode, int requestedQuantity, int preparedQuantity, String reason,
            java.time.LocalDateTime requestedAt) {
        static RequestSummary from(OperatorCancellationRequestRow row) {
            return new RequestSummary(row.publicId(), row.orderItemPublicId(), row.itemName(),
                    row.tableCode(), row.requestedQuantity(), row.preparedQuantity(), row.reason(),
                    row.createdAt());
        }
    }

    public record TransferCandidate(String orderItemId, int tableCode, int remainingQuantity) {
    }

    public record RequestDetail(RequestSummary request, List<TransferCandidate> candidates) {
    }

    public record Resolution(String cancellationRequestId, String status, int transferQuantity,
            String targetOrderItemId, String remakeOrderId) {
    }

    public record IncidentCancellation(String cancellationRequestId, String status,
            String remakeOrderId) {
    }
}
