# HireGrad – Campus Recruitment Portal

A role-based campus placement platform that streamlines the entire recruitment lifecycle for **students** and **placement officers (admins)** — job posting, applications, status tracking, student accounts, and real-time placement analytics.

https://hire-grad-application.vercel.app/
 
## Tech stack
- **Frontend:** Angular 20 + Tailwind CSS (standalone components, signals, zoneless)
- **Backend:** Spring Boot 3.5 (Java 21), Spring Security + JWT, layered Controller–Service–Repository
- **Database:** MySQL

## Features
### Student module
- **Dynamic home** dashboard with live profile-completion ring, application stats, eligible roles, recent applications and recommended jobs.
- **Job dashboard** — browse roles with auto eligibility checks (CGPA + skills), resume selection, and apply.
- **Application tracker** — view-only status board (Applied / Selected / Rejected) with instant search.
- **My profile** — full editable profile with completeness indicator.
- **Forced password change** on first login (admin-issued temp password).

### Admin (placement cell) module
- **Dynamic home** with KPIs, placement-rate ring, postings overview and recent activity.
- **Job posting** — publish openings (company, role, CTC, type, deadline, required skills, min CGPA).
- **Application management** — per-job applicant tables with inline status control, search/branch filters, live stats.
- **Student signup** — provision student logins (temp password + captcha), with a saved-credentials list.
- **Placement Report Analysis** — real-time analytics: placements by company / college / department, per-student offers & rejections, filters, company drilldown, and CSV/PDF export.

### Everywhere
- **Navigator Bot** — a floating, role-aware assistant that helps users jump to any feature.
- Emerald-themed, responsive UI with light/dark mode.

## Project structure
```
HireGradAppli/
├── frontend/   # Angular app
└── backend/    # Spring Boot API
```

## Running locally

### Prerequisites
- Node.js + npm, Java 21, MySQL running on `localhost:3306` (user `root` / password `root`).

### Backend (port 8082)
```bash
cd backend
# On a network behind an SSL-intercepting proxy, trust the OS cert store so Maven can fetch deps:
#   PowerShell:  $env:MAVEN_OPTS="-Djavax.net.ssl.trustStoreType=WINDOWS-ROOT"
./mvnw spring-boot:run
```
The database `hiregradappli` is auto-created. Seeded accounts:
- Admin: `admin` / `admin123`
- Student: `student` / `student123`

### Frontend (port 4301)
```bash
cd frontend
npm install
npm start
```
The dev server proxies `/api` to the backend on `:8082` (see `frontend/proxy.conf.json`).

## Testing
Interactive elements across the UI carry stable, prefixed `id` attributes (e.g. `#login-submit-btn`, `#jobs-search-input`, `#appmgmt-status-<id>`) to make end-to-end testing straightforward.

## API response shape
All endpoints return a standardized envelope:
```json
{ "success": true, "data": { }, "error": { "code": "", "message": "" } }
```
