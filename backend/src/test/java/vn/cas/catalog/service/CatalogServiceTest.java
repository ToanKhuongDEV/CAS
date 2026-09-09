package vn.cas.catalog.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.cas.catalog.mapper.CatalogMapper;
import vn.cas.catalog.model.CatalogMenuItem;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.service.AuditLogService;

class CatalogServiceTest {
    private final CatalogMapper mapper = mock(CatalogMapper.class);
    private final AuditLogService audit = mock(AuditLogService.class);
    private final CatalogService service = new CatalogService(mapper, audit,
            mock(CloudinarySignatureService.class));
    private final OperationalPrincipal operator = new OperationalPrincipal(2L, 3L, "firebase-uid",
            "Operator One", "OPERATOR");

    @Test
    void shouldLetOperatorMarkPublishedItemSoldOut() {
        when(mapper.findMenuItem(3L, 10L, false)).thenReturn(item("ACTIVE"));
        when(mapper.bulkUpdateMenuItemStatus(3L, List.of(10L), "SOLD_OUT", 2L)).thenReturn(1);

        service.updateOperatorItemAvailability(operator, 10L, "SOLD_OUT", UUID.randomUUID());

        verify(mapper).bulkUpdateMenuItemStatus(3L, List.of(10L), "SOLD_OUT", 2L);
        verify(audit).record(any());
    }

    @Test
    void shouldNotLetOperatorMakeHiddenItemAvailable() {
        when(mapper.findMenuItem(3L, 10L, false)).thenReturn(item("INACTIVE"));

        assertThatThrownBy(() -> service.updateOperatorItemAvailability(operator, 10L, "ACTIVE",
                UUID.randomUUID())).isInstanceOf(ApiException.class);

        verify(mapper, never()).bulkUpdateMenuItemStatus(anyLong(), anyList(), anyString(),
                anyLong());
    }

    private static CatalogMenuItem item(String availabilityStatus) {
        return new CatalogMenuItem(10L, 1L, "Mì cay", null, BigDecimal.valueOf(45000), null, null,
                availabilityStatus, 1, LocalDateTime.of(2026, 9, 9, 12, 0));
    }
}
