package vn.cas.operation.mapper;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import vn.cas.operation.model.AdminCustomerSession;
import vn.cas.operation.model.AdminCustomerSummary;
import vn.cas.operation.model.AuditLogView;

@Mapper
public interface AdminLookupMapper {
    List<AdminCustomerSummary> findCustomers(@Param("storeId") long storeId,
            @Param("query") String query);

    AdminCustomerSummary findCustomer(@Param("storeId") long storeId,
            @Param("customerId") long customerId);

    String findCustomerPhone(@Param("storeId") long storeId, @Param("customerId") long customerId);

    List<AdminCustomerSession> findCustomerSessions(@Param("storeId") long storeId,
            @Param("customerId") long customerId);

    List<AuditLogView> findAuditLogs(@Param("storeId") long storeId, @Param("query") String query,
            @Param("action") String action, @Param("entityType") String entityType,
            @Param("limit") int limit, @Param("offset") int offset);

    long countAuditLogs(@Param("storeId") long storeId, @Param("query") String query,
            @Param("action") String action, @Param("entityType") String entityType);
}
