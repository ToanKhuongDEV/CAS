package vn.cas.notification.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Testcontainers(disabledWithoutDocker = true)
class SystemNotificationMapperIntegrationTest {
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
    SystemNotificationMapper mapper;

    @Test
    @Transactional
    void addsDestinationOnlyToAdminCancellationNotifications() {
        jdbc.update(
                "INSERT INTO stores (id, branch_name, address, phone, email, open_time, close_time, status) VALUES (1, 'Store', 'A', '0900', 'store@example.com', '08:00', '22:00', 'ACTIVE')");
        jdbc.update(
                "INSERT INTO client_accounts (id, store_id, display_name) VALUES (1, 1, 'Guest')");
        jdbc.update("INSERT INTO dining_tables (id, store_id, code) VALUES (1, 1, 5)");
        jdbc.update(
                "INSERT INTO sales_sessions (id, public_id, store_id, session_type, table_id, client_account_id, opened_by_customer_name, status) VALUES (1, 'session-1', 1, 'DINE_IN', 1, 1, 'Guest', 'OPEN'), (2, 'session-2', 1, 'TAKEAWAY', NULL, 1, 'Guest', 'OPEN')");
        jdbc.update(
                "INSERT INTO system_notifications (id, store_id, title, content, type, target_role) VALUES (1, 1, 'Yêu cầu hủy món đã được đồng ý', 'Đã đồng ý', 'INFO', 'CUSTOMER'), (2, 1, 'Yêu cầu hủy món bị từ chối', 'Đã từ chối', 'INFO', 'CUSTOMER'), (3, 1, 'Thông báo khác', 'Nội dung', 'INFO', 'CUSTOMER'), (4, 1, 'Yêu cầu hủy món đã được đồng ý', 'Nhiều người nhận', 'INFO', 'CUSTOMER')");
        jdbc.update(
                "INSERT INTO system_notification_recipients (notification_id, sales_session_id) VALUES (1, 1), (2, 2), (3, 1), (4, 1), (4, 2)");

        jdbc.update(
                "UPDATE system_notifications SET admin_content = 'Đã đồng ý (Bàn 5)' WHERE id = 1");
        jdbc.update(
                "UPDATE system_notifications SET admin_content = 'Đã từ chối (Mang về)' WHERE id = 2");
        new ResourceDatabasePopulator(new ClassPathResource(
                "db/migration/V3__add_customer_name_to_admin_notifications.sql"))
                .execute(jdbc.getDataSource());
        var notifications = mapper.findByStoreId(1);
        assertThat(notifications).anySatisfy(
                n -> assertThat(n.adminContent()).isEqualTo("Đã đồng ý (Bàn 5, Khách: Guest)"));
        assertThat(notifications).anySatisfy(
                n -> assertThat(n.adminContent()).isEqualTo("Đã từ chối (Mang về, Khách: Guest)"));
        assertThat(notifications).anySatisfy(n -> assertThat(n.content()).isEqualTo("Nội dung"));
        assertThat(notifications)
                .anySatisfy(n -> assertThat(n.content()).isEqualTo("Nhiều người nhận"));
        assertThat(mapper.findBySalesSessionId(1))
                .anySatisfy(n -> assertThat(n.content()).isEqualTo("Đã đồng ý"));
    }
}
