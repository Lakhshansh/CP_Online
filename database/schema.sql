-- =========================================================
-- MULTI THERAPY MANAGEMENT SYSTEM - DATABASE SCHEMA
-- Compatible with local MySQL and cloud platforms (Railway)
-- =========================================================

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) DEFAULT 'Admin',
    hospital_name VARCHAR(150),
    phone VARCHAR(20),
    email VARCHAR(100),
    hospital_address VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    registration_number VARCHAR(100),
    doctor_name VARCHAR(100),
    doctor_specialization VARCHAR(100),
    profile_photo VARCHAR(255) NULL,
    document_file VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
    patient_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT,
    gender VARCHAR(20),
    contact VARCHAR(15),
    address VARCHAR(255),
    email VARCHAR(255),
    disability_details TEXT,
    registration_date DATE,
    user_id INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- DOCTORS TABLE
CREATE TABLE IF NOT EXISTS doctors (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    contact VARCHAR(15),
    email VARCHAR(100),
    user_id INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- THERAPISTS TABLE
CREATE TABLE IF NOT EXISTS therapists (
    therapist_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    contact VARCHAR(15),
    user_id INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- EXERCISES TABLE (Shared catalog)
CREATE TABLE IF NOT EXISTS exercises (
    exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    exercise_name VARCHAR(100) NOT NULL,
    description TEXT,
    therapy_type VARCHAR(100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
    appointment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    doctor_id INT,
    appointment_date DATE,
    appointment_time TIME,
    status VARCHAR(30) DEFAULT 'Scheduled',
    user_id INT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- THERAPY SESSIONS TABLE
CREATE TABLE IF NOT EXISTS therapy_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    therapist_id INT,
    exercise_id INT,
    session_date DATE,
    duration_minutes INT,
    notes TEXT,
    user_id INT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id) ON DELETE CASCADE,
    FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- THERAPIST EXERCISE ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS therapist_exercise_assignments (
    assignment_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    therapist_id INT NOT NULL,
    exercise_id INT NOT NULL,
    difficulty ENUM('Easy','Medium','Hard') NOT NULL DEFAULT 'Medium',
    target_type ENUM('repetitions','duration') NOT NULL DEFAULT 'repetitions',
    target_value INT NOT NULL DEFAULT 10,
    frequency VARCHAR(50) NOT NULL DEFAULT 'Daily',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    status ENUM('Assigned','In Progress','Completed','Modified','Stopped') NOT NULL DEFAULT 'Assigned',
    user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignment_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_therapist FOREIGN KEY (therapist_id) REFERENCES therapists(therapist_id) ON DELETE CASCADE,
    CONSTRAINT fk_assignment_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_assignment_patient (patient_id),
    INDEX idx_assignment_therapist (therapist_id),
    INDEX idx_assignment_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- CAREGIVERS TABLE
CREATE TABLE IF NOT EXISTS caregivers (
    caregiver_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    caregiver_name VARCHAR(100),
    relationship VARCHAR(50),
    contact VARCHAR(15),
    emergency_contact VARCHAR(15),
    user_id INT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PROGRESS REPORTS TABLE
CREATE TABLE IF NOT EXISTS progress_reports (
    report_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT,
    report_date DATE,
    mobility_score INT,
    improvement_notes TEXT,
    user_id INT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
