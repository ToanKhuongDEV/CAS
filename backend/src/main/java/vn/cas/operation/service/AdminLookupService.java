package vn.cas.operation.service;

import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.mapper.AdminLookupMapper;
import vn.cas.operation.model.AdminCustomerDetail;
import vn.cas.operation.model.AdminCustomerSummary;
import vn.cas.operation.model.AuditLogPage;

@Service
public class AdminLookupService {
    private final AdminLookupMapper mapper;

    public AdminLookupService(AdminLookupMapper mapper) {
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<AdminCustomerSummary> customers(OperationalPrincipal principal, String query) {
        return mapper.findCustomers(principal.storeId(), normalize(query));
    }

    @Transactional(readOnly = true)
    public AdminCustomerDetail customer(OperationalPrincipal principal, long customerId) {
        var customer = mapper.findCustomer(principal.storeId(), customerId);
        if (customer == null)
            throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng.");
        return new AdminCustomerDetail(customer.id(), customer.displayName(),
                mapper.findCustomerPhone(principal.storeId(), customerId),
                mapper.findCustomerSessions(principal.storeId(), customerId));
    }

    @Transactional(readOnly = true)
    public AuditLogPage auditLogs(OperationalPrincipal principal, String query, String action,
            String entityType, int page, int size) {
        String normalizedQuery = normalize(query);
        String normalizedAction = normalize(action);
        String normalizedEntityType = normalize(entityType);
        return new AuditLogPage(
                mapper.findAuditLogs(principal.storeId(), normalizedQuery, normalizedAction,
                        normalizedEntityType, size, page * size),
                mapper.countAuditLogs(principal.storeId(), normalizedQuery, normalizedAction,
                        normalizedEntityType),
                page, size);
    }

    private static String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
