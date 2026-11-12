package vn.cas.store.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalTime;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.catalog.service.CatalogCopyService;
import vn.cas.operation.service.AuditLogService;
import vn.cas.store.dto.CreateStoreCommand;
import vn.cas.store.mapper.StoreSettingsMapper;
import vn.cas.store.model.StoreSettings;

class StoreSettingsServiceTest {
    private final StoreSettingsMapper mapper = mock(StoreSettingsMapper.class);
    private final AuditLogService audit = mock(AuditLogService.class);
    private final CatalogCopyService catalogCopy = mock(CatalogCopyService.class);
    private final StoreSettingsService service = new StoreSettingsService(mapper, audit,
            catalogCopy);
    private final StoreSettings settings = new StoreSettings(0, "Branch", "Address", "0900",
            "branch@example.com", null, null, null, null, null, LocalTime.of(8, 0),
            LocalTime.of(22, 0), null, "ACTIVE", null);

    @Test
    void createsStoreForSuperAdminAndRecordsAudit() {
        doAnswer(invocation -> {
            invocation.getArgument(0, CreateStoreCommand.class).setId(12);
            return 1;
        }).when(mapper).insertStore(any());
        when(mapper.findByStoreId(12)).thenReturn(settings);
        var principal = new OperationalPrincipal(1, 2, "uid", "Admin", "SUPER_ADMIN");

        assertThat(service.create(principal, settings, null, UUID.randomUUID()))
                .isEqualTo(settings);
        verifyNoInteractions(catalogCopy);
        verify(audit).record(argThat(command -> command.storeId() == 12 && command.entityId() == 12
                && command.action().equals("CREATE")));
    }

    @Test
    void rejectsOtherRolesBeforeWriting() {
        var principal = new OperationalPrincipal(1, 2, "uid", "Admin", "ADMIN");
        assertThatThrownBy(() -> service.create(principal, settings, null, UUID.randomUUID()))
                .isInstanceOf(ApiException.class)
                .extracting(exception -> ((ApiException) exception).status())
                .isEqualTo(HttpStatus.FORBIDDEN);
        verifyNoInteractions(mapper, audit, catalogCopy);
    }

    @Test
    void copiesChosenSourceToNewStore() {
        doAnswer(invocation -> {
            invocation.getArgument(0, CreateStoreCommand.class).setId(12);
            return 1;
        }).when(mapper).insertStore(any());
        when(mapper.findByStoreId(12)).thenReturn(settings);
        var principal = new OperationalPrincipal(1, 2, "uid", "Admin", "SUPER_ADMIN");
        var requestId = UUID.randomUUID();
        service.create(principal, settings, 2L, requestId);
        verify(catalogCopy).copy(principal, 2L, 12L, requestId);
    }
}
