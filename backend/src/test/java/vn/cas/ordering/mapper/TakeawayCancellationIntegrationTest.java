package vn.cas.ordering.mapper;

import static org.assertj.core.api.Assertions.assertThat;

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
import vn.cas.ordering.service.CancellationService;
import vn.cas.ordering.service.PreparationService;
import vn.cas.notification.service.SystemNotificationService;
import vn.cas.operation.mapper.OperatorDashboardMapper;
import vn.cas.payment.mapper.PaymentMapper;
import java.time.LocalDate;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Testcontainers(disabledWithoutDocker = true)
class TakeawayCancellationIntegrationTest {
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
    OrderingMapper mapper;
    @Autowired
    CancellationService cancellations;
    @Autowired
    OperatorDashboardMapper dashboard;
    @Autowired
    PreparationService preparation;
    @Autowired
    SystemNotificationService notifications;
    @Autowired
    PaymentMapper payments;

    @Test
    @Transactional
    void returnsOnlyThePaidPaymentOfTheClosedSession() {
        insertStore(1);
        insertOrder(1, 1);
        insertOrder(2, 1);
        jdbc.update("UPDATE sales_sessions SET status = 'CLOSED' WHERE id IN (1, 2)");
        jdbc.update(
                "INSERT INTO payments (public_id, sales_session_id, amount, bill_snapshot, status) VALUES ('payment-1', 1, 20000, '{}', 'PAID'), ('payment-2', 2, 20000, '{}', 'PENDING')");

        assertThat(payments.findCustomerPayment("session-1").status()).isEqualTo("PAID");
        assertThat(payments.findCustomerPayment("session-2")).isNull();
        assertThat(payments.findCustomerPayment("other-session")).isNull();
    }

    @Test
    @Transactional
    void resolvesTakeawayRequestsOnlyWithinTheirStoreAndNotifiesTheirSessions() {
        insertStore(1);
        insertStore(2);
        jdbc.update(
                "INSERT INTO accounts (id, store_id, firebase_uid, email, phone, display_name, role, status) VALUES (1, 1, 'operator', 'operator@example.com', '0900', 'Operator', 'OPERATOR', 'ACTIVE')");
        insertOrder(1, 1);
        insertOrder(2, 1);
        insertOrder(3, 2);
        var principal = new OperationalPrincipal(1, 1, "operator", "Operator", "OPERATOR");

        var summary = dashboard.findSummary(1, LocalDate.now().atStartOfDay(),
                LocalDate.now().plusDays(1).atStartOfDay());
        assertThat(summary.ordersToday()).isEqualTo(2);
        assertThat(summary.activeTableCount()).isZero();

        assertThat(mapper.findPendingCancellationRequests(1)).hasSize(2)
                .allSatisfy(item -> assertThat(item.tableCode()).isNull());
        assertThat(mapper.countPendingCancellationRequests(1)).isEqualTo(2);
        assertThat(mapper.findOperatorCancellationRequest(1, "request-3")).isNull();
        assertThat(mapper.findPreparationItems(1)).hasSize(2)
                .allSatisfy(item -> assertThat(item.tableCode()).isNull());
        assertThat(mapper.findSessionByOrderPublicIdAndStoreId(1, "order-1").sessionId())
                .isEqualTo(1);

        cancellations.resolve(principal, "request-1", "REJECT", false, null, 0, "Đã chế biến",
                UUID.randomUUID());
        cancellations.resolve(principal, "request-2", "APPROVE", false, null, 0, null,
                UUID.randomUUID());

        assertThat(mapper.findOrderItemsBySessionId(1).getFirst().latestCancellationStatus())
                .isEqualTo("REJECTED");
        assertThat(mapper.findOrderItemsBySessionId(2).getFirst().latestCancellationStatus())
                .isEqualTo("APPROVED");
        assertThat(mapper.countPendingCancellationRequests(1)).isZero();
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM system_notification_recipients WHERE sales_session_id IN (1, 2)",
                Integer.class)).isEqualTo(2);
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM system_notification_recipients WHERE sales_session_id = 3",
                Integer.class)).isZero();

        var completion = preparation.completeSession(principal, "session-2", "completion-key",
                UUID.randomUUID());
        assertThat(completion.completedQuantity()).isEqualTo(1);
        assertThat(preparation
                .completeSession(principal, "session-2", "completion-key", UUID.randomUUID())
                .completedQuantity()).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT prepared_quantity FROM order_items WHERE id = 1",
                Integer.class)).isZero();

        var notification = notifications.create(principal, "Thông báo", "Nội dung", "INFO",
                "CUSTOMER", UUID.randomUUID());
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM system_notification_recipients WHERE notification_id = ? AND sales_session_id IN (1, 2)",
                Integer.class, notification.id())).isEqualTo(2);
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM system_notification_recipients WHERE notification_id = ? AND sales_session_id = 3",
                Integer.class, notification.id())).isZero();
    }

    private void insertStore(long storeId) {
        jdbc.update(
                "INSERT INTO stores (id, branch_name, address, phone, email, open_time, close_time, status) VALUES (?, ?, 'A', '0900', 'store@example.com', '08:00', '22:00', 'ACTIVE')",
                storeId, "Cơ sở " + storeId);
        jdbc.update(
                "INSERT INTO categories (id, store_id, name, category_type, status) VALUES (?, ?, 'Món', 'REGULAR', 'ACTIVE')",
                storeId, storeId);
        jdbc.update(
                "INSERT INTO menu_items (id, category_id, store_id, name, price, availability_status) VALUES (?, ?, ?, 'Mì', 10000, 'ACTIVE')",
                storeId, storeId, storeId);
    }

    private void insertOrder(long id, long storeId) {
        jdbc.update("INSERT INTO client_accounts (id, store_id, display_name) VALUES (?, ?, ?)", id,
                storeId, "Khách " + id);
        jdbc.update(
                "INSERT INTO sales_sessions (id, public_id, store_id, session_type, table_id, client_account_id, opened_by_customer_name, status) VALUES (?, ?, ?, 'TAKEAWAY', NULL, ?, ?, 'OPEN')",
                id, "session-" + id, storeId, id, "Khách " + id);
        jdbc.update(
                "INSERT INTO orders (id, public_id, sales_session_id, idempotency_key, request_fingerprint, order_number, original_amount, payable_amount) VALUES (?, ?, ?, ?, ?, ?, 20000, 20000)",
                id, "order-" + id, id, "order-key-" + id, "fingerprint-" + id, "ORD-" + id);
        jdbc.update(
                "INSERT INTO order_items (id, public_id, order_id, menu_item_id, item_name, unit_price, quantity, total_amount) VALUES (?, ?, ?, ?, 'Mì', 10000, 2, 20000)",
                id, "item-" + id, id, storeId);
        jdbc.update(
                "INSERT INTO order_item_cancellation_requests (id, public_id, order_item_id, idempotency_key, requested_quantity, status) VALUES (?, ?, ?, ?, 1, 'PENDING')",
                id, "request-" + id, id, "cancel-key-" + id);
    }
}
