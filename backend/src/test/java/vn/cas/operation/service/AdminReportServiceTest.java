package vn.cas.operation.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.mapper.AdminReportMapper;
import vn.cas.operation.model.AdminReport;

class AdminReportServiceTest {
    private final AdminReportMapper mapper = mock(AdminReportMapper.class);
    private final AdminReportService service = new AdminReportService(mapper);
    private final OperationalPrincipal admin = new OperationalPrincipal(1, 7, "uid", "Admin",
            "ADMIN");
    private final LocalDate from = LocalDate.of(2026, 10, 1);
    private final LocalDate to = LocalDate.of(2026, 10, 31);

    @Test
    void paginatesWithinCurrentStoreAndInclusiveDateRange() {
        when(mapper.orders(7, from.atStartOfDay(), to.plusDays(1).atStartOfDay(), 10, 20))
                .thenReturn(List.of());
        when(mapper.countOrders(7, from.atStartOfDay(), to.plusDays(1).atStartOfDay()))
                .thenReturn(25L);
        var page = service.page(admin, AdminReport.Type.ORDERS, from, to, 2, 10);
        assertThat(page.total()).isEqualTo(25);
        assertThat(page.page()).isEqualTo(2);
        verify(mapper).orders(7, from.atStartOfDay(), to.plusDays(1).atStartOfDay(), 10, 20);
    }

    @Test
    void rejectsInvalidDatesAndPagination() {
        assertThatThrownBy(() -> service.page(admin, AdminReport.Type.REVENUE, to, from, 0, 10))
                .isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.page(admin, AdminReport.Type.REVENUE, from, to, -1, 10))
                .isInstanceOf(ApiException.class);
        assertThatThrownBy(() -> service.page(admin, AdminReport.Type.ALL, from, to, 0, 10))
                .isInstanceOf(ApiException.class);
        verifyNoInteractions(mapper);
    }

    @Test
    void exportsAllTypesAndEveryBatchWithoutLosingMoneyPrecision() throws Exception {
        var order = new AdminReport.Order(from.atStartOfDay(), "ORD-1", 1L, "=Tên khách",
                new BigDecimal("1234567890123.45"), new BigDecimal("10.50"));
        when(mapper.orders(eq(7L), any(), any(), eq(500), eq(0L)))
                .thenReturn(Collections.nCopies(500, order));
        when(mapper.orders(eq(7L), any(), any(), eq(500), eq(500L))).thenReturn(List.of(order));
        when(mapper.revenue(eq(7L), any(), any(), eq(500), eq(0L)))
                .thenReturn(List.of(new AdminReport.Revenue(from, 1, new BigDecimal("10.50"))));
        when(mapper.remade(eq(7L), any(), any(), eq(500), eq(0L))).thenReturn(List.of());
        var output = new ByteArrayOutputStream();
        service.export(admin, AdminReport.Type.ALL, from, to, output);

        try (var workbook = new XSSFWorkbook(new ByteArrayInputStream(output.toByteArray()))) {
            assertThat(workbook.getNumberOfSheets()).isEqualTo(3);
            var orders = workbook.getSheet("Lich su order");
            assertThat(orders.getLastRowNum()).isEqualTo(501);
            assertThat(orders.getRow(1).getCell(3).getStringCellValue()).isEqualTo("=Tên khách");
            assertThat(orders.getRow(1).getCell(4).getStringCellValue())
                    .isEqualTo("1234567890123.45");
            assertThat(orders.getRow(501).getCell(1).getStringCellValue()).isEqualTo("ORD-1");
        }
        verify(mapper).orders(7, from.atStartOfDay(), to.plusDays(1).atStartOfDay(), 500, 500);
    }
}
