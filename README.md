# OmniScript Full Stack Setup

This workspace now contains:

- `frontend/` -> Next.js 14 (TypeScript)
- `backend/` -> FastAPI + SQLite + JWT auth
- Existing static prototype files remain in the root for reference.

## 1. Start Backend (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Health check:
- `http://127.0.0.1:8000/health`

## 2. Start Frontend (Next.js)

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Frontend URL:
- `http://localhost:3000`

## 3. Auth + Tools Flow

1. Open `/` (automatically redirects to `/login`)
2. Create account (signup)
3. Login
4. Go to `/dashboard`
5. Open the profile dropdown (top-right) to access:
	- AI Detector
	- Paraphraser
	- Humanizer
	- Profile (name/email update)
	- Security (OTP password change)

The frontend sends Bearer token requests to backend endpoints:

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/users/me`
- `PUT /api/v1/users/me`
- `POST /api/v1/users/password/request-otp`
- `POST /api/v1/users/password/verify-otp`
- `POST /api/v1/tools/detect`
- `POST /api/v1/tools/paraphrase`
- `POST /api/v1/tools/humanize`

## 4. OTP Notes

- In production, configure SMTP values in `backend/.env` to send real OTP emails.
- In local development, if SMTP is not configured and `DEV_RETURN_OTP=true`, the OTP is returned in API response for testing.

## 5. Where to Plug Real AI APIs

Replace tool logic inside:

- `backend/app/routers/tools.py`

Recommended upgrade:

1. Move each tool to a service module (`app/services/*`)
2. Call your LLM provider with API key from `.env`
3. Add quotas/rate-limits and async job queue for long generations

## 6. Production Next Steps

- Move token to HttpOnly secure cookie (instead of localStorage)
- Add refresh token flow
- Add Alembic migrations
- Use PostgreSQL in production
- Add request logging and usage analytics dashboard
