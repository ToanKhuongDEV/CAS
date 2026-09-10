CREATE TABLE preparation_table_completions (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL,
    store_id BIGINT UNSIGNED NOT NULL,
    table_id BIGINT UNSIGNED NOT NULL,
    idempotency_key VARCHAR(100) NOT NULL,
    request_fingerprint CHAR(64) NOT NULL,
    allocation_snapshot JSON NOT NULL,
    completed_by_account_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT uk_preparation_table_completions_public_id UNIQUE (public_id),
    CONSTRAINT uk_preparation_table_completions_store_idempotency UNIQUE (store_id, idempotency_key),
    KEY idx_preparation_table_completions_table_created_at (table_id, created_at),
    CONSTRAINT fk_preparation_table_completions_store FOREIGN KEY (store_id) REFERENCES stores (id),
    CONSTRAINT fk_preparation_table_completions_table FOREIGN KEY (table_id) REFERENCES dining_tables (id),
    CONSTRAINT fk_preparation_table_completions_completed_by FOREIGN KEY (completed_by_account_id) REFERENCES accounts (id)
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
