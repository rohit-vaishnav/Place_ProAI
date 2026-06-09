# PlacePro AI — Campus Placement Platform

Full-stack campus placement management system with role-based portals (Student, Recruiter, Placement Officer, Admin) and AI-assisted features (resume analyzer, career chatbot, mock interviews).

## Architecture

```
├── backend/          # Express + MongoDB REST API
└── frontend/         # React + Vite UI (design locked — logic integrated with API)
```

## Prerequisites

- Node.js 18+
- MongoDB 6+ (local or Atlas)

## Quick Start

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed          # Populate demo accounts & data
npm run dev           # API at http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev           # UI at http://localhost:3000 (proxies /api → backend)
```

## Demo Accounts

All seeded accounts use password: **`password123`**

| Role | Email |
|------|-------|
| Student (Verified) | aarav.sharma@collegetech.edu |
| Student (Pending) | aditi.iyer@collegetech.edu |
| Recruiter | recruitment@google.com |
| Placement Officer | placement.officer@collegetech.edu |
| Admin | admin.root@collegetech.edu |

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `GEMINI_API_KEY` | Optional — enables live AI; falls back to simulation |
| `CORS_ORIGIN` | Frontend origin (default `http://localhost:3000`) |
| `OFFICER_SIGNUP_PASSCODE` | Placement officer registration key |
| `ADMIN_SIGNUP_PASSCODE` | Admin registration key |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_PROXY_TARGET` | Backend URL for dev proxy (default `http://localhost:5000`) |
| `VITE_API_BASE_URL` | API base for production builds (default `/api`) |

## API Overview

| Module | Base Path |
|--------|-----------|
| Auth | `/api/auth` |
| Students | `/api/students` |
| Jobs | `/api/jobs` |
| Applications | `/api/applications` |
| Drives | `/api/drives` |
| Mock Interviews | `/api/mock-interviews` |
| AI (Gemini) | `/api/gemini/*` |
| Admin | `/api/admin` |
| Analytics | `/api/analytics` |

## Production Build

```bash
# Backend
cd backend && npm start

# Frontend
cd frontend && npm run build && npm start
```

Deploy backend and frontend separately. Set `VITE_API_BASE_URL` to your production API URL or serve both behind a reverse proxy with `/api` routed to the backend.

## Notes

- Recruiter applicant review uses **manual sorting** (resume score, interview score, CGPA) — no AI auto-hiring.
- Jobs must be **Approved** by placement officers before students can apply.
- Students must be **Verified** before applying to jobs.
"# Place_ProAI" 
