package vn.cas.store.mapper;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.time.LocalTime;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@Testcontainers(disabledWithoutDocker = true)
class StoreSettingsMapperIntegrationTest {

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
    private StoreSettingsMapper stores;

    @Autowired
    private JdbcTemplate jdbc;

    @BeforeEach
    void seed() {
        jdbc.update("DELETE FROM brand_settings");
        jdbc.update("DELETE FROM stores");
        insertStore(1, "Cơ sở 1", "ACTIVE");
        insertStore(2, "Cơ sở 2", "INACTIVE");
        jdbc.update(
                """
                        INSERT INTO brand_settings (id, name, logo_url, logo_storage_key, welcome_slogan)
                        VALUES (1, 'CAS', 'https://res.cloudinary.com/cas/logo.png', 'cas/brand/logo', 'Ăn ngon')
                        """);
    }

    @AfterEach
    void clear() {
        jdbc.update("DELETE FROM brand_settings");
        jdbc.update("DELETE FROM stores");
    }

    @Test
    void returnsStoreSpecificDetailsWithSharedBrand() {
        var first = stores.findByStoreId(1);
        var second = stores.findByStoreId(2);

        assertEquals("Cơ sở 1", first.branchName());
        assertEquals("Cơ sở 2", second.branchName());
        assertEquals("CAS", first.brandName());
        assertEquals(first.brandName(), second.brandName());
        assertEquals(first.logoUrl(), second.logoUrl());
    }

    @Test
    void returnsOnlyActiveStoresFromPublicQueries() {
        assertEquals("Cơ sở 1", stores.findActiveByStoreId(1).branchName());
        assertNull(stores.findActiveByStoreId(2));
        assertEquals(1, stores.findAllActive().size());
    }

    @Test
    void updatesOnlyTheSelectedStore() {
        stores.updateStoreSettings(2, "Cơ sở 2 mới", "Địa chỉ 2 mới", "0902", "two@cas.vn",
                "10.2,106.2", LocalTime.of(9, 0), LocalTime.of(23, 0), "ACTIVE");

        assertEquals("Cơ sở 1", stores.findByStoreId(1).branchName());
        var second = stores.findByStoreId(2);
        assertEquals("Cơ sở 2 mới", second.branchName());
        assertEquals("CAS", second.brandName());
        assertEquals("ACTIVE", second.status());
    }

    private void insertStore(long id, String branchName, String status) {
        jdbc.update(
                """
                        INSERT INTO stores (id, branch_name, address, phone, email, open_time, close_time, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """,
                id, branchName, "Địa chỉ " + id, "090" + id, "store" + id + "@cas.vn",
                LocalTime.of(8, 0), LocalTime.of(22, 0), status);
    }
}
