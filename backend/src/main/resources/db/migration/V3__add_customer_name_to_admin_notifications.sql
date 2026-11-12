-- Historical cancellation notifications can be enriched when exactly one session received them.
UPDATE system_notifications AS notifications
JOIN (
    SELECT recipients.notification_id, MIN(sessions.opened_by_customer_name) AS customer_name,
           CASE WHEN MIN(sessions.session_type) = 'TAKEAWAY' THEN 'Mang về'
                ELSE CONCAT('Bàn ', MIN(tables.code)) END AS destination
    FROM system_notification_recipients AS recipients
    JOIN sales_sessions AS sessions ON sessions.id = recipients.sales_session_id
    LEFT JOIN dining_tables AS tables ON tables.id = sessions.table_id
    GROUP BY recipients.notification_id
    HAVING COUNT(*) = 1
) AS recipient ON recipient.notification_id = notifications.id
SET notifications.admin_content = CONCAT(
    LEFT(notifications.admin_content, CHAR_LENGTH(notifications.admin_content) - 1),
    ', Khách: ', recipient.customer_name, ')'
)
WHERE notifications.target_role = 'CUSTOMER'
  AND notifications.title IN ('Yêu cầu hủy món đã được đồng ý', 'Yêu cầu hủy món bị từ chối')
  AND notifications.admin_content = CONCAT(notifications.content, ' (', recipient.destination, ')');
