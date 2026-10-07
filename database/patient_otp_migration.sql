-- Patient Email OTP database migration
-- Run this once in cerebral_palsy_db.
USE cerebral_palsy_db;

SET @db_name = DATABASE();
SET @column_exists = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @db_name
      AND TABLE_NAME = 'patients'
      AND COLUMN_NAME = 'otp_verified'
);

SET @sql = IF(
    @column_exists = 0,
    'ALTER TABLE patients ADD COLUMN otp_verified TINYINT(1) NOT NULL DEFAULT 0 AFTER email',
    'SELECT 1'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Existing patients are treated as not OTP-verified.
UPDATE patients
SET otp_verified = 0
WHERE otp_verified IS NULL;

SELECT patient_id, name, email, user_id, otp_verified
FROM patients
ORDER BY patient_id DESC;
UPDATE patients
SET otp_verified = 0
WHERE otp_verified IS NULL;