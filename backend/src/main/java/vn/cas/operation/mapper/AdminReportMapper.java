package vn.cas.operation.mapper;

import java.time.LocalDateTime;
import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import vn.cas.operation.model.AdminReport;

@Mapper
public interface AdminReportMapper {
    List<AdminReport.Revenue> revenue(@Param("storeId") long storeId,
            @Param("from") LocalDateTime from, @Param("to") LocalDateTime to,
            @Param("limit") int limit, @Param("offset") long offset);
    long countRevenue(@Param("storeId") long storeId, @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
    List<AdminReport.Order> orders(@Param("storeId") long storeId,
            @Param("from") LocalDateTime from, @Param("to") LocalDateTime to,
            @Param("limit") int limit, @Param("offset") long offset);
    long countOrders(@Param("storeId") long storeId, @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
    List<AdminReport.Remade> remade(@Param("storeId") long storeId,
            @Param("from") LocalDateTime from, @Param("to") LocalDateTime to,
            @Param("limit") int limit, @Param("offset") long offset);
    long countRemade(@Param("storeId") long storeId, @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to);
}
