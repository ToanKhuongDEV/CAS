package vn.cas.ordering.mapper;

import java.math.BigDecimal;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import vn.cas.ordering.model.OrderMenuItem;
import vn.cas.ordering.model.OrderOptionGroup;
import vn.cas.ordering.model.OrderOptionValue;
import vn.cas.ordering.model.OperatorCancellationRequestRow;
import vn.cas.ordering.model.PreparedItemTransfer;
import vn.cas.ordering.model.StoredOrder;
import vn.cas.ordering.model.CancellableOrderItem;
import vn.cas.ordering.model.CancellationRequest;
import vn.cas.ordering.model.OrderItemOptionView;
import vn.cas.ordering.model.OrderItemOptionRemakeSnapshot;
import vn.cas.ordering.model.OrderItemRemakeSnapshot;
import vn.cas.ordering.model.OrderItemView;
import vn.cas.ordering.model.OrderOverview;
import vn.cas.ordering.model.PreparationItemRow;
import vn.cas.ordering.model.PreparationOptionRow;
import vn.cas.ordering.model.StoredPreparationBatchCompletion;

@Mapper
public interface OrderingMapper {

    OrderMenuItem findActiveMenuItem(@Param("storeId") long storeId,
            @Param("menuItemId") long menuItemId);

    List<OrderOptionValue> findActiveOptionValues(@Param("storeId") long storeId,
            @Param("menuItemId") long menuItemId,
            @Param("optionValueIds") List<Long> optionValueIds);

    List<OrderOptionGroup> findActiveOptionGroups(@Param("storeId") long storeId,
            @Param("menuItemId") long menuItemId);

    StoredOrder findBySessionIdAndIdempotencyKey(@Param("sessionId") long sessionId,
            @Param("idempotencyKey") String idempotencyKey);

    CancellableOrderItem findCancellableOrderItemForUpdate(@Param("sessionId") long sessionId,
            @Param("orderItemPublicId") String orderItemPublicId);

    CancellationRequest findCancellationRequest(@Param("orderItemId") long orderItemId,
            @Param("idempotencyKey") String idempotencyKey);

    boolean hasPendingCancellationRequests(@Param("sessionId") long sessionId);

    int insertCancellationRequest(@Param("publicId") String publicId,
            @Param("orderItemId") long orderItemId, @Param("idempotencyKey") String idempotencyKey,
            @Param("requestedQuantity") int requestedQuantity, @Param("reason") String reason);

    int insertOrder(@Param("publicId") String publicId, @Param("sessionId") long sessionId,
            @Param("createdByAccountId") Long createdByAccountId,
            @Param("idempotencyKey") String idempotencyKey,
            @Param("fingerprint") String fingerprint, @Param("orderNumber") String orderNumber,
            @Param("amount") BigDecimal amount, @Param("note") String note);

    long lastInsertId();

    int insertOrderItem(@Param("publicId") String publicId, @Param("orderId") long orderId,
            @Param("menuItemId") long menuItemId, @Param("itemName") String itemName,
            @Param("unitPrice") BigDecimal unitPrice,
            @Param("optionsAmount") BigDecimal optionsAmount, @Param("quantity") int quantity,
            @Param("totalAmount") BigDecimal totalAmount);

    long lastInsertOrderItemId();

    int insertOrderItemOption(@Param("orderItemId") long orderItemId,
            @Param("optionValueId") long optionValueId, @Param("groupName") String groupName,
            @Param("optionName") String optionName, @Param("unitPrice") BigDecimal unitPrice,
            @Param("quantity") int quantity, @Param("totalAmount") BigDecimal totalAmount);

    List<OrderOverview> findOrderOverviewsBySessionId(@Param("sessionId") long sessionId);

    List<OrderItemView> findOrderItemsBySessionId(@Param("sessionId") long sessionId);

    List<OrderItemOptionView> findOrderItemOptionsBySessionId(@Param("sessionId") long sessionId);

    List<PreparationItemRow> findPreparationItems(@Param("storeId") long storeId);

    List<PreparationItemRow> findPreparationItemsForUpdate(@Param("storeId") long storeId,
            @Param("menuItemId") long menuItemId);

    List<PreparationOptionRow> findPreparationOptions(
            @Param("orderItemIds") List<Long> orderItemIds);

    StoredPreparationBatchCompletion findPreparationBatchCompletion(@Param("storeId") long storeId,
            @Param("idempotencyKey") String idempotencyKey);

    int insertPreparationBatchCompletion(@Param("publicId") String publicId,
            @Param("storeId") long storeId, @Param("menuItemId") long menuItemId,
            @Param("optionConfigurationHash") String optionConfigurationHash,
            @Param("idempotencyKey") String idempotencyKey,
            @Param("requestFingerprint") String requestFingerprint,
            @Param("requestedQuantity") int requestedQuantity,
            @Param("allocationSnapshot") String allocationSnapshot,
            @Param("completedByAccountId") long completedByAccountId);

    int addPreparedQuantity(@Param("orderItemId") long orderItemId,
            @Param("quantity") int quantity);

    List<OperatorCancellationRequestRow> findPendingCancellationRequests(
            @Param("storeId") long storeId);

    OperatorCancellationRequestRow findOperatorCancellationRequest(@Param("storeId") long storeId,
            @Param("publicId") String publicId);

    OperatorCancellationRequestRow findOperatorCancellationRequestForUpdate(
            @Param("storeId") long storeId, @Param("publicId") String publicId);

    int resolveCancellationRequest(@Param("id") long id, @Param("status") String status,
            @Param("isRemade") boolean isRemade, @Param("resolvedBy") long resolvedBy,
            @Param("resolvedByName") String resolvedByName);

    int setPreparedQuantity(@Param("orderItemId") long orderItemId,
            @Param("preparedQuantity") int preparedQuantity);

    int insertPreparedItemTransfer(@Param("publicId") String publicId,
            @Param("transfer") PreparedItemTransfer transfer);

    int recalculateOrderPayableAmount(@Param("orderId") long orderId);

    int insertApprovedOperatorCancellationRequest(@Param("publicId") String publicId,
            @Param("orderItemId") long orderItemId, @Param("idempotencyKey") String idempotencyKey,
            @Param("requestedQuantity") int requestedQuantity, @Param("reason") String reason,
            @Param("isRemade") boolean isRemade, @Param("createdBy") long createdBy,
            @Param("createdByName") String createdByName);

    OrderItemRemakeSnapshot findOrderItemRemakeSnapshot(@Param("orderItemId") long orderItemId);

    List<OrderItemOptionRemakeSnapshot> findOrderItemOptionRemakeSnapshots(
            @Param("orderItemId") long orderItemId);
}
