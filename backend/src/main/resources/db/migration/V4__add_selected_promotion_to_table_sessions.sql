ALTER TABLE table_sessions
    ADD COLUMN selected_promotion_id BIGINT UNSIGNED NULL,
    ADD COLUMN selected_promotion_code_id BIGINT UNSIGNED NULL,
    ADD CONSTRAINT fk_table_sessions_selected_promotion
        FOREIGN KEY (selected_promotion_id) REFERENCES promotions (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT,
    ADD CONSTRAINT fk_table_sessions_selected_promotion_code
        FOREIGN KEY (selected_promotion_code_id) REFERENCES promotion_codes (id)
        ON DELETE RESTRICT ON UPDATE RESTRICT;
