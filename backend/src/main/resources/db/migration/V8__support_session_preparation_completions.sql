ALTER TABLE preparation_table_completions
    DROP FOREIGN KEY fk_preparation_table_completions_table,
    MODIFY table_id BIGINT UNSIGNED NULL,
    ADD COLUMN sales_session_id BIGINT UNSIGNED NULL,
    ADD CONSTRAINT fk_preparation_table_completions_table
        FOREIGN KEY (table_id) REFERENCES dining_tables (id),
    ADD CONSTRAINT fk_preparation_completions_sales_session
        FOREIGN KEY (sales_session_id) REFERENCES sales_sessions (id);
