package vn.cas.ordering.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.constants.ApiMessages;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.service.AuditLogService;
import vn.cas.ordering.mapper.OrderingMapper;
import vn.cas.ordering.model.PreparationItemRow;
import vn.cas.ordering.model.PreparationOptionRow;
import vn.cas.store.service.LongWaitWarningSettingService;

@Service
public class PreparationService {
    private final OrderingMapper mapper;
    private final LongWaitWarningSettingService settings;
    private final AuditLogService auditLogs;
    private final ObjectMapper objectMapper;

    public PreparationService(OrderingMapper mapper, LongWaitWarningSettingService settings,
            AuditLogService auditLogs, ObjectMapper objectMapper) {
        this.mapper = mapper;
        this.settings = settings;
        this.auditLogs = auditLogs;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<LongWaitTable> longWaitTables(OperationalPrincipal principal) {
        int threshold = settings.get(principal.storeId()).longWaitWarningMinutes();
        if (threshold == 0)
            return List.of();
        Map<Long, PreparationItemRow> oldestByTable = new LinkedHashMap<>();
        for (var item : mapper.findPreparationItems(principal.storeId())) {
            if (remainingQuantity(item) <= 0)
                continue;
            oldestByTable.putIfAbsent(item.tableId(), item);
        }
        var now = LocalDateTime.now();
        return oldestByTable.values().stream().map(item -> {
            long waitingMinutes = Math.max(0,
                    Duration.between(item.orderCreatedAt(), now).toMinutes());
            return new LongWaitTable(item.tableId(), item.tableCode(), item.orderPublicId(),
                    item.orderCreatedAt(), waitingMinutes, threshold);
        }).filter(table -> table.waitingMinutes() >= threshold).toList();
    }

    @Transactional(readOnly = true)
    public List<PreparationGroup> groups(OperationalPrincipal principal) {
        return groupItems(mapper.findPreparationItems(principal.storeId())).values().stream()
                .map(GroupState::toResponse).filter(group -> group.remainingQuantity() > 0)
                .toList();
    }

    @Transactional(noRollbackFor = DuplicateKeyException.class)
    public BatchCompletion complete(OperationalPrincipal principal, String groupKey,
            String idempotencyKey, int requestedQuantity, UUID requestId) {
        var key = GroupKey.parse(groupKey);
        String fingerprint = sha256(groupKey + ":" + requestedQuantity);
        var existing = mapper.findPreparationBatchCompletion(principal.storeId(), idempotencyKey);
        if (existing != null)
            return existingCompletion(existing.menuItemId(), existing.optionConfigurationHash(),
                    existing.requestFingerprint(), fingerprint, existing.allocationSnapshot());

        var groups = groupItems(
                mapper.findPreparationItemsForUpdate(principal.storeId(), key.menuItemId()));
        var group = groups.get(groupKey);
        if (group == null || group.remainingQuantity() < requestedQuantity)
            throw new ApiException(HttpStatus.CONFLICT, ApiMessages.INVALID_REQUEST);

        var allocations = group.allocate(requestedQuantity);
        String allocationSnapshot = writeAllocations(allocations);
        try {
            mapper.insertPreparationBatchCompletion(UUID.randomUUID().toString(),
                    principal.storeId(), key.menuItemId(), key.optionConfigurationHash(),
                    idempotencyKey, fingerprint, requestedQuantity, allocationSnapshot,
                    principal.accountId());
        } catch (DuplicateKeyException exception) {
            var duplicate = mapper.findPreparationBatchCompletion(principal.storeId(),
                    idempotencyKey);
            if (duplicate != null)
                return existingCompletion(duplicate.menuItemId(),
                        duplicate.optionConfigurationHash(), duplicate.requestFingerprint(),
                        fingerprint, duplicate.allocationSnapshot());
            throw exception;
        }
        for (var allocation : allocations)
            mapper.addPreparedQuantity(allocation.orderItemId(), allocation.quantity());
        auditLogs.record(new AuditLogCommand(principal.storeId(), requestId,
                "PREPARATION_BATCH_COMPLETED", "PREPARATION_BATCH_COMPLETION",
                mapper.lastInsertId(), groupKey, allocationSnapshot, principal.accountId(),
                principal.displayName(), "Nhân viên ghi nhận hoàn thành món theo mẻ."));
        return new BatchCompletion(groupKey, requestedQuantity,
                group.remainingQuantity() - requestedQuantity, allocations);
    }

    private Map<String, GroupState> groupItems(List<PreparationItemRow> items) {
        if (items.isEmpty())
            return Map.of();
        var optionsByItem = mapper
                .findPreparationOptions(
                        items.stream().map(PreparationItemRow::orderItemId).toList())
                .stream().collect(Collectors.groupingBy(PreparationOptionRow::orderItemId));
        Map<String, GroupState> groups = new LinkedHashMap<>();
        for (var item : items) {
            var options = normalizedOptions(
                    optionsByItem.getOrDefault(item.orderItemId(), List.of()));
            String hash = sha256(options
                    .stream().map(option -> option.groupName() + "\u0000" + option.optionName()
                            + "\u0000" + option.quantityPerItem())
                    .collect(Collectors.joining("\u0001")));
            String groupKey = item.menuItemId() + "-" + hash;
            groups.computeIfAbsent(groupKey, ignored -> new GroupState(groupKey, item.menuItemId(),
                    item.itemName(), hash, options)).add(item);
        }
        return groups;
    }

    private static List<SelectedOption> normalizedOptions(List<PreparationOptionRow> options) {
        return options.stream()
                .map(option -> new SelectedOption(option.groupName(), option.optionName(),
                        option.quantityPerItem()))
                .sorted(Comparator.comparing(SelectedOption::groupName)
                        .thenComparing(SelectedOption::optionName)
                        .thenComparingInt(SelectedOption::quantityPerItem))
                .toList();
    }

    private BatchCompletion existingCompletion(long menuItemId, String optionConfigurationHash,
            String storedFingerprint, String fingerprint, String allocationSnapshot) {
        if (!storedFingerprint.equals(fingerprint))
            throw new ApiException(HttpStatus.CONFLICT, ApiMessages.INVALID_REQUEST);
        try {
            var allocations = List
                    .of(objectMapper.readValue(allocationSnapshot, Allocation[].class));
            int quantity = allocations.stream().mapToInt(Allocation::quantity).sum();
            return new BatchCompletion(menuItemId + "-" + optionConfigurationHash, quantity, null,
                    allocations);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Stored preparation allocation is invalid", exception);
        }
    }

    private String writeAllocations(List<Allocation> allocations) {
        try {
            return objectMapper.writeValueAsString(allocations);
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Cannot serialize preparation allocation", exception);
        }
    }

    private static int remainingQuantity(PreparationItemRow item) {
        return Math.max(0, item.quantity() - item.cancelledQuantity() - item.preparedQuantity());
    }

    private static String sha256(String value) {
        try {
            return java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (java.security.NoSuchAlgorithmException exception) {
            throw new IllegalStateException(exception);
        }
    }

    private record GroupKey(long menuItemId, String optionConfigurationHash) {
        static GroupKey parse(String value) {
            int separator = value.indexOf('-');
            if (separator <= 0 || value.length() != separator + 65
                    || !value.substring(separator + 1).matches("[0-9a-f]{64}"))
                throw new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST);
            try {
                return new GroupKey(Long.parseLong(value.substring(0, separator)),
                        value.substring(separator + 1));
            } catch (NumberFormatException exception) {
                throw new ApiException(HttpStatus.BAD_REQUEST, ApiMessages.INVALID_REQUEST);
            }
        }
    }

    private static final class GroupState {
        private final String groupKey;
        private final long menuItemId;
        private final String itemName;
        private final String optionConfigurationHash;
        private final List<SelectedOption> options;
        private final List<PreparationItemRow> items = new ArrayList<>();

        private GroupState(String groupKey, long menuItemId, String itemName,
                String optionConfigurationHash, List<SelectedOption> options) {
            this.groupKey = groupKey;
            this.menuItemId = menuItemId;
            this.itemName = itemName;
            this.optionConfigurationHash = optionConfigurationHash;
            this.options = options;
        }

        private void add(PreparationItemRow item) {
            items.add(item);
        }

        private int remainingQuantity() {
            return items.stream().mapToInt(PreparationService::remainingQuantity).sum();
        }

        private List<Allocation> allocate(int requestedQuantity) {
            int remaining = requestedQuantity;
            var allocations = new ArrayList<Allocation>();
            for (var item : items) {
                int quantity = Math.min(remaining, PreparationService.remainingQuantity(item));
                if (quantity > 0) {
                    allocations.add(new Allocation(item.orderItemId(), item.orderItemPublicId(),
                            item.orderPublicId(), item.tableCode(), quantity));
                    remaining -= quantity;
                }
                if (remaining == 0)
                    break;
            }
            return allocations;
        }

        private PreparationGroup toResponse() {
            return new PreparationGroup(groupKey, menuItemId, itemName, optionConfigurationHash,
                    options, remainingQuantity(),
                    items.stream().filter(item -> PreparationService.remainingQuantity(item) > 0)
                            .map(item -> new PendingAllocation(item.orderItemPublicId(),
                                    item.orderPublicId(), item.tableCode(),
                                    PreparationService.remainingQuantity(item),
                                    item.orderCreatedAt()))
                            .toList());
        }
    }

    public record LongWaitTable(long tableId, int tableCode, String orderId,
            LocalDateTime oldestPendingOrderCreatedAt, long waitingMinutes, int thresholdMinutes) {
    }

    public record PreparationGroup(String groupKey, long menuItemId, String itemName,
            String optionConfigurationHash, List<SelectedOption> options, int remainingQuantity,
            List<PendingAllocation> allocations) {
    }

    public record SelectedOption(String groupName, String optionName, int quantityPerItem) {
    }

    public record PendingAllocation(String orderItemId, String orderId, int tableCode,
            int remainingQuantity, LocalDateTime orderCreatedAt) {
    }

    public record BatchCompletion(String groupKey, int requestedQuantity, Integer remainingQuantity,
            List<Allocation> allocations) {
    }

    public record Allocation(long orderItemId, String orderItemPublicId, String orderId,
            int tableCode, int quantity) {
    }
}
