-- Clone all demo customer-facing data from store 1 into an existing store 2.
-- Run manually after Flyway migrations. This script deliberately does not clone
-- operational accounts because Firebase UID, email, and phone are globally unique.

START TRANSACTION;

SET @source_store_id = 1;
SET @target_store_id = 2;

UPDATE stores
SET name = 'CAS Mì Cay - Quận 3',
    address = '456 Đường Võ Văn Tần, Phường 5, Quận 3, TP. Hồ Chí Minh',
    phone = '0900000002',
    email = 'quan3@cas.local',
    logo_url = 'https://res.cloudinary.com/dh6qzqf73/image/upload/v1787647789/cas/stores/1/1_20bbe6e4-5482-47d1-8018-6e4e25b9cff8.svg',
    logo_storage_key = NULL,
    google_maps_location = 'https://maps.google.com/?q=10.7869,106.6869',
    latitude = 10.78690000,
    longitude = 106.68690000,
    open_time = '09:00:00',
    close_time = '22:00:00',
    welcome_slogan = 'Món ngon gọi nhanh, vui trọn từng bàn.',
    long_wait_warning_minutes = 25,
    timezone = 'Asia/Ho_Chi_Minh',
    status = 'ACTIVE'
WHERE id = @target_store_id;

INSERT INTO store_banners (
    store_id,
    hero_primary_image_url, hero_primary_image_storage_key,
    hero_secondary_image_url, hero_secondary_image_storage_key,
    menu_preview_1_image_url, menu_preview_1_image_storage_key,
    menu_preview_2_image_url, menu_preview_2_image_storage_key,
    menu_preview_3_image_url, menu_preview_3_image_storage_key,
    menu_preview_4_image_url, menu_preview_4_image_storage_key,
    menu_preview_5_image_url, menu_preview_5_image_storage_key,
    banner_image_url, banner_image_storage_key,
    status, created_by, updated_by
)
SELECT
    @target_store_id,
    hero_primary_image_url, hero_primary_image_storage_key,
    hero_secondary_image_url, hero_secondary_image_storage_key,
    menu_preview_1_image_url, menu_preview_1_image_storage_key,
    menu_preview_2_image_url, menu_preview_2_image_storage_key,
    menu_preview_3_image_url, menu_preview_3_image_storage_key,
    menu_preview_4_image_url, menu_preview_4_image_storage_key,
    menu_preview_5_image_url, menu_preview_5_image_storage_key,
    banner_image_url, banner_image_storage_key,
    status, NULL, NULL
FROM store_banners source
WHERE source.store_id = @source_store_id
  AND NOT EXISTS (
      SELECT 1 FROM store_banners target WHERE target.store_id = @target_store_id
  );

INSERT INTO dining_tables (store_id, code, capacity, created_by)
SELECT @target_store_id, source.code, source.capacity, NULL
FROM dining_tables source
WHERE source.store_id = @source_store_id
  AND NOT EXISTS (
      SELECT 1 FROM dining_tables target
      WHERE target.store_id = @target_store_id AND target.code = source.code
  );

INSERT INTO table_qr_codes (table_id, token, status, issued_at, revoked_at)
SELECT target.id, SHA2(UUID(), 256), 'ACTIVE', CURRENT_TIMESTAMP(3), NULL
FROM dining_tables target
WHERE target.store_id = @target_store_id
  AND NOT EXISTS (
      SELECT 1 FROM table_qr_codes qr
      WHERE qr.table_id = target.id AND qr.status = 'ACTIVE'
  );

INSERT INTO categories (
    store_id, name, description, category_type, display_order, status, created_by, updated_by
)
SELECT @target_store_id, name, description, category_type, display_order, status, NULL, NULL
FROM categories source
WHERE source.store_id = @source_store_id
  AND NOT EXISTS (
      SELECT 1 FROM categories target
      WHERE target.store_id = @target_store_id AND target.name = source.name
  );

INSERT INTO tags (store_id, name, status)
SELECT @target_store_id, name, status
FROM tags source
WHERE source.store_id = @source_store_id
  AND NOT EXISTS (
      SELECT 1 FROM tags target
      WHERE target.store_id = @target_store_id AND target.name = source.name
  );

