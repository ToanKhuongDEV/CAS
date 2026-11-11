package vn.cas.operation.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Testcontainers(disabledWithoutDocker = true)
class AdminReportMapperIntegrationTest {
    @Container
    static final MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.4");
    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        registry.add("spring.data.redis.host", () -> "localhost");
    }
    @Autowired
    JdbcTemplate jdbc;
    @Autowired
    AdminReportMapper reports;

    @Test
    @Transactional
    void scopesAllThreeReportsByStoreAndInclusiveDateRange() {
        for (long id = 1; id <= 3; id++) {
            long store = id == 3 ? 2 : 1;
            if (id != 2) {
                jdbc.update(
                        "INSERT INTO stores (id, branch_name, address, phone, email, open_time, close_time, status) VALUES (?, ?, 'A', '0900', 'store@example.com', '08:00', '22:00', 'ACTIVE')",
                        store, "Cơ sở " + store);
                jdbc.update(
                        "INSERT INTO categories (id, store_id, name, category_type, status) VALUES (?, ?, 'Món', 'REGULAR', 'ACTIVE')",
                        store, store);
                jdbc.update(
                        "INSERT INTO menu_items (id, category_id, store_id, name, price, availability_status) VALUES (?, ?, ?, 'Mì', 10000, 'ACTIVE')",
                        store, store, store);
            }
            jdbc.update("INSERT INTO client_accounts (id, store_id, display_name) VALUES (?, ?, ?)",
                    id, store, "Khách " + id);
            jdbc.update(
                    "INSERT INTO sales_sessions (id, public_id, store_id, session_type, table_id, client_account_id, opened_by_customer_name, status) VALUES (?, ?, ?, 'TAKEAWAY', NULL, ?, ?, 'OPEN')",
                    id, "session-" + id, store, id, "Khách " + id);
            jdbc.update(
                    "INSERT INTO orders (id, public_id, sales_session_id, idempotency_key, request_fingerprint, order_number, original_amount, payable_amount, created_at) VALUES (?, ?, ?, ?, ?, ?, 20000, 15000, '2026-10-31 23:59:59')",
                    id, "order-" + id, id, "order-key-" + id, "fingerprint-" + id, "ORD-" + id);
            jdbc.update(
                    "INSERT INTO order_items (id, public_id, order_id, menu_item_id, item_name, unit_price, quantity, total_amount) VALUES (?, ?, ?, ?, 'Mì', 10000, 2, 20000)",
                    id, "item-" + id, id, store);
            jdbc.update(
                    "INSERT INTO order_item_cancellation_requests (public_id, order_item_id, idempotency_key, requested_quantity, status, is_remade, resolved_at, resolved_by_name) VALUES (?, ?, ?, 1, 'APPROVED', ?, '2026-10-31 23:59:59', 'Nhân viên')",
                    "request-" + id, id, "cancel-key-" + id, id != 2);
            jdbc.update(
                    "INSERT INTO payments (public_id, sales_session_id, amount, bill_snapshot, status, confirmed_at) VALUES (?, ?, 15000, '{}', ?, '2026-10-31 23:59:59')",
                    "payment-" + id, id, id == 2 ? "PENDING" : "PAID");
        }
        var from = LocalDate.of(2026, 10, 1).atStartOfDay();
        var to = LocalDate.of(2026, 11, 1).atStartOfDay();
        assertThat(reports.countRevenue(1, from, to)).isEqualTo(1);
        assertThat(reports.revenue(1, from, to, 10, 0)).singleElement().satisfies(row -> {
            assertThat(row.paidSessionCount()).isEqualTo(1);
            assertThat(row.revenue()).isEqualByComparingTo("15000");
        });
        assertThat(reports.countOrders(1, from, to)).isEqualTo(2);
        assertThat(reports.orders(1, from, to, 1, 1)).singleElement()
                .satisfies(row -> assertThat(row.orderNumber()).isEqualTo("ORD-1"));
        assertThat(reports.countRemade(1, from, to)).isEqualTo(1);
        assertThat(reports.remade(1, from, to, 10, 0)).singleElement()
                .satisfies(row -> assertThat(row.orderNumber()).isEqualTo("ORD-1"));
        assertThat(reports.countOrders(2, from, to)).isEqualTo(1);
    }
}
