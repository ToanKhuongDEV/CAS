package vn.cas.catalog.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import vn.cas.catalog.mapper.CatalogMapper;
import vn.cas.catalog.model.CatalogMenuItem;
import vn.cas.catalog.model.CatalogOptionGroup;
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
    void reportsDuplicateOptionNameOnCreateAndUpdate() {
        when(mapper.findOptionGroup(3L, 5L)).thenReturn(
                new CatalogOptionGroup(5L, "Topping", "MULTIPLE", 0, null, 0, "ACTIVE"));
        when(mapper.insertOptionValue(5L, "Trân châu", BigDecimal.ZERO, false, 0, "ACTIVE", 2L))
                .thenThrow(new DuplicateKeyException("duplicate"));
        when(mapper.updateOptionValue(3L, 7L, "Trân châu", BigDecimal.ZERO, false, 0, "ACTIVE", 2L))
                .thenThrow(new DuplicateKeyException("duplicate"));

        assertThatThrownBy(() -> service.createValue(operator, 5L, "Trân châu", BigDecimal.ZERO,
                false, 0, "ACTIVE", UUID.randomUUID()))
                .isInstanceOfSatisfying(ApiException.class, e -> {
                    org.assertj.core.api.Assertions.assertThat(e.status())
                            .isEqualTo(HttpStatus.CONFLICT);
                    org.assertj.core.api.Assertions.assertThat(e.getMessage()).contains("Trân châu",
                            "đã tồn tại trong nhóm này");
                });
        assertThatThrownBy(() -> service.updateValue(operator, 7L, "Trân châu", BigDecimal.ZERO,
                false, 0, "ACTIVE", UUID.randomUUID()))
                .isInstanceOfSatisfying(ApiException.class, e -> {
                    org.assertj.core.api.Assertions.assertThat(e.status())
                            .isEqualTo(HttpStatus.CONFLICT);
                    org.assertj.core.api.Assertions.assertThat(e.getMessage()).contains("Trân châu",
                            "đã tồn tại trong nhóm này");
                });
    }

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
