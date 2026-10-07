import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import app

def run_migration():
    con = app.db()
    try:
        with con.cursor() as cur:
            tables = [
                'patients', 'doctors', 'therapists', 'appointments',
                'therapy_sessions', 'therapist_exercise_assignments',
                'progress_reports', 'caregivers'
            ]

            for t in tables:
                cur.execute('''
                    SELECT COUNT(*) AS c FROM information_schema.columns 
                    WHERE table_schema=%s AND table_name=%s AND column_name='user_id'
                ''', (app.DB['database'], t))
                res = cur.fetchone()
                if not res or not res['c']:
                    print(f'Adding user_id to {t}...')
                    cur.execute(f'ALTER TABLE {t} ADD COLUMN user_id INT NULL')
                    try:
                        cur.execute(f'ALTER TABLE {t} ADD CONSTRAINT fk_{t}_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE')
                    except Exception as e:
                        print(f'Constraint note for {t}:', e)
                    cur.execute(f'UPDATE {t} SET user_id=1 WHERE user_id IS NULL')
                else:
                    print(f'{t} already has user_id')

            # Re-map any appointments referencing duplicate doctors 4, 5, 6 to 1, 2, 3
            cur.execute('UPDATE appointments SET doctor_id=1 WHERE doctor_id=4')
            cur.execute('UPDATE appointments SET doctor_id=2 WHERE doctor_id=5')
            cur.execute('UPDATE appointments SET doctor_id=3 WHERE doctor_id=6')

            # Clean up duplicate doctors (4, 5, 6 duplicate 1, 2, 3) if they exist
            cur.execute('DELETE FROM doctors WHERE doctor_id IN (4, 5, 6)')

            # Re-map any references to duplicate patients 4, 5, 6 before deleting
            cur.execute('UPDATE appointments SET patient_id=1 WHERE patient_id=4')
            cur.execute('UPDATE appointments SET patient_id=2 WHERE patient_id=5')
            cur.execute('UPDATE appointments SET patient_id=3 WHERE patient_id=6')

            cur.execute('UPDATE therapy_sessions SET patient_id=1 WHERE patient_id=4')
            cur.execute('UPDATE therapy_sessions SET patient_id=2 WHERE patient_id=5')
            cur.execute('UPDATE therapy_sessions SET patient_id=3 WHERE patient_id=6')

            cur.execute('UPDATE therapist_exercise_assignments SET patient_id=1 WHERE patient_id=4')
            cur.execute('UPDATE therapist_exercise_assignments SET patient_id=2 WHERE patient_id=5')
            cur.execute('UPDATE therapist_exercise_assignments SET patient_id=3 WHERE patient_id=6')

            cur.execute('UPDATE caregivers SET patient_id=1 WHERE patient_id=4')
            cur.execute('UPDATE caregivers SET patient_id=2 WHERE patient_id=5')
            cur.execute('UPDATE caregivers SET patient_id=3 WHERE patient_id=6')

            cur.execute('UPDATE progress_reports SET patient_id=1 WHERE patient_id=4')
            cur.execute('UPDATE progress_reports SET patient_id=2 WHERE patient_id=5')
            cur.execute('UPDATE progress_reports SET patient_id=3 WHERE patient_id=6')

            cur.execute('DELETE FROM patients WHERE patient_id IN (4, 5, 6)')

            # Fix corrupted session_date '0000-00-00'
            cur.execute("UPDATE therapy_sessions SET session_date='2026-09-10' WHERE session_date='0000-00-00' OR session_date IS NULL")

            # Ensure all remaining records have user_id = 1 if user_id is null
            for t in tables:
                cur.execute(f'UPDATE {t} SET user_id=1 WHERE user_id IS NULL')

        print('Migration and cleanup completed successfully!')
    finally:
        con.close()

if __name__ == '__main__':
    run_migration()
