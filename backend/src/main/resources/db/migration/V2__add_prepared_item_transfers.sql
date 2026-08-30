CREATE TABLE prepared_item_transfers (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL,
    cancellation_request_id BIGINT UNSIGNED NOT NULL,
    source_order_item_id BIGINT UNSIGNED NOT NULL,
    target_order_item_id BIGINT UNSIGNED NOT NULL,
    quantity INT UNSIGNED NOT NULL,
    transferred_by_account_id BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT uk_prepared_item_transfers_public_id UNIQUE (public_id),
    KEY idx_prepared_item_transfers_cancellation_request (cancellation_request_id),
    KEY idx_prepared_item_transfers_source_order_item (source_order_item_id),
    KEY idx_prepared_item_transfers_target_order_item (target_order_item_id),
    KEY idx_prepared_item_transfers_transferred_by (transferred_by_account_id),
    CONSTRAINT fk_prepared_item_transfers_cancellation_request
        FOREIGN KEY (cancellation_request_id) REFERENCES order_item_cancellation_requests (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_prepared_item_transfers_source_order_item
        FOREIGN KEY (source_order_item_id) REFERENCES order_items (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_prepared_item_transfers_target_order_item
        FOREIGN KEY (target_order_item_id) REFERENCES order_items (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_prepared_item_transfers_operator
        FOREIGN KEY (transferred_by_account_id) REFERENCES accounts (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB
  DEFAULT CHARACTER SET = utf8mb4
  COLLATE = utf8mb4_0900_ai_ci;
