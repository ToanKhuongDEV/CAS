package vn.cas.operation.service;

import java.io.IOException;
import java.io.OutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.operation.mapper.AdminReportMapper;
import vn.cas.operation.model.AdminReport;
import vn.cas.operation.model.AdminReport.Type;

@Service
public class AdminReportService {
    private static final int EXPORT_BATCH = 500;
    private static final int MAX_ROWS = 1_048_576;
    private static final DateTimeFormatter DATE_TIME = DateTimeFormatter
            .ofPattern("dd/MM/yyyy HH:mm");
    private final AdminReportMapper mapper;

    public AdminReportService(AdminReportMapper mapper) {
        this.mapper = mapper;
    }

    public void validate(Type type, LocalDate from, LocalDate to, boolean allowAll) {
        if (type == null || (!allowAll && type == Type.ALL) || from == null || to == null
                || from.isAfter(to) || to.equals(LocalDate.MAX))
            throw new ApiException(HttpStatus.BAD_REQUEST, "Bộ lọc báo cáo không hợp lệ.");
    }

    @Transactional(readOnly = true)
    public AdminReport.Page page(OperationalPrincipal principal, Type type, LocalDate from,
            LocalDate to, int page, int size) {
        validate(type, from, to, false);
        if (page < 0 || size < 1 || size > 100)
            throw new ApiException(HttpStatus.BAD_REQUEST, "Phân trang không hợp lệ.");
        var start = from.atStartOfDay();
        var end = to.plusDays(1).atStartOfDay();
        long storeId = principal.storeId();
        return new AdminReport.Page(fetch(storeId, type, start, end, size, (long) page * size),
                count(storeId, type, start, end), page, size);
    }

    @Transactional(readOnly = true)
    public void export(OperationalPrincipal principal, Type type, LocalDate from, LocalDate to,
            OutputStream output) throws IOException {
        validate(type, from, to, true);
        try (var workbook = new SXSSFWorkbook(100)) {
            workbook.setCompressTempFiles(true);
            var types = type == Type.ALL
                    ? List.of(Type.REVENUE, Type.ORDERS, Type.REMADE)
                    : List.of(type);
            for (var reportType : types) {
                writeReport(workbook, principal.storeId(), reportType, from.atStartOfDay(),
                        to.plusDays(1).atStartOfDay());
            }
            workbook.write(output);
        }
    }

    private List<?> fetch(long storeId, Type type, LocalDateTime from, LocalDateTime to, int limit,
            long offset) {
        return switch (type) {
            case REVENUE -> mapper.revenue(storeId, from, to, limit, offset);
            case ORDERS -> mapper.orders(storeId, from, to, limit, offset);
            case REMADE -> mapper.remade(storeId, from, to, limit, offset);
            case ALL -> throw new IllegalArgumentException("ALL is not a single report");
        };
    }

    private long count(long storeId, Type type, LocalDateTime from, LocalDateTime to) {
        return switch (type) {
            case REVENUE -> mapper.countRevenue(storeId, from, to);
            case ORDERS -> mapper.countOrders(storeId, from, to);
            case REMADE -> mapper.countRemade(storeId, from, to);
            case ALL -> throw new IllegalArgumentException("ALL is not a single report");
        };
    }

    private void writeReport(SXSSFWorkbook workbook, long storeId, Type type, LocalDateTime from,
            LocalDateTime to) {
        int part = 1;
        Sheet sheet = createSheet(workbook, type, part);
        int rowIndex = 1;
        long offset = 0;
        while (true) {
            List<?> items = fetch(storeId, type, from, to, EXPORT_BATCH, offset);
            for (var item : items) {
                if (rowIndex == MAX_ROWS) {
                    sheet = createSheet(workbook, type, ++part);
                    rowIndex = 1;
                }
                writeRow(sheet.createRow(rowIndex++), item);
            }
            offset += items.size();
            if (items.size() < EXPORT_BATCH)
                break;
        }
    }

    private Sheet createSheet(SXSSFWorkbook workbook, Type type, int part) {
        String name = switch (type) {
            case REVENUE -> "Doanh thu";
            case ORDERS -> "Lich su order";
            case REMADE -> "Mon lam lai";
            case ALL -> throw new IllegalArgumentException();
        };
        Sheet sheet = workbook.createSheet(part == 1 ? name : name + " " + part);
        String[] headings = switch (type) {
            case REVENUE ->
                new String[]{"Ngày thanh toán", "Số phiên đã thanh toán", "Tổng doanh thu"};
            case ORDERS -> new String[]{"Thời điểm tạo", "Mã order", "Bàn / Mang về",
                    "Khách mở phiên", "Tổng tiền gốc", "Số tiền order sau hủy"};
            case REMADE -> new String[]{"Thời điểm xử lý", "Mã order", "Bàn / Mang về", "Tên món",
                    "Số lượng làm lại", "Lý do", "Người xử lý"};
            case ALL -> throw new IllegalArgumentException();
        };
        Row row = sheet.createRow(0);
        for (int i = 0; i < headings.length; i++) {
            row.createCell(i).setCellValue(headings[i]);
            sheet.setColumnWidth(i, Math.min(255 * 256, 24 * 256));
        }
        return sheet;
    }

    private void writeRow(Row row, Object item) {
        if (item instanceof AdminReport.Revenue value) {
            row.createCell(0)
                    .setCellValue(value.date().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
            row.createCell(1).setCellValue(value.paidSessionCount());
            row.createCell(2).setCellValue(value.revenue().toPlainString());
        } else if (item instanceof AdminReport.Order value) {
            row.createCell(0).setCellValue(value.createdAt().format(DATE_TIME));
            row.createCell(1).setCellValue(value.orderNumber());
            row.createCell(2).setCellValue(destination(value.tableCode()));
            row.createCell(3).setCellValue(value.customerName());
            row.createCell(4).setCellValue(value.originalAmount().toPlainString());
            row.createCell(5).setCellValue(value.payableAmount().toPlainString());
        } else if (item instanceof AdminReport.Remade value) {
            row.createCell(0).setCellValue(value.resolvedAt().format(DATE_TIME));
            row.createCell(1).setCellValue(value.orderNumber());
            row.createCell(2).setCellValue(destination(value.tableCode()));
            row.createCell(3).setCellValue(value.itemName());
            row.createCell(4).setCellValue(value.quantity());
            row.createCell(5).setCellValue(value.reason() == null ? "" : value.reason());
            row.createCell(6)
                    .setCellValue(value.resolvedByName() == null ? "" : value.resolvedByName());
        }
    }

    private String destination(Long tableCode) {
        return tableCode == null ? "Mang về" : "Bàn " + tableCode;
    }
}
