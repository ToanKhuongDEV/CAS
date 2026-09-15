-- Quota is consumed on payment request.  A reservation is completed on payment
-- confirmation or forfeited when the payment is recorded as unpaid.
ALTER TABLE promotion_redemptions
    ADD COLUMN forfeited_at DATETIME(3) NULL AFTER reversed_at;

INSERT INTO promotion_redemptions(store_id,promotion_id,promotion_code_id,client_account_id,
        table_session_id,payment_id,status)
SELECT bill_discounts.store_id,bill_discounts.promotion_id,bill_discounts.promotion_code_id,
       table_sessions.client_account_id,bill_discounts.table_session_id,bill_discounts.payment_id,
       'RESERVED'
FROM bill_discounts
INNER JOIN payments ON payments.id=bill_discounts.payment_id AND payments.status='PENDING'
INNER JOIN table_sessions ON table_sessions.id=bill_discounts.table_session_id
LEFT JOIN unpaid_records ON unpaid_records.table_session_id=table_sessions.id
    AND unpaid_records.status='OPEN'
LEFT JOIN promotion_redemptions ON promotion_redemptions.payment_id=payments.id
WHERE promotion_redemptions.id IS NULL AND unpaid_records.id IS NULL;
