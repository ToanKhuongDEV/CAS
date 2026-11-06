CREATE TABLE brand_settings (
    id TINYINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    logo_url VARCHAR(2048) NULL,
    logo_storage_key VARCHAR(512) NULL,
    logo_store_id BIGINT UNSIGNED NOT NULL,
    welcome_slogan VARCHAR(500) NULL,
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT chk_brand_settings_singleton CHECK (id = 1),
    CONSTRAINT fk_brand_settings_logo_store FOREIGN KEY (logo_store_id) REFERENCES stores(id)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

INSERT INTO brand_settings (id, name, logo_url, logo_storage_key, logo_store_id, welcome_slogan)
SELECT 1, name, logo_url, logo_storage_key, id, welcome_slogan
FROM stores
WHERE id = 1;
