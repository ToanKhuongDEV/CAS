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
class AdminCustomerFilterIntegrationTest {
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
    AdminLookupMapper mapper;

    @Test
    @Transactional
    void filtersBySessionOpeningDateAndSortsBeforePagination() {
        jdbc.update(
                "INSERT INTO stores (id, branch_name, address, phone, email, open_time, close_time, status) VALUES (1, 'One', 'A', '0900', 'one@example.com', '08:00', '22:00', 'ACTIVE'), (2, 'Two', 'A', '0901', 'two@example.com', '08:00', '22:00', 'ACTIVE')");
        jdbc.update(
                "INSERT INTO client_accounts (id, store_id, display_name) VALUES (1, 1, 'An'), (2, 1, 'Binh'), (3, 1, 'No session'), (4, 2, 'Other store')");
        jdbc.update(
                "INSERT INTO sales_sessions (id, public_id, store_id, session_type, client_account_id, opened_by_customer_name, status, created_at) VALUES (1, 's1', 1, 'TAKEAWAY', 1, 'An', 'OPEN', '2026-10-01 00:00:00'), (2, 's2', 1, 'TAKEAWAY', 1, 'An', 'OPEN', '2026-10-31 23:59:59'), (3, 's3', 1, 'TAKEAWAY', 2, 'Binh', 'OPEN', '2026-10-15 10:00:00'), (4, 's4', 1, 'TAKEAWAY', 2, 'Binh', 'OPEN', '2026-11-01 00:00:00'), (5, 's5', 2, 'TAKEAWAY', 4, 'Other', 'OPEN', '2026-10-15 10:00:00')");
        jdbc.update(
                "INSERT INTO payments (public_id, sales_session_id, amount, bill_snapshot, status) VALUES ('p1', 1, 100, '{}', 'PAID'), ('p2', 2, 999, '{}', 'PENDING'), ('p3', 3, 200, '{}', 'PAID'), ('p4', 4, 5000, '{}', 'PAID'), ('p5', 5, 8000, '{}', 'PAID')");
        var from = LocalDate.of(2026, 10, 1).atStartOfDay();
        var to = LocalDate.of(2026, 11, 1).atStartOfDay();
        assertThat(mapper.countCustomers(1, null, from, to)).isEqualTo(2);
        var highest = mapper.findCustomers(1, null, from, to, "AMOUNT_DESC", 1, 0);
        assertThat(highest).singleElement().satisfies(row -> {
            assertThat(row.displayName()).isEqualTo("Binh");
            assertThat(row.totalPaid()).isEqualByComparingTo("200");
        });
        var next = mapper.findCustomers(1, null, from, to, "AMOUNT_DESC", 1, 1);
        assertThat(next).singleElement().satisfies(row -> {
            assertThat(row.displayName()).isEqualTo("An");
            assertThat(row.totalPaid()).isEqualByComparingTo("100");
            assertThat(row.sessionCount()).isEqualTo(2);
        });
        assertThat(mapper.findCustomers(1, null, from, to, "AMOUNT_ASC", 10, 0))
                .extracting(row -> row.displayName()).containsExactly("An", "Binh");
        assertThat(mapper.findCustomers(1, null, from, to, "SESSIONS_DESC", 10, 0))
                .extracting(row -> row.displayName()).containsExactly("An", "Binh");
        assertThat(mapper.findCustomers(1, null, from, to, "SESSIONS_ASC", 10, 0))
                .extracting(row -> row.displayName()).containsExactly("Binh", "An");
        assertThat(mapper.countCustomers(1, "An", from, to)).isEqualTo(1);
        assertThat(mapper.countCustomers(1, "%", from, to)).isZero();
        assertThat(mapper.findCustomers(1, "_", from, to, "RECENT", 10, 0)).isEmpty();
        assertThat(mapper.countCustomers(1, null, null, null)).isEqualTo(3);
        jdbc.update("UPDATE client_accounts SET display_name = 'No_%! session' WHERE id = 3");
        assertThat(mapper.countCustomers(1, "_%!", null, null)).isEqualTo(1);
        assertThat(mapper.findCustomers(1, "_%!", null, null, "RECENT", 10, 0))
                .extracting(row -> row.displayName()).containsExactly("No_%! session");
        jdbc.update(
                "INSERT INTO accounts (id, store_id, firebase_uid, email, phone, display_name, role) VALUES (1, 1, 'uid', 'admin@example.com', '0902', 'Admin', 'ADMIN')");
        jdbc.update(
                "INSERT INTO audit_logs (store_id, request_id, action, entity_type, entity_id, change_data, actor_account_id, actor_name, description) VALUES (1, 'r1', 'UPDATE', 'PAYMENT', 1, '{}', 1, 'Admin', 'Normal'), (1, 'r2', 'UPDATE', 'PAYMENT', 2, '{}', 1, 'Admin', 'Issue _%!')");
        assertThat(mapper.countAuditLogs(1, "_%!", null, null)).isEqualTo(1);
        assertThat(mapper.findAuditLogs(1, "_%!", null, null, 10, 0))
                .extracting(row -> row.description()).containsExactly("Issue _%!");
        assertThat(mapper.countAuditLogs(1, "missing%", null, null)).isZero();
    }
}
