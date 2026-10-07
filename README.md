# Cerebral Palsy Management System - Online Version

## Run locally
1. Install Python 3.11+.
2. Create the database using `database/schema.sql`, then run `database/seed.sql` if demo data is wanted.
3. Install dependencies: `pip install -r requirements.txt`
4. Set environment variables from `.env.example` (or edit your system environment).
5. Start: `python app.py`
6. Open `http://127.0.0.1:5000`

Demo login: `admin` / `admin123`

## Deploy
Use a Python/Flask-capable host and a managed MySQL database. Set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `SECRET_KEY` in the hosting environment. Do not use the demo password or blank production database password.
