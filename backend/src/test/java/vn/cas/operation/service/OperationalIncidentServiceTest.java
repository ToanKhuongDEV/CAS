package vn.cas.operation.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.mapper.OperationalIncidentMapper;
import vn.cas.operation.model.OperationalIncident;

class OperationalIncidentServiceTest {
    private final OperationalIncidentMapper incidents = mock(OperationalIncidentMapper.class);
    private final AuditLogService auditLogs = mock(AuditLogService.class);
    private final OperationalIncidentService service = new OperationalIncidentService(incidents,
            auditLogs);
    private final OperationalPrincipal operator = new OperationalPrincipal(2L, 3L, "uid",
            "Operator", "OPERATOR");

    @Test
    void shouldCreateIncidentForCurrentStoreAndRecordAuditLog() {
        when(incidents.insert(any())).thenAnswer(invocation -> {
            ((vn.cas.operation.dto.CreateOperationalIncidentCommand) invocation.getArgument(0))
                    .setId(9L);
            return 1;
        });
        when(incidents.findByPublicId(anyLong(), any())).thenReturn(incident());

        OperationalIncident result = service.create(operator, "Operator", "Máy in bị kẹt giấy.",
                UUID.randomUUID());

        assertThat(result.publicId()).isEqualTo("incident-1");
        verify(incidents).findByPublicId(eq(3L), org.mockito.ArgumentMatchers.anyString());
        verify(auditLogs).record(any());
    }

    @Test
    void shouldListOnlyCurrentStoreIncidentsForAdmin() {
        when(incidents.findAllByStoreId(3L)).thenReturn(List.of(incident()));

        assertThat(service.findAllForAdmin(operator)).containsExactly(incident());
    }

    private static OperationalIncident incident() {
        return new OperationalIncident("incident-1", "Operator", "Máy in bị kẹt giấy.",
                LocalDateTime.of(2026, 9, 11, 10, 0));
    }
}
