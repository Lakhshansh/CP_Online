-- Patient Email + OTP verification safety check
-- Run the SELECT statements first.
SELECT patient_id, name, email, otp_verified, user_id
FROM patients
ORDER BY patient_id DESC;

-- Only run these ALTER statements if DESCRIBE patients; shows the column is missing.
-- ALTER TABLE patients ADD COLUMN email VARCHAR(255) NULL;
-- ALTER TABLE patients ADD COLUMN otp_verified TINYINT(1) NOT NULL DEFAULT 0;
