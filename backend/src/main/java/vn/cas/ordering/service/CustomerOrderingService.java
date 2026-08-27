package vn.cas.ordering.service;

import java.math.BigDecimal;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.exception.ApiException;
import vn.cas.ordering.mapper.OrderingMapper;
import vn.cas.ordering.model.OrderMenuItem;
import vn.cas.ordering.model.OrderOptionValue;
import vn.cas.ordering.model.CancellationRequest;
import vn.cas.store.service.CustomerTableSessionService;

@Service
public class CustomerOrderingService {
    private final OrderingMapper mapper;
    private final CustomerTableSessionService sessions;

    public CustomerOrderingService(OrderingMapper mapper, CustomerTableSessionService sessions) {
        this.mapper = mapper;
        this.sessions = sessions;
    }

    @Transactional
    public CreatedOrder create(String sessionPublicId, String idempotencyKey, String note,
            List<OrderLine> lines) {
        var normalizedLines = normalizeLines(lines);
        var fingerprint = fingerprint(note, normalizedLines);
        var session = sessions.requireCurrentForUpdate(sessionPublicId);
        var existing = mapper.findBySessionIdAndIdempotencyKey(session.sessionId(), idempotencyKey);
        if (existing != null)
            return existingOrder(existing, fingerprint);
        if (!"OPEN".equals(session.sessionStatus()))
            throw new ApiException(HttpStatus.CONFLICT, ApiMessages.INVALID_REQUEST);

        var resolvedLines = resolveLines(session.storeId(), normalizedLines);
        BigDecimal amount = BigDecimal.ZERO;
        for (var line : resolvedLines)
            amount = amount.add(line.totalAmount());

        String publicId = UUID.randomUUID().toString();
        try {
            mapper.insertOrder(publicId, session.sessionId(), idempotencyKey, fingerprint, publicId,
                    amount, note);
        } catch (DuplicateKeyException exception) {
            var concurrentOrder = mapper.findBySessionIdAndIdempotencyKey(session.sessionId(),
                    idempotencyKey);
            if (concurrentOrder != null)
                return existingOrder(concurrentOrder, fingerprint);
            throw exception;
        }
        long orderId = mapper.lastInsertId();
        for (var line : resolvedLines) {
            mapper.insertOrderItem(UUID.randomUUID().toString(), orderId, line.menuItem().id(),
                    line.menuItem().name(), line.menuItem().price(), line.optionsAmount(),
                    line.quantity(), line.totalAmount());
            long orderItemId = mapper.lastInsertOrderItemId();
            for (var option : line.options())
                mapper.insertOrderItemOption(orderItemId, option.id(), option.groupName(),
                        option.name(), option.extraPrice(), 1,
                        option.extraPrice().multiply(BigDecimal.valueOf(line.quantity())));
        }
        return new CreatedOrder(publicId, amount);
    }

