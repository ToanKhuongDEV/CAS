ALTER TABLE order_items
    ADD COLUMN served_at DATETIME(3) NULL AFTER prepared_quantity;
