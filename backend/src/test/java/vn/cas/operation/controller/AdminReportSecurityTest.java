package vn.cas.operation.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import vn.cas.common.config.SecurityConfiguration;
import vn.cas.common.security.ApiAccessDeniedHandler;
import vn.cas.common.security.ApiAuthenticationEntryPoint;
import vn.cas.common.security.FirebaseAuthenticationFilter;
import vn.cas.operation.mapper.OperationalAccountMapper;
import vn.cas.operation.model.AccountRole;
import vn.cas.operation.model.AdminReport;
import vn.cas.operation.model.OperationalAccount;
import vn.cas.operation.service.AdminReportService;
import vn.cas.operation.service.firebase.FirebaseTokenVerifier;
import vn.cas.store.mapper.StoreSettingsMapper;
import vn.cas.store.model.StoreSettings;

@WebMvcTest(AdminReportController.class)
@Import({SecurityConfiguration.class, FirebaseAuthenticationFilter.class,
        ApiAccessDeniedHandler.class, ApiAuthenticationEntryPoint.class})
class AdminReportSecurityTest {
    @Autowired
    MockMvc mvc;
    @MockitoBean
    AdminReportService service;
    @MockitoBean
    FirebaseTokenVerifier tokens;
    @MockitoBean
    OperationalAccountMapper accounts;
    @MockitoBean
    StoreSettingsMapper stores;

    private void account(AccountRole role) {
        when(tokens.verifyAndGetUid("token")).thenReturn("uid");
        when(accounts.findActiveByFirebaseUid("uid")).thenReturn(Optional
                .of(new OperationalAccount(1, 2, "uid", "test@example.com", null, "Test", role)));
    }

    @Test
    void rejectsUnauthenticatedAndOperatorRequests() throws Exception {
        mvc.perform(get("/api/v1/admin/reports").param("type", "ORDERS").param("from", "2026-10-01")
                .param("to", "2026-10-31")).andExpect(status().isUnauthorized());
        account(AccountRole.OPERATOR);
        mvc.perform(get("/api/v1/admin/reports").header("Authorization", "Bearer token")
                .param("type", "ORDERS").param("from", "2026-10-01").param("to", "2026-10-31"))
                .andExpect(status().isForbidden());
        mvc.perform(get("/api/v1/admin/reports/export").header("Authorization", "Bearer token")
                .param("type", "ALL").param("from", "2026-10-01").param("to", "2026-10-31"))
                .andExpect(status().isForbidden());
        verifyNoInteractions(service);
    }

    @Test
    void allowsAdminAndUsesItsAssignedStore() throws Exception {
        account(AccountRole.ADMIN);
        when(service.page(any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(new AdminReport.Page(List.of(), 0, 0, 10));
        mvc.perform(get("/api/v1/admin/reports").header("Authorization", "Bearer token")
                .param("type", "ORDERS").param("from", "2026-10-01").param("to", "2026-10-31"))
                .andExpect(status().isOk());
        verify(service).page(argThat(principal -> principal.storeId() == 2), any(), any(), any(),
                anyInt(), anyInt());
    }

    @Test
    void allowsSuperAdminToUseAnAuthorizedSelectedStore() throws Exception {
        account(AccountRole.SUPER_ADMIN);
        when(stores.findByStoreId(3)).thenReturn(mock(StoreSettings.class));
        when(service.page(any(), any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(new AdminReport.Page(List.of(), 0, 0, 10));
        mvc.perform(get("/api/v1/admin/reports").header("Authorization", "Bearer token")
                .header("X-CAS-Store-Id", "3").param("type", "ORDERS").param("from", "2026-10-01")
                .param("to", "2026-10-31")).andExpect(status().isOk());
        verify(service).page(argThat(principal -> principal.storeId() == 3), any(), any(), any(),
                anyInt(), anyInt());
    }
}
