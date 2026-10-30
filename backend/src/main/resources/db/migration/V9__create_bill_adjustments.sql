CREATE TABLE bill_adjustments (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    public_id CHAR(36) NOT NULL,
    sales_session_id BIGINT UNSIGNED NOT NULL,
    adjustment_type VARCHAR(20) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    reason VARCHAR(1000) NOT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    CONSTRAINT uk_bill_adjustments_public_id UNIQUE (public_id),
    KEY idx_bill_adjustments_session (sales_session_id),
    CONSTRAINT ck_bill_adjustments_type CHECK (adjustment_type IN ('INCREASE', 'DECREASE')),
    CONSTRAINT ck_bill_adjustments_amount CHECK (amount > 0),
    CONSTRAINT fk_bill_adjustments_session FOREIGN KEY (sales_session_id)
        REFERENCES sales_sessions (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_bill_adjustments_creator FOREIGN KEY (created_by)
        REFERENCES accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
