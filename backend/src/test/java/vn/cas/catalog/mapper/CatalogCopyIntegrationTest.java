package vn.cas.catalog.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.UUID;
import java.time.LocalTime;
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
import vn.cas.catalog.service.CatalogCopyService;
import vn.cas.common.exception.ApiException;
import vn.cas.common.security.OperationalPrincipal;
import vn.cas.store.service.StoreSettingsService;
import vn.cas.store.model.StoreSettings;

@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
class CatalogCopyIntegrationTest {
    @Container
    static final MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.4");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
    }

    @Autowired
    JdbcTemplate jdbc;
    @Autowired
    CatalogCopyService service;
    @Autowired
    CatalogMapper mapper;
    @Autowired
    StoreSettingsService stores;

    @Test
    void createsStoreAndCopiesAtomically() {
        jdbc.update(
                "INSERT INTO stores (id, branch_name, address, phone, email, open_time, close_time) VALUES (10, 'Source', 'Address', '01', 's10@example.com', '08:00', '22:00')");
        jdbc.update(
                "INSERT INTO accounts (id, store_id, firebase_uid, email, phone, display_name, role) VALUES (10, 10, 'uid-10', 'a10@example.com', '0310', 'Admin', 'SUPER_ADMIN')");
        jdbc.update(
                "INSERT INTO categories (store_id, name, category_type) VALUES (10, 'Food', 'REGULAR')");
        var principal = new OperationalPrincipal(10, 10, "uid-10", "Admin", "SUPER_ADMIN");
        var settings = new StoreSettings(0, "New", "Address", "0900", "new@example.com", null, null,
                null, null, null, LocalTime.of(8, 0), LocalTime.of(22, 0), null, "ACTIVE", null);
        var created = stores.create(principal, settings, 10L, UUID.randomUUID());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM categories WHERE store_id = ?",
                Integer.class, created.id())).isEqualTo(1);
        int before = jdbc.queryForObject("SELECT COUNT(*) FROM stores", Integer.class);
        assertThatThrownBy(() -> stores.create(principal, settings, 99999L, UUID.randomUUID()))
                .isInstanceOf(ApiException.class);
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM stores", Integer.class))
                .isEqualTo(before);
    }

    @Test
    @Transactional
    void copiesDistinctItemsWithTheirLinksAndProtectsSharedImages() {
        jdbc.update(
                "INSERT INTO stores (id, branch_name, address, phone, email, open_time, close_time) VALUES (1, 'Source', 'Address', '01', 's@example.com', '08:00', '22:00'), (2, 'Target', 'Address', '02', 't@example.com', '08:00', '22:00')");
        jdbc.update(
                "INSERT INTO accounts (id, store_id, firebase_uid, email, phone, display_name, role) VALUES (1, 1, 'uid', 'a@example.com', '03', 'Admin', 'SUPER_ADMIN')");
        jdbc.update(
                "INSERT INTO categories (id, store_id, name, category_type) VALUES (1, 1, 'Food', 'REGULAR')");
        jdbc.update("INSERT INTO tags (id, store_id, name) VALUES (1, 1, 'Hot')");
        jdbc.update(
                "INSERT INTO option_groups (id, store_id, name, selection_type) VALUES (1, 1, 'Spice', 'SINGLE')");
        jdbc.update(
                "INSERT INTO option_values (id, option_group_id, name, extra_price) VALUES (1, 1, 'Mild', 5)");
        jdbc.update(
                "INSERT INTO menu_items (id, category_id, store_id, name, price, image_url, image_storage_key, availability_status) VALUES (1, 1, 1, 'Same', 10, 'https://example.com/item.jpg', 'cas/menu/1/1_item', 'ACTIVE'), (2, 1, 1, 'Same', 20, NULL, NULL, 'SOLD_OUT')");
        jdbc.update("INSERT INTO menu_item_tags (menu_item_id, tag_id, store_id) VALUES (1, 1, 1)");
        jdbc.update(
                "INSERT INTO menu_item_option_groups (menu_item_id, option_group_id, store_id, display_order) VALUES (2, 1, 1, 7)");

        var admin = new OperationalPrincipal(1, 1, "uid", "Admin", "SUPER_ADMIN");
        service.copy(admin, 1, 2, UUID.randomUUID());
        assertThat(jdbc.queryForObject("SELECT COUNT(*) FROM menu_items WHERE store_id = 2",
                Integer.class)).isEqualTo(2);
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM menu_item_tags l JOIN menu_items i ON i.id = l.menu_item_id WHERE l.store_id = 2 AND i.price = 10",
                Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM menu_item_option_groups l JOIN menu_items i ON i.id = l.menu_item_id WHERE l.store_id = 2 AND i.price = 20 AND l.display_order = 7",
                Integer.class)).isEqualTo(1);
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM option_values v JOIN option_groups g ON g.id = v.option_group_id WHERE g.store_id = 2 AND v.extra_price = 5",
                Integer.class)).isEqualTo(1);
        jdbc.update(
                "UPDATE menu_items SET image_url = NULL, image_storage_key = NULL WHERE id = 1");
        assertThat(mapper.isAssetInUse("cas/menu/1/1_item")).isTrue();
        assertThatThrownBy(() -> service.copy(admin, 1, 2, UUID.randomUUID()))
                .isInstanceOf(ApiException.class);
    }
}
