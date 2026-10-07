
DESCRIBE users;

USE cerebral_palsy_db;

ALTER TABLE users
ADD COLUMN phone VARCHAR(20) NULL AFTER hospital_name,
ADD COLUMN email VARCHAR(255) NULL AFTER phone;

ALTER TABLE users
ADD COLUMN doctor_name VARCHAR(150) NOT NULL,
ADD COLUMN doctor_specialization VARCHAR(150) NOT NULL;


USE cerebral_palsy_db;

ALTER TABLE users
ADD COLUMN profile_photo VARCHAR(255) NULL;
