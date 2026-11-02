package vn.cas.promotion.mapper;

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
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.common.exception.ApiException;
import vn.cas.payment.service.PaymentService;
import vn.cas.promotion.model.Promotion;
import vn.cas.promotion.service.PromotionService;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Testcontainers(disabledWithoutDocker = true)
class PromotionUpdateIntegrationTest {
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
    PromotionService promotions;
    @Autowired
    PaymentService payments;

    @Test
    void commitsClearedSelectionWhenPaymentRejectsAnUnavailablePromotion() {
        jdbc.update(
                "INSERT INTO stores (id, branch_name, address, phone, email, open_time, close_time, status) VALUES (3, 'Store 3', 'Address', '0903', 'store3@example.com', '08:00', '22:00', 'ACTIVE')");
        jdbc.update(
                "INSERT INTO client_accounts (id, store_id, display_name) VALUES (3, 3, 'Customer 3'), (4, 3, 'Customer 4')");
        jdbc.update(
                "INSERT INTO promotions (id, public_id, store_id, name, promotion_type, discount_value, status) VALUES (3, 'promotion-3', 3, 'Promotion', 'PERCENT_OFF', 10, 'ACTIVE')");
        jdbc.update(
                "INSERT INTO promotion_codes (store_id, promotion_id, code) VALUES (3, 3, 'SAVE3')");
        jdbc.update(
                "INSERT INTO sales_sessions (id, public_id, store_id, session_type, client_account_id, opened_by_customer_name, selected_promotion_id, status) VALUES (3, 'session-3', 3, 'TAKEAWAY', 3, 'Customer 3', 3, 'OPEN'), (4, 'session-4', 3, 'TAKEAWAY', 4, 'Customer 4', 3, 'OPEN')");

        assertThatThrownBy(() -> payments.create("session-3")).isInstanceOf(ApiException.class)
                .hasMessageContaining("Khuyến mãi đã không còn khả dụng");
        assertThat(jdbc.queryForObject(
                "SELECT selected_promotion_id FROM sales_sessions WHERE id = 3", Long.class))
                .isNull();
        var principal = new OperationalPrincipal(1, 3, "operator", "Operator", "OPERATOR");
        assertThatThrownBy(
                () -> payments.createForOperator(principal, "session-4", UUID.randomUUID()))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Khuyến mãi đã không còn khả dụng");
        assertThat(jdbc.queryForObject(
                "SELECT selected_promotion_id FROM sales_sessions WHERE id = 4", Long.class))
                .isNull();
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM payments WHERE sales_session_id IN (3, 4)", Integer.class))
                .isZero();
    }

    @Test
    @Transactional
    void updatesReferencedCodeWithoutLosingItsReservation() {
        jdbc.update(
                "INSERT INTO stores (id, branch_name, address, phone, email, open_time, close_time, status) VALUES (1, 'Store', 'Address', '0901', 'store@example.com', '08:00', '22:00', 'ACTIVE')");
        jdbc.update(
                "INSERT INTO accounts (id, store_id, firebase_uid, email, phone, display_name, role, status) VALUES (1, 1, 'admin', 'admin@example.com', '0902', 'Admin', 'ADMIN', 'ACTIVE')");
        jdbc.update(
                "INSERT INTO client_accounts (id, store_id, display_name) VALUES (1, 1, 'Customer')");
        jdbc.update(
                "INSERT INTO promotions (id, public_id, store_id, name, promotion_type, discount_value, max_redemptions, status) VALUES (1, 'promotion-1', 1, 'Promotion', 'PERCENT_OFF', 10, 5, 'ACTIVE')");
        jdbc.update(
                "INSERT INTO promotion_codes (id, store_id, promotion_id, code, max_redemptions) VALUES (7, 1, 1, 'SAVE', 5)");
        jdbc.update(
                "INSERT INTO promotion_codes (id, store_id, promotion_id, code, max_redemptions) VALUES (8, 1, 1, 'UNUSED', 5)");
        jdbc.update(
                "INSERT INTO sales_sessions (id, public_id, store_id, session_type, client_account_id, opened_by_customer_name, selected_promotion_id, selected_promotion_code_id, status) VALUES (1, 'session-1', 1, 'TAKEAWAY', 1, 'Customer', 1, 7, 'PAYMENT_PENDING')");
        jdbc.update(
                "INSERT INTO payments (id, public_id, sales_session_id, amount, bill_snapshot, status) VALUES (1, 'payment-1', 1, 100, '{}', 'PENDING')");
        jdbc.update(
                "INSERT INTO promotion_redemptions (store_id, promotion_id, promotion_code_id, client_account_id, sales_session_id, payment_id, status) VALUES (1, 1, 7, 1, 1, 1, 'RESERVED')");
        var principal = new OperationalPrincipal(1, 1, "admin", "Admin", "ADMIN");
        var updated = new Promotion(0, null, "Promotion", "PERCENT_OFF", BigDecimal.TEN, null, null,
                1, null, "ACTIVE", null, null);

        promotions.update(principal, "promotion-1", updated,
                List.of(new PromotionService.Code("SAVE", 1)), List.of(), UUID.randomUUID());

        assertThat(jdbc.queryForObject("SELECT id FROM promotion_codes WHERE code = 'SAVE'",
                Long.class)).isEqualTo(7L);
        assertThat(jdbc.queryForObject(
                "SELECT promotion_code_id FROM promotion_redemptions WHERE payment_id = 1",
                Long.class)).isEqualTo(7L);
        assertThat(jdbc.queryForObject("SELECT max_redemptions FROM promotion_codes WHERE id = 7",
                Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT deleted_at FROM promotion_codes WHERE id = 8",
                java.sql.Timestamp.class)).isNotNull();
        promotions.update(principal, "promotion-1", updated, List.of(), List.of(),
                UUID.randomUUID());
        assertThat(jdbc.queryForObject("SELECT deleted_at FROM promotion_codes WHERE id = 7",
                java.sql.Timestamp.class)).isNotNull();
        assertThat(jdbc.queryForObject(
                "SELECT promotion_code_id FROM promotion_redemptions WHERE payment_id = 1",
                Long.class)).isEqualTo(7L);
    }
}
