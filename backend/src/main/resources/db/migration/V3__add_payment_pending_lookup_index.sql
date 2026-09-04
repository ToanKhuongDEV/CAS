ALTER TABLE payments
    ADD KEY idx_payments_status_created_session (status, created_at, table_session_id);
