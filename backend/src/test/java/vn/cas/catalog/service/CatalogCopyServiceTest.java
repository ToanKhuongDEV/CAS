package vn.cas.catalog.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import vn.cas.catalog.mapper.CatalogMapper;
import vn.cas.catalog.model.CatalogCategory;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.service.AuditLogService;

class CatalogCopyServiceTest {
    private final CatalogMapper mapper = mock(CatalogMapper.class);
    private final AuditLogService audit = mock(AuditLogService.class);
    private final CatalogCopyService service = new CatalogCopyService(mapper, audit);

    @Test
    void forbidsNonSuperAdminWithoutAccessingStores() {
        var admin = new OperationalPrincipal(1, 1, "uid", "Admin", "ADMIN");
        assertThatThrownBy(() -> service.copy(admin, 1, 2, UUID.randomUUID()))
                .isInstanceOfSatisfying(ApiException.class, error -> org.assertj.core.api.Assertions
                        .assertThat(error.status()).isEqualTo(HttpStatus.FORBIDDEN));
        verifyNoInteractions(mapper, audit);
    }

    @Test
    void rejectsDestinationWithExistingCatalog() {
        var admin = new OperationalPrincipal(1, 1, "uid", "Admin", "SUPER_ADMIN");
        when(mapper.lockStore(1)).thenReturn(1L);
        when(mapper.lockStore(2)).thenReturn(2L);
        when(mapper.findCategories(2, false, false)).thenReturn(
                List.of(new CatalogCategory(3, "Existing", null, "REGULAR", 0, "ACTIVE")));
        assertThatThrownBy(() -> service.copy(admin, 1, 2, UUID.randomUUID()))
                .isInstanceOfSatisfying(ApiException.class, error -> org.assertj.core.api.Assertions
                        .assertThat(error.status()).isEqualTo(HttpStatus.CONFLICT));
        verify(mapper, never()).insertCategory(anyLong(), anyString(), any(), anyString(), anyInt(),
                anyString(), anyLong());
        verifyNoInteractions(audit);
    }
}
