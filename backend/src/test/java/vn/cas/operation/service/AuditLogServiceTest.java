package vn.cas.operation.service;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.cas.operation.dto.AuditLogCommand;
import vn.cas.operation.mapper.AuditLogMapper;

class AuditLogServiceTest {

    @Test
    void shouldPersistAuditCommandWithoutChangingItsPayload() {
        AuditLogMapper mapper = mock(AuditLogMapper.class);
        AuditLogService service = new AuditLogService(mapper);
        AuditLogCommand command = new AuditLogCommand(1L, UUID.randomUUID(), "CREATE", "ORDER", 3L,
                "ORD-001", "{}", 2L, "Operator One", "Created an order for customer");

        service.record(command);

        verify(mapper).insert(command);
    }
}
