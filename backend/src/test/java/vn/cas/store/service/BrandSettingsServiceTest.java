package vn.cas.store.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import vn.cas.catalog.service.CloudinarySignatureService;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.service.AuditLogService;
import vn.cas.store.mapper.BrandSettingsMapper;
import vn.cas.store.model.BrandSettings;

class BrandSettingsServiceTest {

    private final BrandSettingsMapper mapper = mock(BrandSettingsMapper.class);
    private final CloudinarySignatureService cloudinary = mock(CloudinarySignatureService.class);
    private final AuditLogService auditLogs = mock(AuditLogService.class);
    private final BrandSettingsService service = new BrandSettingsService(mapper, cloudinary,
            auditLogs);

    @Test
    void updatesSharedBrandOnlyForSuperAdmin() {
        var principal = new OperationalPrincipal(7, 2, "super-admin", "Super Admin", "SUPER_ADMIN");
        var current = new BrandSettings("CAS",
                "https://res.cloudinary.com/cas/image/upload/v1/cas/brand/brand_logo.png",
                "cas/brand/brand_logo", "Slogan cũ");
        var requested = new BrandSettings("CAS mới", current.logoUrl(), current.logoStorageKey(),
                "Slogan mới");
        when(mapper.find()).thenReturn(current, requested);

        service.update(principal, requested, UUID.randomUUID());

        verify(cloudinary, never()).validateBrandAsset(any(), any());
        verify(mapper).update(requested.name(), requested.logoUrl(), requested.logoStorageKey(),
                requested.welcomeSlogan());
        verify(auditLogs).record(any());
    }

    @Test
    void rejectsAdmin() {
        var principal = new OperationalPrincipal(8, 1, "admin", "Admin", "ADMIN");

        assertThrows(ApiException.class, () -> service.get(principal));
        verifyNoInteractions(mapper);
    }
}
