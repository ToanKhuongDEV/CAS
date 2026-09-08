ALTER TABLE system_notification_recipients
    DROP FOREIGN KEY fk_notification_recipients_notification;

ALTER TABLE system_notification_recipients
    ADD CONSTRAINT fk_notification_recipients_notification
        FOREIGN KEY (notification_id) REFERENCES system_notifications (id)
        ON DELETE CASCADE ON UPDATE RESTRICT;