    @Transactional
    public CancellationRequest requestCancellation(String sessionPublicId, String orderItemPublicId,
            String idempotencyKey, int requestedQuantity, String reason) {
        var session = sessions.requireCurrentForUpdate(sessionPublicId);
        var item = mapper.findCancellableOrderItemForUpdate(session.sessionId(), orderItemPublicId);
        if (item == null || !"OPEN".equals(item.sessionStatus()))
            throw new ApiException(HttpStatus.CONFLICT, ApiMessages.INVALID_REQUEST);
        var existing = mapper.findCancellationRequest(item.id(), idempotencyKey);
        if (existing != null) {
            if (existing.requestedQuantity() != requestedQuantity
                    || !java.util.Objects.equals(existing.reason(), reason))
                throw new ApiException(HttpStatus.CONFLICT, ApiMessages.INVALID_REQUEST);
            return existing;
        }
        if (requestedQuantity > item.quantity() - item.reservedCancellationQuantity())
            throw new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST);
        String publicId = UUID.randomUUID().toString();
        mapper.insertCancellationRequest(publicId, item.id(), idempotencyKey, requestedQuantity,
                reason);
        return new CancellationRequest(publicId, requestedQuantity, reason, "PENDING");
    }

    private List<ResolvedOrderLine> resolveLines(long storeId, List<OrderLine> lines) {
        var resolved = new ArrayList<ResolvedOrderLine>();
        for (var line : lines) {
            var item = mapper.findActiveMenuItem(storeId, line.menuItemId());
            if (item == null)
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        ApiMessages.CATALOG_RESOURCE_NOT_FOUND);
            var options = options(storeId, line);
            var optionsAmount = options.stream().map(OrderOptionValue::extraPrice)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            resolved.add(new ResolvedOrderLine(item, options, optionsAmount, line.quantity(),
                    item.price().add(optionsAmount).multiply(BigDecimal.valueOf(line.quantity()))));
        }
        return resolved;
    }

    private List<OrderOptionValue> options(long storeId, OrderLine line) {
        var groups = mapper.findActiveOptionGroups(storeId, line.menuItemId());
        if (line.optionValueIds().isEmpty()) {
            validateSelectionCounts(groups, Map.of());
            return List.of();
        }
        var values = mapper.findActiveOptionValues(storeId, line.menuItemId(),
                line.optionValueIds());
        if (values.size() != line.optionValueIds().size())
            throw new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST);
        var selections = new LinkedHashMap<Long, Integer>();
        for (var value : values)
            selections.merge(value.groupId(), 1, Integer::sum);
        validateSelectionCounts(groups, selections);
        return values;
    }

    private static void validateSelectionCounts(List<vn.cas.ordering.model.OrderOptionGroup> groups,
            Map<Long, Integer> selections) {
        for (var group : groups) {
            int selected = selections.getOrDefault(group.id(), 0);
            if (selected < group.minSelect()
                    || group.maxSelect() != null && selected > group.maxSelect())
                throw new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST);
        }
    }

    private static List<OrderLine> normalizeLines(List<OrderLine> lines) {
        var normalized = new LinkedHashMap<String, OrderLine>();
        for (var line : lines) {
            var optionIds = line.optionValueIds().stream().sorted().toList();
            if (optionIds.size() != optionIds.stream().distinct().count())
                throw new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST);
            var normalizedLine = new OrderLine(line.menuItemId(), line.quantity(), optionIds);
            var key = line.menuItemId() + ":" + optionIds;
            var previous = normalized.get(key);
            if (previous == null)
                normalized.put(key, normalizedLine);
            else {
                try {
                    normalized.put(key, new OrderLine(line.menuItemId(),
                            Math.addExact(previous.quantity(), line.quantity()), optionIds));
                } catch (ArithmeticException exception) {
                    throw new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST);
                }
            }
        }
        return normalized.values().stream().sorted(Comparator.comparingLong(OrderLine::menuItemId)
                .thenComparing(line -> line.optionValueIds().toString())).toList();
    }

    private static CreatedOrder existingOrder(vn.cas.ordering.model.StoredOrder order,
            String fingerprint) {
        if (!order.requestFingerprint().equals(fingerprint))
            throw new ApiException(HttpStatus.CONFLICT, ApiMessages.INVALID_REQUEST);
        return new CreatedOrder(order.publicId(), order.payableAmount());
    }

    static String fingerprint(String note, List<OrderLine> lines) {
        try {
            String payload = lines.stream().map(
                    line -> line.menuItemId() + ":" + line.quantity() + ":" + line.optionValueIds())
                    .collect(java.util.stream.Collectors.joining("|"));
            String noteValue = note == null ? "" : note.length() + ":" + note + "|";
            var digest = MessageDigest.getInstance("SHA-256")
                    .digest(noteValue.concat(payload).getBytes(StandardCharsets.UTF_8));
            return java.util.HexFormat.of().formatHex(digest);
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
    }

    public record OrderLine(long menuItemId, int quantity, List<Long> optionValueIds) {
    }
    public record CreatedOrder(String orderId, BigDecimal payableAmount) {
    }
    private record ResolvedOrderLine(OrderMenuItem menuItem, List<OrderOptionValue> options,
            BigDecimal optionsAmount, int quantity, BigDecimal totalAmount) {
    }
}
