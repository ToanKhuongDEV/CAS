package vn.cas.catalog.controller;

import static org.mockito.Mockito.*;

import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import vn.cas.catalog.service.CatalogService;
import vn.cas.common.exception.ApiException;
import vn.cas.common.web.RequestId;
import vn.cas.store.service.SalesSessionService;
import vn.cas.store.service.StoreSettingsService;

class CatalogControllerTest {
    private final CatalogService catalog = mock(CatalogService.class);
    private final SalesSessionService sessions = mock(SalesSessionService.class);
    private final StoreSettingsService stores = mock(StoreSettingsService.class);
    private final CatalogController controller = new CatalogController(catalog, sessions, stores);

    private MockHttpServletRequest request() {
        var request = new MockHttpServletRequest();
        request.setAttribute(RequestId.ATTRIBUTE_NAME, UUID.randomUUID());
        return request;
    }

    @Test
    void publicCatalogUsesSelectedStoreForAllEndpoints() {
        var request = request();
        controller.customerItems(null, 2L, request);
        controller.customerCategories(null, 2L, request);
        controller.customerTags(null, 2L, request);
        controller.customerOptionGroups(null, 2L, request);
        controller.customerItem(null, 2L, 42L, request);
        verify(stores, times(5)).getPublic(2L);
        verify(catalog).items(2L, true);
        verify(catalog).categories(2L, true);
        verify(catalog).tags(2L, true);
        verify(catalog).optionGroups(2L, true);
        verify(catalog).item(2L, 42L, true);
    }

    @Test
    void activeSessionStoreTakesPrecedenceOverSelectedStore() {
        when(sessions.getCurrentStoreId("session")).thenReturn(3L);
        controller.customerItems("session", 2L, request());
        verify(catalog).items(3L, true);
        verifyNoInteractions(stores);
    }

    @Test
    void missingOrExpiredSessionUsesSelectedOrDefaultStore() {
        when(sessions.getCurrentStoreId("expired"))
                .thenThrow(new ApiException(HttpStatus.UNAUTHORIZED, "expired"));
        controller.customerItems("expired", 2L, request());
        controller.customerItems(null, null, request());
        verify(catalog).items(2L, true);
        verify(catalog).items(1L, true);
    }
}
