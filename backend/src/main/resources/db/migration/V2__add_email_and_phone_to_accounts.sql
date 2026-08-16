ALTER TABLE accounts
    ADD COLUMN email VARCHAR(254) NULL AFTER firebase_uid,
    ADD COLUMN phone VARCHAR(20) NULL AFTER email;

UPDATE accounts
SET email = CONCAT('legacy-', id, '@invalid.local'),
    phone = CAST(id AS CHAR(20))
WHERE email IS NULL
   OR phone IS NULL;

ALTER TABLE accounts
    MODIFY COLUMN email VARCHAR(254) NOT NULL,
    MODIFY COLUMN phone VARCHAR(20) NOT NULL,
    ADD CONSTRAINT uk_accounts_email UNIQUE (email),
    ADD CONSTRAINT uk_accounts_phone UNIQUE (phone);
