-- CAS demo data. Run this manually only after Flyway V1 has created an empty schema.
-- This file is intentionally outside db/migration, so Flyway never executes it automatically.
-- Demo customer QR URL: http://localhost:3000/table/<token below>
-- image_url uses the existing assets in frontend/public; image_storage_key stays NULL because
-- these assets are not uploaded to the production image service.

START TRANSACTION;

INSERT INTO stores (
    name, address, phone, email, google_maps_location, open_time, close_time,
    welcome_slogan, long_wait_warning_minutes, timezone, status
) VALUES (
    'CAS Mì Cay', '123 Đường Ẩm Thực, Phường Bến Thành, Quận 1, TP. Hồ Chí Minh',
    '0900000000', 'hello@cas.local', 'https://maps.google.com/?q=10.7769,106.7009',
    '09:00:00', '22:00:00', 'Món ngon gọi nhanh, vui trọn từng bàn.', 25,
    'Asia/Ho_Chi_Minh', 'ACTIVE'
);
SET @store_id = LAST_INSERT_ID();

-- Không gán created_by: tài khoản vận hành phải được tạo và liên kết với Firebase qua API.
INSERT INTO dining_tables (store_id, code, capacity, created_by) VALUES
    (@store_id, 1, 4, NULL), (@store_id, 2, 4, NULL),
    (@store_id, 3, 4, NULL), (@store_id, 4, 4, NULL),
    (@store_id, 5, 6, NULL), (@store_id, 6, 6, NULL),
    (@store_id, 7, 8, NULL), (@store_id, 8, 8, NULL);

INSERT INTO table_qr_codes (table_id, token, status, issued_at, revoked_at)
SELECT dining_tables.id, demo_qr.token, 'ACTIVE', CURRENT_TIMESTAMP(3), NULL
FROM dining_tables
INNER JOIN (
    SELECT 1 AS table_code, '8d0c01c6b4e2488da9b71e30f7ad000111111111111111111111111111111111' AS token
    UNION ALL SELECT 2, '8d0c01c6b4e2488da9b71e30f7ad000222222222222222222222222222222222'
    UNION ALL SELECT 3, '8d0c01c6b4e2488da9b71e30f7ad000333333333333333333333333333333333'
    UNION ALL SELECT 4, '8d0c01c6b4e2488da9b71e30f7ad000444444444444444444444444444444444'
    UNION ALL SELECT 5, '8d0c01c6b4e2488da9b71e30f7ad000555555555555555555555555555555555'
    UNION ALL SELECT 6, '8d0c01c6b4e2488da9b71e30f7ad000666666666666666666666666666666666'
    UNION ALL SELECT 7, '8d0c01c6b4e2488da9b71e30f7ad000777777777777777777777777777777777'
    UNION ALL SELECT 8, '8d0c01c6b4e2488da9b71e30f7ad000888888888888888888888888888888888'
) AS demo_qr ON demo_qr.table_code = dining_tables.code
WHERE dining_tables.store_id = @store_id;

INSERT INTO categories (store_id, name, description, category_type, display_order, status, created_by, updated_by) VALUES
    (@store_id, 'Mì cay', 'Mì cay nhiều cấp độ.', 'REGULAR', 1, 'ACTIVE', NULL, NULL),
    (@store_id, 'Gà rán', 'Các món gà rán giòn.', 'REGULAR', 2, 'ACTIVE', NULL, NULL),
    (@store_id, 'Trà sữa', 'Đồ uống trà sữa và topping.', 'REGULAR', 3, 'ACTIVE', NULL, NULL),
    (@store_id, 'Cà phê', 'Cà phê pha máy và cà phê truyền thống.', 'REGULAR', 4, 'ACTIVE', NULL, NULL),
    (@store_id, 'Nước giải khát', 'Đồ uống mát lạnh.', 'REGULAR', 5, 'ACTIVE', NULL, NULL),
    (@store_id, 'Ăn vặt', 'Món ăn vặt dùng chung.', 'REGULAR', 6, 'ACTIVE', NULL, NULL);

INSERT INTO tags (store_id, name, status) VALUES
    (@store_id, 'Bán chạy', 'ACTIVE'), (@store_id, 'Món mới', 'ACTIVE'), (@store_id, 'Cực cay', 'ACTIVE');

