-- =========================================================
-- MULTI THERAPY MANAGEMENT SYSTEM - SEED DATA
-- Default exercises, sample admin, and initial demo records
-- =========================================================

-- DEFAULT ADMIN USER (password: admin123)
INSERT INTO users 
(username, password, role, hospital_name, phone, email, doctor_name, doctor_specialization)
VALUES
('admin', 'scrypt:32768:8:1$yXGfq01FmH7nJdC5$1f78e4745db4eb775a6c4b26090e71cceeb6cf490f2bda406085a81665679aa2f2320be4ca24cfc3b3815e985869085ec3ef9eb368cb1a0212a44b9ce70fbe7c', 'Admin', 'Multi Therapy Care Hospital', '9876543210', 'admin@example.com', 'Dr. Chief Administrator', 'Neurologist')
ON DUPLICATE KEY UPDATE role='Admin';

-- DEFAULT THERAPY EXERCISES
INSERT INTO exercises (exercise_id, exercise_name, description, therapy_type) VALUES
(1, 'Stretching Exercise', 'Basic stretching exercises for flexibility and muscle elongation', 'Physical Therapy'),
(2, 'Balance Training', 'Core and balance exercises to improve overall stability and posture', 'Physical Therapy'),
(3, 'Hand Movement Exercise', 'Fine motor exercises to improve dexterity, grasp, and hand movement', 'Occupational Therapy'),
(4, 'Speech Practice', 'Vocalization and pronunciation practice exercises for speech clarity', 'Speech Therapy'),
(5, 'Gait Training', 'Walking and movement assistance exercises for mobility', 'Physical Therapy'),
(6, 'Sensory Integration', 'Sensory stimulation activities for sensory regulation', 'Occupational Therapy')
ON DUPLICATE KEY UPDATE exercise_name=VALUES(exercise_name);

-- SAMPLE PATIENTS FOR USER 1
INSERT INTO patients 
(patient_id, name, age, gender, contact, address, disability_details, registration_date, user_id)
VALUES
(1, 'Aarav Sharma', 12, 'Male', '9876543210', 'Jaipur', 'Cerebral Palsy - Spastic Diplegia', '2026-09-02', 1),
(2, 'Ananya Verma', 10, 'Female', '9876543211', 'Jaipur', 'Cerebral Palsy - Hemiplegia', '2026-09-02', 1),
(3, 'Rohan Singh', 15, 'Male', '9876543212', 'Delhi', 'Cerebral Palsy - Ataxic', '2026-09-02', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- SAMPLE DOCTORS FOR USER 1
INSERT INTO doctors
(doctor_id, name, specialization, contact, email, user_id)
VALUES
(1, 'Dr. Rajesh Kumar', 'Neurology', '9876500001', 'rajesh@gmail.com', 1),
(2, 'Dr. Priya Sharma', 'Physiotherapy', '9876500002', 'priya@gmail.com', 1),
(3, 'Dr. Amit Singh', 'Pediatrics', '9876500003', 'amit@gmail.com', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- SAMPLE THERAPISTS FOR USER 1
INSERT INTO therapists
(therapist_id, name, specialization, contact, user_id)
VALUES
(1, 'Rahul Mehta', 'Physical Therapy', '9876500011', 1),
(2, 'Sneha Gupta', 'Occupational Therapy', '9876500012', 1),
(3, 'Vikram Joshi', 'Speech Therapy', '9876500013', 1)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- SAMPLE APPOINTMENTS FOR USER 1
INSERT INTO appointments
(appointment_id, patient_id, doctor_id, appointment_date, appointment_time, status, user_id)
VALUES
(1, 1, 1, '2026-09-25', '10:00:00', 'Scheduled', 1),
(2, 2, 2, '2026-09-26', '11:30:00', 'Scheduled', 1),
(3, 3, 3, '2026-09-27', '14:00:00', 'Completed', 1)
ON DUPLICATE KEY UPDATE status=VALUES(status);

-- SAMPLE THERAPY SESSIONS FOR USER 1
INSERT INTO therapy_sessions
(session_id, patient_id, therapist_id, exercise_id, session_date, duration_minutes, notes, user_id)
VALUES
(1, 1, 1, 1, '2026-09-20', 30, 'Regular physical therapy session for lower limb flexibility', 1),
(2, 2, 2, 3, '2026-09-21', 45, 'Hand movement and grip practice session', 1),
(3, 3, 3, 4, '2026-09-22', 30, 'Speech articulation and voice control session', 1)
ON DUPLICATE KEY UPDATE duration_minutes=VALUES(duration_minutes);

-- SAMPLE CAREGIVERS FOR USER 1
INSERT INTO caregivers
(caregiver_id, patient_id, caregiver_name, relationship, contact, emergency_contact, user_id)
VALUES
(1, 1, 'Sunita Sharma', 'Mother', '9876510001', '9876510001', 1),
(2, 2, 'Rajesh Verma', 'Father', '9876510002', '9876510002', 1),
(3, 3, 'Meena Singh', 'Mother', '9876510003', '9876510003', 1)
ON DUPLICATE KEY UPDATE caregiver_name=VALUES(caregiver_name);

-- SAMPLE PROGRESS REPORTS FOR USER 1
INSERT INTO progress_reports
(report_id, patient_id, report_date, mobility_score, improvement_notes, user_id)
VALUES
(1, 1, '2026-09-20', 70, 'Improvement observed in balance and movement during physical sessions', 1),
(2, 2, '2026-09-20', 65, 'Improvement observed in bilateral hand movement and object grasping', 1),
(3, 3, '2026-09-20', 60, 'Patient shows improved posture and responsive speech', 1)
ON DUPLICATE KEY UPDATE mobility_score=VALUES(mobility_score);