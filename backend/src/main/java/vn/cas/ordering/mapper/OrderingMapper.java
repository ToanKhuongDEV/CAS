package vn.cas.ordering.mapper;

import java.math.BigDecimal;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import vn.cas.ordering.model.OrderMenuItem;
import vn.cas.ordering.model.OrderOptionGroup;
import vn.cas.ordering.model.OrderOptionValue;
import vn.cas.ordering.model.StoredOrder;
import vn.cas.ordering.model.CancellableOrderItem;
import vn.cas.ordering.model.CancellationRequest;
import vn.cas.ordering.model.OrderItemOptionView;
import vn.cas.ordering.model.OrderItemView;
import vn.cas.ordering.model.OrderOverview;

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
}