INSERT INTO option_groups (
    store_id, name, selection_type, min_select, max_select, display_order, status, created_by, updated_by
) VALUES
    (@store_id, 'Cấp độ cay', 'SINGLE', 1, 1, 1, 'ACTIVE', NULL, NULL),
    (@store_id, 'Kích thước', 'SINGLE', 1, 1, 2, 'ACTIVE', NULL, NULL),
    (@store_id, 'Độ ngọt', 'SINGLE', 0, 1, 3, 'ACTIVE', NULL, NULL),
    (@store_id, 'Topping', 'MULTIPLE', 0, NULL, 4, 'ACTIVE', NULL, NULL);

INSERT INTO option_values (
    option_group_id, name, extra_price, is_default, display_order, status, created_by, updated_by
)
SELECT option_groups.id, demo_option.name, demo_option.extra_price, demo_option.is_default,
       demo_option.display_order, 'ACTIVE', NULL, NULL
FROM option_groups
INNER JOIN (
    SELECT 'Cấp độ cay' AS group_name, 'Cấp 0' AS name, 0.00 AS extra_price, TRUE AS is_default, 0 AS display_order
    UNION ALL SELECT 'Cấp độ cay', 'Cấp 1', 0.00, FALSE, 1
    UNION ALL SELECT 'Cấp độ cay', 'Cấp 2', 0.00, FALSE, 2
    UNION ALL SELECT 'Cấp độ cay', 'Cấp 3', 0.00, FALSE, 3
    UNION ALL SELECT 'Cấp độ cay', 'Cấp 4', 0.00, FALSE, 4
    UNION ALL SELECT 'Cấp độ cay', 'Cấp 5', 0.00, FALSE, 5
    UNION ALL SELECT 'Cấp độ cay', 'Cấp 6', 0.00, FALSE, 6
    UNION ALL SELECT 'Cấp độ cay', 'Cấp 7', 0.00, FALSE, 7
    UNION ALL SELECT 'Kích thước', 'Size M', 0.00, TRUE, 1
    UNION ALL SELECT 'Kích thước', 'Size L', 10000.00, FALSE, 2
    UNION ALL SELECT 'Độ ngọt', '30%', 0.00, FALSE, 1
    UNION ALL SELECT 'Độ ngọt', '50%', 0.00, FALSE, 2
    UNION ALL SELECT 'Độ ngọt', '100%', 0.00, TRUE, 3
    UNION ALL SELECT 'Topping', 'Trân châu đen', 8000.00, FALSE, 1
    UNION ALL SELECT 'Topping', 'Trân châu trắng', 8000.00, FALSE, 2
    UNION ALL SELECT 'Topping', 'Pudding trứng', 10000.00, FALSE, 3
    UNION ALL SELECT 'Topping', 'Thạch phô mai', 10000.00, FALSE, 4
) AS demo_option ON demo_option.group_name = option_groups.name
WHERE option_groups.store_id = @store_id;

INSERT INTO menu_items (
    category_id, store_id, name, description, price, image_url, image_storage_key,
    availability_status, display_order, created_by, updated_by
)
SELECT categories.id, @store_id, demo_item.name, demo_item.description, demo_item.price,
       demo_item.image_url, NULL, 'AVAILABLE', demo_item.display_order, NULL, NULL
