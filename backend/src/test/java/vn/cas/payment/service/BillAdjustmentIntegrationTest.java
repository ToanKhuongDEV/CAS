package vn.cas.payment.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
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
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Testcontainers(disabledWithoutDocker = true)
class BillAdjustmentIntegrationTest {
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
    PaymentService payments;

    @Test
    @Transactional
    void pendingPaymentUsesAdjustmentAndRejectsStaleConfirmation() {
        jdbc.update(
                "INSERT INTO stores (id, branch_name, address, phone, email, open_time, close_time, status) VALUES (1, 'Store', 'Address', '0901', 'store@example.com', '08:00', '22:00', 'ACTIVE')");
        jdbc.update(
                "INSERT INTO accounts (id, store_id, firebase_uid, email, phone, display_name, role, status) VALUES (1, 1, 'operator', 'operator@example.com', '0902', 'Operator', 'OPERATOR', 'ACTIVE')");
        jdbc.update(
                "INSERT INTO client_accounts (id, store_id, display_name) VALUES (1, 1, 'Customer')");
        jdbc.update(
                "INSERT INTO sales_sessions (id, public_id, store_id, session_type, client_account_id, opened_by_customer_name, opened_by_customer_phone, status) VALUES (1, 'session-1', 1, 'TAKEAWAY', 1, 'Customer', '0123456787', 'PAYMENT_PENDING')");
        String snapshot = "{\"bill\":{\"payableAmount\":90000},\"discount\":null}";
        jdbc.update(
                "INSERT INTO payments (id, public_id, sales_session_id, amount, bill_snapshot, status) VALUES (1, 'payment-1', 1, 90000, ?, 'PENDING')",
                snapshot);
        var operator = new OperationalPrincipal(1, 1, "operator", "Operator", "OPERATOR");
        var item = new PaymentService.AdjustmentChange(UUID.randomUUID(), "INCREASE",
                new BigDecimal("40000"), "Vỡ đồ");
        var pending = payments.pending(operator).getFirst();
        assertThat(pending.customerName()).isEqualTo("Customer");
        assertThat(pending.maskedCustomerPhone()).isEqualTo("012***787");
        String currentSnapshot = pending.billSnapshot();
        assertThatThrownBy(() -> payments.confirm(operator, "payment-1", "outdated", List.of(item),
                List.of(), List.of())).isInstanceOf(ApiException.class)
                .hasMessageContaining("đã thay đổi");
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM bill_adjustments WHERE sales_session_id = 1", Integer.class))
                .isZero();
        payments.confirm(operator, "payment-1", currentSnapshot, List.of(item), List.of(),
                List.of());
        assertThat(
                jdbc.queryForObject("SELECT amount FROM payments WHERE id = 1", BigDecimal.class))
                .isEqualByComparingTo("130000");
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM bill_adjustments WHERE sales_session_id = 1", Integer.class))
                .isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT status FROM payments WHERE id = 1", String.class))
                .isEqualTo("PAID");
    }

    @Test
    void rollsBackAllDraftsWhenConfirmationFails() {
        jdbc.update(
                "INSERT INTO stores (id, branch_name, address, phone, email, open_time, close_time, status) VALUES (2, 'Store 2', 'Address', '0903', 'store2@example.com', '08:00', '22:00', 'ACTIVE')");
        jdbc.update(
                "INSERT INTO accounts (id, store_id, firebase_uid, email, phone, display_name, role, status) VALUES (2, 2, 'operator2', 'operator2@example.com', '0904', 'Operator', 'OPERATOR', 'ACTIVE')");
        jdbc.update(
                "INSERT INTO client_accounts (id, store_id, display_name) VALUES (2, 2, 'Customer')");
        jdbc.update(
                "INSERT INTO sales_sessions (id, public_id, store_id, session_type, client_account_id, opened_by_customer_name, status) VALUES (2, 'session-2', 2, 'TAKEAWAY', 2, 'Customer', 'PAYMENT_PENDING')");
        jdbc.update(
                "INSERT INTO payments (id, public_id, sales_session_id, amount, bill_snapshot, status) VALUES (2, 'payment-2', 2, 90000, '{\"bill\":{\"payableAmount\":90000},\"discount\":null}', 'PENDING')");
        var operator = new OperationalPrincipal(2, 2, "operator2", "Operator", "OPERATOR");
        var snapshot = payments.pending(operator).getFirst().billSnapshot();
        var increase = new PaymentService.AdjustmentChange(UUID.randomUUID(), "INCREASE",
                new BigDecimal("40000"), "Vỡ đồ");
        var duplicate = new PaymentService.AdjustmentChange(increase.id(), "DECREASE",
                new BigDecimal("999999"), "Giảm quá mức");

        assertThatThrownBy(() -> payments.confirm(operator, "payment-2", snapshot,
                List.of(increase, duplicate), List.of(), List.of()))
                .isInstanceOf(ApiException.class);
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM bill_adjustments WHERE sales_session_id = 2", Integer.class))
                .isZero();
        assertThat(
                jdbc.queryForObject("SELECT amount FROM payments WHERE id = 2", BigDecimal.class))
                .isEqualByComparingTo("90000");
        assertThat(jdbc.queryForObject("SELECT status FROM payments WHERE id = 2", String.class))
                .isEqualTo("PENDING");
    }
}
