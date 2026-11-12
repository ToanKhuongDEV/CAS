ALTER TABLE system_notifications ADD COLUMN admin_content TEXT NULL AFTER content;

-- Historical notifications have no event link; only single-session matches can be enriched.
UPDATE system_notifications AS notifications
JOIN (
    SELECT recipients.notification_id,
           CASE WHEN MIN(sessions.session_type) = 'TAKEAWAY' THEN 'Mang về'
                ELSE CONCAT('Bàn ', MIN(tables.code)) END AS destination
    FROM system_notification_recipients AS recipients
    JOIN sales_sessions AS sessions ON sessions.id = recipients.sales_session_id
    LEFT JOIN dining_tables AS tables ON tables.id = sessions.table_id
    GROUP BY recipients.notification_id
    HAVING COUNT(*) = 1
) AS destination ON destination.notification_id = notifications.id
SET notifications.admin_content = CONCAT(notifications.content, ' (', destination.destination, ')')
WHERE notifications.target_role = 'CUSTOMER'
  AND notifications.title IN ('Yêu cầu hủy món đã được đồng ý', 'Yêu cầu hủy món bị từ chối');