FROM categories
INNER JOIN (
    SELECT 'Mì cay' AS category_name, 'Mì cay đặc biệt 7 cấp độ' AS name, 'Mì cay đậm vị với rau, nấm và topping.' AS description, 55000.00 AS price, '/images/welcome/spicy-noodles.jpg' AS image_url, 1 AS display_order
    UNION ALL SELECT 'Mì cay', 'Mì cay xúc xích phô mai', 'Mì cay béo thơm cùng xúc xích và phô mai.', 49000.00, '/images/welcome/spicy-noodles.jpg', 2
    UNION ALL SELECT 'Mì cay', 'Mì cay nấm rau củ', 'Mì cay thanh nhẹ với nấm và rau xanh.', 42000.00, '/images/welcome/spicy-noodles.jpg', 3
    UNION ALL SELECT 'Gà rán', 'Gà rán giòn rụm', 'Gà rán vàng giòn, dùng kèm sốt cay.', 35000.00, '/images/welcome/fried-chicken.jpg', 1
    UNION ALL SELECT 'Gà rán', 'Gà sốt cay Hàn Quốc', 'Gà rán phủ sốt cay ngọt và mè rang.', 39000.00, '/images/welcome/fried-chicken.jpg', 2
    UNION ALL SELECT 'Gà rán', 'Gà popcorn lắc phô mai', 'Gà viên giòn tan phủ bột phô mai.', 32000.00, '/images/welcome/fried-chicken.jpg', 3
    UNION ALL SELECT 'Trà sữa', 'Trà sữa trân châu đường đen', 'Trà thơm dịu cùng trân châu đường đen.', 45000.00, '/images/welcome/milk-tea.jpg', 1
    UNION ALL SELECT 'Trà sữa', 'Trà sữa truyền thống', 'Trà đậm thơm hòa cùng sữa béo nhẹ.', 35000.00, '/images/welcome/milk-tea.jpg', 2
    UNION ALL SELECT 'Trà sữa', 'Trà sữa matcha', 'Matcha thơm dịu cùng sữa tươi.', 42000.00, '/images/welcome/matcha-drink.jpg', 3
    UNION ALL SELECT 'Cà phê', 'Cà phê sữa đá', 'Cà phê rang đậm pha cùng sữa đặc.', 29000.00, '/images/welcome/iced-coffee.jpg', 1
    UNION ALL SELECT 'Cà phê', 'Cà phê đen đá', 'Cà phê rang đậm, vị mạnh mẽ.', 24000.00, '/images/welcome/iced-coffee.jpg', 2
    UNION ALL SELECT 'Nước giải khát', 'Trà đào cam sả', 'Trà đào mát lạnh cùng cam và sả.', 39000.00, '/images/welcome/matcha-drink.jpg', 1
    UNION ALL SELECT 'Nước giải khát', 'Soda chanh', 'Soda chanh tươi mát lạnh.', 25000.00, '/images/welcome/milk-tea.jpg', 2
    UNION ALL SELECT 'Ăn vặt', 'Khoai tây chiên', 'Khoai tây chiên vàng giòn.', 30000.00, '/images/welcome/street-snacks.jpg', 1
    UNION ALL SELECT 'Ăn vặt', 'Xúc xích chiên', 'Xúc xích chiên nóng hổi.', 25000.00, '/images/welcome/street-snacks.jpg', 2
) AS demo_item ON demo_item.category_name = categories.name
WHERE categories.store_id = @store_id;

INSERT INTO menu_item_option_groups (menu_item_id, option_group_id, store_id, display_order)
SELECT menu_items.id, option_groups.id, @store_id, demo_link.display_order
FROM menu_items
INNER JOIN (
    SELECT 'Mì cay đặc biệt 7 cấp độ' AS item_name, 'Cấp độ cay' AS group_name, 1 AS display_order
    UNION ALL SELECT 'Mì cay xúc xích phô mai', 'Cấp độ cay', 1
    UNION ALL SELECT 'Mì cay nấm rau củ', 'Cấp độ cay', 1
    UNION ALL SELECT 'Trà sữa trân châu đường đen', 'Kích thước', 1
    UNION ALL SELECT 'Trà sữa trân châu đường đen', 'Độ ngọt', 2
    UNION ALL SELECT 'Trà sữa trân châu đường đen', 'Topping', 3
    UNION ALL SELECT 'Trà sữa truyền thống', 'Kích thước', 1
    UNION ALL SELECT 'Trà sữa truyền thống', 'Độ ngọt', 2
    UNION ALL SELECT 'Trà sữa truyền thống', 'Topping', 3
    UNION ALL SELECT 'Trà sữa matcha', 'Kích thước', 1
    UNION ALL SELECT 'Trà sữa matcha', 'Độ ngọt', 2
    UNION ALL SELECT 'Trà sữa matcha', 'Topping', 3
) AS demo_link ON demo_link.item_name = menu_items.name
INNER JOIN option_groups ON option_groups.name = demo_link.group_name AND option_groups.store_id = @store_id
WHERE menu_items.store_id = @store_id;

INSERT INTO menu_item_tags (menu_item_id, tag_id, store_id)
SELECT menu_items.id, tags.id, @store_id
FROM menu_items
INNER JOIN (
    SELECT 'Mì cay đặc biệt 7 cấp độ' AS item_name, 'Bán chạy' AS tag_name
    UNION ALL SELECT 'Mì cay đặc biệt 7 cấp độ', 'Cực cay'
    UNION ALL SELECT 'Mì cay xúc xích phô mai', 'Món mới'
    UNION ALL SELECT 'Gà sốt cay Hàn Quốc', 'Bán chạy'
    UNION ALL SELECT 'Trà sữa matcha', 'Món mới'
) AS demo_tag ON demo_tag.item_name = menu_items.name
INNER JOIN tags ON tags.name = demo_tag.tag_name AND tags.store_id = @store_id
WHERE menu_items.store_id = @store_id;

COMMIT;
