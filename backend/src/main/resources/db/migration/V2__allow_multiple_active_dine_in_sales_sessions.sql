ALTER TABLE sales_sessions
    DROP INDEX uk_sales_sessions_occupying_table,
    DROP COLUMN occupying_table_id;