INSERT INTO option_groups (
    store_id, name, selection_type, min_select, max_select, display_order, status, created_by, updated_by
)
SELECT @target_store_id, name, selection_type, min_select, max_select, display_order, status, NULL, NULL
FROM option_groups source
WHERE source.store_id = @source_store_id
  AND NOT EXISTS (
      SELECT 1 FROM option_groups target
      WHERE target.store_id = @target_store_id AND target.name = source.name
  );

INSERT INTO option_values (
    option_group_id, name, extra_price, is_default, display_order, status, created_by, updated_by
)
SELECT target_group.id, source_value.name, source_value.extra_price, source_value.is_default,
       source_value.display_order, source_value.status, NULL, NULL
FROM option_values source_value
INNER JOIN option_groups source_group ON source_group.id = source_value.option_group_id
INNER JOIN option_groups target_group
    ON target_group.store_id = @target_store_id AND target_group.name = source_group.name
WHERE source_group.store_id = @source_store_id
  AND NOT EXISTS (
      SELECT 1 FROM option_values target_value
      WHERE target_value.option_group_id = target_group.id
        AND target_value.name = source_value.name
  );

INSERT INTO menu_items (
    category_id, store_id, name, description, price, image_url, image_storage_key,
    availability_status, display_order, created_by, updated_by
)
SELECT target_category.id, @target_store_id, source_item.name, source_item.description,
       source_item.price, source_item.image_url, source_item.image_storage_key,
       source_item.availability_status, source_item.display_order, NULL, NULL
FROM menu_items source_item
INNER JOIN categories source_category ON source_category.id = source_item.category_id
INNER JOIN categories target_category
    ON target_category.store_id = @target_store_id AND target_category.name = source_category.name
WHERE source_item.store_id = @source_store_id
  AND NOT EXISTS (
      SELECT 1 FROM menu_items target_item
      WHERE target_item.store_id = @target_store_id AND target_item.name = source_item.name
  );

INSERT INTO menu_item_option_groups (menu_item_id, option_group_id, store_id, display_order)
SELECT target_item.id, target_group.id, @target_store_id, source_link.display_order
FROM menu_item_option_groups source_link
INNER JOIN menu_items source_item ON source_item.id = source_link.menu_item_id
INNER JOIN option_groups source_group ON source_group.id = source_link.option_group_id
INNER JOIN menu_items target_item
    ON target_item.store_id = @target_store_id AND target_item.name = source_item.name
INNER JOIN option_groups target_group
    ON target_group.store_id = @target_store_id AND target_group.name = source_group.name
WHERE source_link.store_id = @source_store_id
  AND NOT EXISTS (
      SELECT 1 FROM menu_item_option_groups target_link
      WHERE target_link.menu_item_id = target_item.id
        AND target_link.option_group_id = target_group.id
  );

INSERT INTO menu_item_tags (menu_item_id, tag_id, store_id)
SELECT target_item.id, target_tag.id, @target_store_id
FROM menu_item_tags source_link
INNER JOIN menu_items source_item ON source_item.id = source_link.menu_item_id
INNER JOIN tags source_tag ON source_tag.id = source_link.tag_id
INNER JOIN menu_items target_item
    ON target_item.store_id = @target_store_id AND target_item.name = source_item.name
INNER JOIN tags target_tag
    ON target_tag.store_id = @target_store_id AND target_tag.name = source_tag.name
WHERE source_link.store_id = @source_store_id
  AND NOT EXISTS (
      SELECT 1 FROM menu_item_tags target_link
      WHERE target_link.menu_item_id = target_item.id
        AND target_link.tag_id = target_tag.id
  );

COMMIT;

SELECT
    dining_tables.code AS table_code,
    table_qr_codes.token,
    CONCAT('http://localhost:3000/table/', table_qr_codes.token) AS qr_url
FROM dining_tables
INNER JOIN table_qr_codes ON table_qr_codes.table_id = dining_tables.id
WHERE dining_tables.store_id = @target_store_id
  AND table_qr_codes.status = 'ACTIVE'
ORDER BY dining_tables.code;
