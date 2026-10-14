package vn.cas.operation.mapper;

import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import vn.cas.operation.model.AdminDashboard;

@Mapper
public interface AdminDashboardMapper {
    AdminDashboard.RevenueSummary findRevenueSummary(@Param("storeId") long storeId,
            @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    List<AdminDashboard.RevenuePoint> findRevenueSeries(@Param("storeId") long storeId,
            @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    AdminDashboard.CustomerSummary findCustomerSummary(@Param("storeId") long storeId,
            @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    List<AdminDashboard.CustomerPoint> findCustomerSeries(@Param("storeId") long storeId,
            @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    List<AdminDashboard.MenuItem> findMenuItems(@Param("storeId") long storeId,
            @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    AdminDashboard.PromotionSummary findPromotionSummary(@Param("storeId") long storeId,
            @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    AdminDashboard.PromotionStatusCounts findPromotionStatusCounts(@Param("storeId") long storeId);
}
