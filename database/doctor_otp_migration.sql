USE cerebral_palsy_db;
-- Add Doctor Email OTP verification support
ALTER TABLE doctors
ADD COLUMN otp_verified TINYINT(1) NOT NULL DEFAULT 0;

UPDATE doctors
SET otp_verified = 0
WHERE doctor_id > 0 AND otp_verified IS NULL;
DESCRIBE doctors;

SELECT doctor_id, name, email, otp_verified
FROM doctors;

UPDATE doctors
SET otp_verified = 0
WHERE doctor_id > 0
  AND otp_verified IS NULL;
  
  SELECT doctor_id, name, email, otp_verified, user_id
FROM doctors
ORDER BY doctor_id DESC;