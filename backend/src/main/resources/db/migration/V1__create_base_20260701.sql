CREATE TABLE stores (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(500) NULL,
    phone VARCHAR(20) NULL,
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id)
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE dining_tables (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    store_id BIGINT UNSIGNED NOT NULL,
    code INT UNSIGNED NOT NULL,
    capacity SMALLINT UNSIGNED NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT uk_dining_tables_code UNIQUE (code),
    KEY idx_dining_tables_store_id (store_id),
    CONSTRAINT fk_dining_tables_store
        FOREIGN KEY (store_id) REFERENCES stores (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE table_qr_codes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    table_id BIGINT UNSIGNED NOT NULL,
    token CHAR(64) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    issued_at DATETIME(3) NOT NULL,
    revoked_at DATETIME(3) NULL,
    active_table_id BIGINT UNSIGNED
        GENERATED ALWAYS AS (
            CASE WHEN status = 'ACTIVE' THEN table_id ELSE NULL END
        ) STORED,
    PRIMARY KEY (id),
    CONSTRAINT uk_table_qr_codes_token UNIQUE (token),
    CONSTRAINT uk_table_qr_codes_active_table UNIQUE (active_table_id),
    KEY idx_table_qr_codes_table_id (table_id),
    CONSTRAINT fk_table_qr_codes_table
        FOREIGN KEY (table_id) REFERENCES dining_tables (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE categories (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    store_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    category_type VARCHAR(20) NOT NULL,
    display_order INT UNSIGNED NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT uk_categories_store_name UNIQUE (store_id, name),
    KEY idx_categories_menu (store_id, category_type, status, display_order),
    CONSTRAINT fk_categories_store
        FOREIGN KEY (store_id) REFERENCES stores (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE menu_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    category_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    price DECIMAL(15, 2) NOT NULL,
    image_url VARCHAR(2048) NULL,
    image_storage_key VARCHAR(512) NULL,
    availability_status VARCHAR(20) NOT NULL,
    display_order INT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    KEY idx_menu_items_category_id (category_id),
    KEY idx_menu_items_menu (category_id, availability_status, display_order),
    CONSTRAINT fk_menu_items_category
        FOREIGN KEY (category_id) REFERENCES categories (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE tags (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    store_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT uk_tags_store_name UNIQUE (store_id, name),
    KEY idx_tags_store_id (store_id),
    CONSTRAINT fk_tags_store
        FOREIGN KEY (store_id) REFERENCES stores (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE menu_item_tags (
    menu_item_id BIGINT UNSIGNED NOT NULL,
    tag_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (menu_item_id, tag_id),
    KEY idx_menu_item_tags_tag_id (tag_id),
    CONSTRAINT fk_menu_item_tags_menu_item
        FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_menu_item_tags_tag
        FOREIGN KEY (tag_id) REFERENCES tags (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE option_groups (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    menu_item_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    selection_type VARCHAR(20) NOT NULL,
    min_select SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    max_select SMALLINT UNSIGNED NULL,
    display_order INT UNSIGNED NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT uk_option_groups_item_name UNIQUE (menu_item_id, name),
    KEY idx_option_groups_menu (menu_item_id, status, display_order),
    CONSTRAINT fk_option_groups_menu_item
        FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE option_group_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    option_group_id BIGINT UNSIGNED NOT NULL,
    option_menu_item_id BIGINT UNSIGNED NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT UNSIGNED NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT uk_option_group_items_group_item
        UNIQUE (option_group_id, option_menu_item_id),
    KEY idx_option_group_items_option_menu_item_id (option_menu_item_id),
    KEY idx_option_group_items_menu (option_group_id, status, display_order),
    CONSTRAINT fk_option_group_items_group
        FOREIGN KEY (option_group_id) REFERENCES option_groups (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_option_group_items_menu_item
        FOREIGN KEY (option_menu_item_id) REFERENCES menu_items (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE accounts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    store_id BIGINT UNSIGNED NOT NULL,
    username VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_login_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT uk_accounts_store_username UNIQUE (store_id, username),
    KEY idx_accounts_store_id (store_id),
    CONSTRAINT fk_accounts_store
        FOREIGN KEY (store_id) REFERENCES stores (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE client_accounts (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    store_id BIGINT UNSIGNED NOT NULL,
    phone VARCHAR(20) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT uk_client_accounts_store_phone UNIQUE (store_id, phone),
    KEY idx_client_accounts_store_id (store_id),
    CONSTRAINT fk_client_accounts_store
        FOREIGN KEY (store_id) REFERENCES stores (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE table_sessions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    table_id BIGINT UNSIGNED NOT NULL,
    public_id CHAR(36) NOT NULL,
    client_account_id BIGINT UNSIGNED NOT NULL,
    opened_by_customer_name VARCHAR(150) NOT NULL,
    opened_by_customer_phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    payment_requested_at DATETIME(3) NULL,
    closed_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    occupying_table_id BIGINT UNSIGNED
        GENERATED ALWAYS AS (
            CASE
                WHEN status IN ('OPEN', 'PAYMENT_PENDING') THEN table_id
                ELSE NULL
            END
        ) STORED,
    PRIMARY KEY (id),
    CONSTRAINT uk_table_sessions_public_id UNIQUE (public_id),
    CONSTRAINT uk_table_sessions_occupying_table UNIQUE (occupying_table_id),
    KEY idx_table_sessions_table_id (table_id),
    KEY idx_table_sessions_client_account_id (client_account_id),
    CONSTRAINT fk_table_sessions_table
        FOREIGN KEY (table_id) REFERENCES dining_tables (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_table_sessions_client_account
        FOREIGN KEY (client_account_id) REFERENCES client_accounts (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE orders (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL,
    table_session_id BIGINT UNSIGNED NOT NULL,
    idempotency_key VARCHAR(100) NOT NULL,
    request_fingerprint CHAR(64) NOT NULL,
    order_number VARCHAR(50) NOT NULL,
    original_amount DECIMAL(15, 2) NOT NULL,
    payable_amount DECIMAL(15, 2) NOT NULL,
    note VARCHAR(1000) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT uk_orders_public_id UNIQUE (public_id),
    CONSTRAINT uk_orders_order_number UNIQUE (order_number),
    CONSTRAINT uk_orders_session_idempotency
        UNIQUE (table_session_id, idempotency_key),
    CONSTRAINT fk_orders_table_session
        FOREIGN KEY (table_session_id) REFERENCES table_sessions (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE order_items (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL,
    order_id BIGINT UNSIGNED NOT NULL,
    menu_item_id BIGINT UNSIGNED NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    options_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    quantity INT UNSIGNED NOT NULL,
    prepared_quantity INT UNSIGNED NOT NULL DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT uk_order_items_public_id UNIQUE (public_id),
    KEY idx_order_items_order_id (order_id),
    KEY idx_order_items_menu_item_id (menu_item_id),
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_order_items_menu_item
        FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE order_item_options (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    order_item_id BIGINT UNSIGNED NOT NULL,
    option_group_item_id BIGINT UNSIGNED NOT NULL,
    option_group_name VARCHAR(150) NOT NULL,
    option_name VARCHAR(150) NOT NULL,
    unit_price DECIMAL(15, 2) NOT NULL,
    quantity_per_item INT UNSIGNED NOT NULL DEFAULT 1,
    total_amount DECIMAL(15, 2) NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT uk_order_item_options_item_option
        UNIQUE (order_item_id, option_group_item_id),
    KEY idx_order_item_options_option_group_item_id (option_group_item_id),
    CONSTRAINT fk_order_item_options_order_item
        FOREIGN KEY (order_item_id) REFERENCES order_items (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_order_item_options_group_item
        FOREIGN KEY (option_group_item_id) REFERENCES option_group_items (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE order_item_cancellation_requests (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL,
    order_item_id BIGINT UNSIGNED NOT NULL,
    idempotency_key VARCHAR(100) NOT NULL,
    requested_quantity INT UNSIGNED NOT NULL,
    reason VARCHAR(1000) NULL,
    status VARCHAR(20) NOT NULL,
    resolved_by BIGINT UNSIGNED NULL,
    resolved_by_name VARCHAR(150) NULL,
    resolved_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT uk_cancellation_requests_public_id UNIQUE (public_id),
    CONSTRAINT uk_cancellation_requests_item_idempotency
        UNIQUE (order_item_id, idempotency_key),
    KEY idx_cancellation_requests_resolved_by (resolved_by),
    CONSTRAINT fk_cancellation_requests_order_item
        FOREIGN KEY (order_item_id) REFERENCES order_items (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_cancellation_requests_resolver
        FOREIGN KEY (resolved_by) REFERENCES accounts (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE payments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL,
    table_session_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    bill_snapshot JSON NOT NULL,
    status VARCHAR(20) NOT NULL,
    confirmed_by BIGINT UNSIGNED NULL,
    confirmed_by_name VARCHAR(150) NULL,
    confirmed_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT uk_payments_public_id UNIQUE (public_id),
    CONSTRAINT uk_payments_table_session UNIQUE (table_session_id),
    KEY idx_payments_confirmed_by (confirmed_by),
    CONSTRAINT fk_payments_table_session
        FOREIGN KEY (table_session_id) REFERENCES table_sessions (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_payments_confirmer
        FOREIGN KEY (confirmed_by) REFERENCES accounts (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE unpaid_records (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL,
    table_session_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    bill_snapshot JSON NOT NULL,
    status VARCHAR(20) NOT NULL,
    reason VARCHAR(1000) NULL,
    reported_by BIGINT UNSIGNED NOT NULL,
    reported_by_name VARCHAR(150) NOT NULL,
    resolution_payment_id BIGINT UNSIGNED NULL,
    resolved_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT uk_unpaid_records_public_id UNIQUE (public_id),
    CONSTRAINT uk_unpaid_records_table_session UNIQUE (table_session_id),
    CONSTRAINT uk_unpaid_records_resolution_payment UNIQUE (resolution_payment_id),
    KEY idx_unpaid_records_reported_by (reported_by),
    CONSTRAINT fk_unpaid_records_table_session
        FOREIGN KEY (table_session_id) REFERENCES table_sessions (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_unpaid_records_reporter
        FOREIGN KEY (reported_by) REFERENCES accounts (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_unpaid_records_resolution_payment
        FOREIGN KEY (resolution_payment_id) REFERENCES payments (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;

CREATE TABLE audit_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    store_id BIGINT UNSIGNED NOT NULL,
    request_id CHAR(36) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT UNSIGNED NOT NULL,
    entity_name VARCHAR(150) NULL,
    change_data JSON NOT NULL,
    actor_account_id BIGINT UNSIGNED NOT NULL,
    actor_name VARCHAR(150) NOT NULL,
    description VARCHAR(1000) NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    KEY idx_audit_logs_store_id (store_id),
    KEY idx_audit_logs_actor_account_id (actor_account_id),
    CONSTRAINT fk_audit_logs_store
        FOREIGN KEY (store_id) REFERENCES stores (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_audit_logs_actor
        FOREIGN KEY (actor_account_id) REFERENCES accounts (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;
