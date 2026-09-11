package vn.cas.operation.mapper;

import java.time.LocalDateTime;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import vn.cas.operation.model.OperatorDashboardSummary;

@Mapper
public interface OperatorDashboardMapper {
    OperatorDashboardSummary findSummary(@Param("storeId") long storeId,
            @Param("todayStart") LocalDateTime todayStart,
            @Param("tomorrowStart") LocalDateTime tomorrowStart);
}
