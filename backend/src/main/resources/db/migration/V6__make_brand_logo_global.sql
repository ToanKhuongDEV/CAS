ALTER TABLE brand_settings
    DROP FOREIGN KEY fk_brand_settings_logo_store,
    DROP COLUMN logo_store_id;

ALTER TABLE stores
    DROP COLUMN logo_url,
    DROP COLUMN logo_storage_key,
    DROP COLUMN welcome_slogan;
