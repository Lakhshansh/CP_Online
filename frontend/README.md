# CP Management System - Vercel Frontend

This is the first Vercel-ready frontend layer extracted from the existing Flask project.

## Important
- Do NOT upload the original `.env` file to Vercel or GitHub.
- Do NOT upload the local MariaDB/MySQL data directory.
- The frontend expects a separate Flask API backend.
- Update `API_BASE_URL` in `js/api.js` after the Flask backend is deployed.

## Current API placeholders
- POST /api/login
- POST /api/signup
- POST /api/logout
- GET /api/me

These API routes must exist on the Flask backend before production login/signup works.
