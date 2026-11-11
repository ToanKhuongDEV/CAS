package vn.cas.operation.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import vn.cas.common.exception.GlobalExceptionHandler;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.model.AdminReport;
import vn.cas.operation.service.AdminReportService;

class AdminReportControllerTest {
    private final AdminReportService service = mock(AdminReportService.class);
    private final OperationalPrincipal admin = new OperationalPrincipal(1, 7, "uid", "Admin",
            "ADMIN");
    private MockMvc mvc;

    @BeforeEach
    void setup() {
        SecurityContextHolder.getContext()
                .setAuthentication(new UsernamePasswordAuthenticationToken(admin, null));
        mvc = MockMvcBuilders.standaloneSetup(new AdminReportController(service))
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .setControllerAdvice(new GlobalExceptionHandler()).build();
    }

    @AfterEach
    void cleanup() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void returnsPagedReportWithAuthenticatedStore() throws Exception {
        var from = LocalDate.of(2026, 10, 1);
        var to = LocalDate.of(2026, 10, 31);
        when(service.page(admin, AdminReport.Type.ORDERS, from, to, 1, 10))
                .thenReturn(new AdminReport.Page(List.of(), 11, 1, 10));
        mvc.perform(get("/api/v1/admin/reports").param("type", "ORDERS").param("from", "2026-10-01")
                .param("to", "2026-10-31").param("page", "1").param("size", "10"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data.total").value(11));
        verify(service).page(admin, AdminReport.Type.ORDERS, from, to, 1, 10);
    }

    @Test
    void rejectsMalformedAndMissingParameters() throws Exception {
        mvc.perform(get("/api/v1/admin/reports").param("type", "ORDERS").param("from", "invalid")
                .param("to", "2026-10-31")).andExpect(status().isBadRequest());
        mvc.perform(
                get("/api/v1/admin/reports").param("from", "2026-10-01").param("to", "2026-10-31"))
                .andExpect(status().isBadRequest());
        verify(service, never()).page(any(), any(), any(), any(), anyInt(), anyInt());
    }

    @Test
    void returnsExcelAttachmentForAllTypes() throws Exception {
        var response = mvc
                .perform(get("/api/v1/admin/reports/export").param("type", "ALL")
                        .param("from", "2026-10-01").param("to", "2026-10-31"))
                .andExpect(status().isOk()).andExpect(request().asyncStarted()).andExpect(header()
                        .string("Content-Disposition", "attachment; filename=cas-reports.xlsx"))
                .andReturn();
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders
                .asyncDispatch(response)).andExpect(status().isOk());
        verify(service).export(eq(admin), eq(AdminReport.Type.ALL), eq(LocalDate.of(2026, 10, 1)),
                eq(LocalDate.of(2026, 10, 31)), any());
    }
}
