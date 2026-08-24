ALTER TABLE table_qr_codes
    DROP FOREIGN KEY fk_table_qr_codes_table;

ALTER TABLE table_qr_codes
    ADD CONSTRAINT fk_table_qr_codes_table
        FOREIGN KEY (table_id) REFERENCES dining_tables (id)
        ON DELETE CASCADE ON UPDATE RESTRICT;
