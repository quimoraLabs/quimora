# Quimora — Master Roadmap (Layer 4)

> **Document Type:** Layer 4 Unified Backlog & Single Source of Truth  
> **Replaces:** Embedded roadmaps in `README.md` and outdated backlog files  
> **Last Updated:** 2026-09-28  

---

## 🟢 V1 Shipped Baseline (Completed & Stable)

- [x] **Authentication & Role Authorization**:
  - [x] Registration & Password hashing with Bcrypt.
  - [x] Login & JWT Token issuance with role guards (`user`/`student`, `instructor`, `admin`).
  - [x] Forgot Password flow via secure **6-Digit Email OTP** (Nodemailer, 10-min expiration).
- [x] **Core Database Models**:
  - [x] `User`, `Quiz`, `Question`, `QuizAttempt` Mongoose schemas wired & tested.
- [x] **Backend Integration Test Suite**:
  - [x] Automated test suites in `backend/tests/` using Vitest (`npm run test`).
- [x] **Groq AI Integration**:
  - [x] AI Question generator (`/api/v1/instructor/ai/generate-questions`) powered by Groq SDK.
  - [x] AI Quiz Description generator (`/api/v1/instructor/ai/generate-description`).
- [x] **Instructor Suite & Analytics**:
  - [x] Bulk CSV & JSON Question Importer (`BulkImportModal.jsx` and `/bulk` endpoint).
  - [x] Student Submissions inspection & Leaderboard CSV export.
  - [x] Complete Student Roster & Analytics page (`/instructor/students`) with graphical charts (Recharts).

---

## 🟡 V2 Shipped Scope (Completed & Verified)

- [x] **Automated Vitest Test Runner**: Wired in `backend/package.json` (`npm run test`).
- [x] **Server-Validated Timed Quiz Engine**:
  - [x] Backend session `startedAt` and duration calculation baseline (`createAttemptSession`).
  - [x] Exact server `remainingTimeSeconds` returned in session initialization payload.
  - [x] 15-second server grace buffer enforcement before marking session as `'abandoned'`.
  - [x] Student pre-quiz eligibility check endpoint (`GET /api/v1/student/quiz/:quizId/eligibility`).
  - [x] Automated Vitest coverage in `backend/tests/02_student_role.test.js`.
- [x] **Admin Control Suite**:
  - [x] System metrics summary endpoint & UI panel (total users, active quizzes, platform pass rates).
  - [x] User role elevation (`user` ↔ `instructor`) and account suspension toggle.
- [x] **Media & Image Uploads**:
  - [x] Question image attachments & User Avatar upload UI powered by ImageKit SDK.
- [x] **Docker & Redis In-Memory Caching**:
  - [x] Redis 7 container service in `docker-compose.yml` + `ioredis` backend integration (`redis.js`) with automatic DB fallback.
- [x] **UX Polish**:
  - [x] Mobile-responsive quiz taking interface optimization (`TakeExamPage.jsx`).
  - [x] Dynamic dark/light theme consistency across instructor and student views.
  - [x] 1-Click Quiz Clone / Duplication (`POST /api/v1/quizzes/:quizId/clone`).

---

## 🔵 V3 Planned Scope (Interest-Driven Adaptive Engine — Current Target)

- [ ] **Interest Selection & Quiz Filtering**: Student selects interest topic tags to discover and filter relevant quizzes without forced enrollment.
- [ ] **Elo Rating Engine**: Real-time Elo scoring formula adjusting student rating and question difficulty based on accuracy.
- [ ] **Level Mapping System**: Tiered levels (Beginner, Learner, Intermediate, Advanced, Master, Expert) computed dynamically from Elo ratings.
- [ ] **Instructor Assignment & Consent**: Explicit 1:1 instructor assignment per quiz; student consent flow showing instructor profile prior to quiz start.
- [ ] **Privacy-Preserving Instructor Analytics**: Instructor views granular data for assigned students, and anonymized aggregate data for external students.
- [ ] **Elo-Aware AI Question Generation**: Groq AI engine generates questions calibrated to student Elo rating levels.

---

## 🔮 Future Scope (V4/V5)

> *Future is bright. Once V3 is reached, V4/V5 will be planned. For now, focus on V3.*
