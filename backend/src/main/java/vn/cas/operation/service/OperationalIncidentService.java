package vn.cas.operation.service;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.dto.CreateOperationalIncidentCommand;
import vn.cas.operation.mapper.OperationalIncidentMapper;
import vn.cas.operation.model.OperationalIncident;

@Service
public class OperationalIncidentService {
    private final OperationalIncidentMapper incidents;
    private final AuditLogService auditLogs;

    public OperationalIncidentService(OperationalIncidentMapper incidents,
            AuditLogService auditLogs) {
        this.incidents = incidents;
        this.auditLogs = auditLogs;
    }

    @Transactional
    public OperationalIncident create(OperationalPrincipal principal, String reporterName,
            String description, UUID requestId) {
        String publicId = UUID.randomUUID().toString();
        CreateOperationalIncidentCommand command = new CreateOperationalIncidentCommand(publicId,
                principal.storeId(), reporterName, principal.accountId(), description);
        if (incidents.insert(command) != 1)
            throw new ApiException(HttpStatus.CONFLICT, "Không thể gửi báo cáo sự cố.");
        OperationalIncident incident = incidents.findByPublicId(principal.storeId(), publicId);
        if (incident == null)
            throw new ApiException(HttpStatus.CONFLICT, "Không thể gửi báo cáo sự cố.");
        auditLogs.record(new AuditLogCommand(principal.storeId(), requestId,
                "OPERATIONAL_INCIDENT_CREATED", "OPERATIONAL_INCIDENT", command.getId(), publicId,
                "{}", principal.accountId(), principal.displayName(),
                "Tạo báo cáo sự cố vận hành."));
        return incident;
    }

    @Transactional(readOnly = true)
    public List<OperationalIncident> findAllForAdmin(OperationalPrincipal principal) {
        return incidents.findAllByStoreId(principal.storeId());
    }
}
