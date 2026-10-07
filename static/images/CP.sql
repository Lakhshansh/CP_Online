USE cerebral_palsy_db;
ALTER TABLE therapist_exercise_assignments
ADD COLUMN IF NOT EXISTS difficulty
ENUM('Easy','Medium','Hard')
NOT NULL DEFAULT 'Medium';

ALTER TABLE therapist_exercise_assignments
ADD COLUMN IF NOT EXISTS target_type
ENUM('repetitions','duration')
NOT NULL DEFAULT 'repetitions';

ALTER TABLE therapist_exercise_assignments
ADD COLUMN IF NOT EXISTS target_value
INT NOT NULL DEFAULT 10;

ALTER TABLE therapist_exercise_assignments
ADD COLUMN IF NOT EXISTS frequency
VARCHAR(50) NOT NULL DEFAULT 'Daily';

ALTER TABLE therapist_exercise_assignments
ADD COLUMN IF NOT EXISTS start_date
DATE NULL;

ALTER TABLE therapist_exercise_assignments
ADD COLUMN IF NOT EXISTS end_date
DATE NULL;

ALTER TABLE therapist_exercise_assignments
ADD COLUMN IF NOT EXISTS notes
TEXT NULL;

ALTER TABLE therapist_exercise_assignments
ADD COLUMN IF NOT EXISTS status
ENUM('Assigned','In Progress','Completed','Modified','Stopped')
NOT NULL DEFAULT 'Assigned';

ALTER TABLE therapist_exercise_assignments
ADD COLUMN IF NOT EXISTS user_id
INT NULL;

ALTER TABLE therapist_exercise_assignments
ADD COLUMN IF NOT EXISTS created_at
TIMESTAMP DEFAULT CURRENT_TIMESTAMP;





SELECT patient_id, name
FROM patients
WHERE user_id = 1;

SELECT therapist_id, name
FROM therapists
WHERE user_id = 1;


SELECT exercise_id, exercise_name
FROM exercises;



DESCRIBE therapist_exercise_assignments;