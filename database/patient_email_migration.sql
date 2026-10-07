USE cerebral_palsy_db;
-- Patient Email OTP support
-- Run this only if your existing patients table does not already have email.

ALTER TABLE patients
ADD COLUMN email VARCHAR(255) NULL AFTER contact;
