# Quimora — Master Roadmap (Layer 4)

> **Document Type:** Layer 4 Unified Backlog & Single Source of Truth  
> **Replaces:** Embedded roadmaps in `README.md`, `V2-BACKLOG.md`, `V2-PLAN-FRESH.md`  
> **Last Updated:** 2026-09-15  

---

## 🟢 V1 Shipped Baseline (Completed & Stable)

- [x] **Authentication & Role Authorization**:
  - [x] Registration & Password hashing with Bcrypt.
  - [x] Login & JWT Token issuance with role guards (`user`/`student`, `instructor`, `admin`).
  - [x] Forgot Password flow via secure **6-Digit Email OTP** (Nodemailer, 10-min expiration).
- [x] **Core Database Models**:
  - [x] `User`, `Quiz`, `Question`, `QuizAttempt` Mongoose schemas wired & tested.
- [x] **Backend Integration Test Suite**:
  - [x] Automated test suites in `backend/tests/` (281 lines total) using Vitest (`npm run test`).
- [x] **Groq AI Integration**:
  - [x] AI Question generator (`/api/v1/instructor/ai/generate-questions`) powered by Groq SDK.
  - [x] AI Quiz Description generator (`/api/v1/instructor/ai/generate-description`).
- [x] **Instructor Suite & Analytics**:
  - [x] Bulk CSV & JSON Question Importer (`BulkImportModal.jsx` and `/bulk` endpoint).
  - [x] Student Submissions inspection & Leaderboard CSV export.
  - [x] Complete Student Roster & Analytics page (`/instructor/students`) with graphical charts (Recharts).

---

## 🟡 V2 Shipped Scope (Completed & Verified)

### P0 — Critical & Core Experience
- [x] **Automated Vitest Test Runner**: Wired in `backend/package.json` (`npm run test`).
- [x] **Server-Validated Timed Quiz Engine**:
  - [x] Backend session `startedAt` and duration calculation baseline (`createAttemptSession`).
  - [x] Exact server `remainingTimeSeconds` returned in session initialization payload.
  - [x] 15-second server grace buffer enforcement before marking session as `'abandoned'`.
  - [x] Student pre-quiz eligibility check endpoint (`GET /api/v1/student/quiz/:quizId/eligibility`).
  - [x] Automated Vitest coverage in `backend/tests/02_student_role.test.js`.

### P1 — Essential Enhancements
- [x] **Admin Control Suite**:
  - [x] System metrics summary endpoint & UI panel (total users, active quizzes, platform pass rates).
  - [x] User role elevation (`user` ↔ `instructor`) and account suspension toggle.
- [x] **Media & Image Uploads**:
  - [x] Question image attachments & User Avatar upload UI powered by ImageKit SDK.

### P2 — UX Polish
- [x] Mobile-responsive quiz taking interface optimization (`TakeExamPage.jsx` diagram rendering & responsive layout).
- [x] Dynamic dark/light theme consistency across instructor and student views.

---

## 🔵 V3 Planned Scope (Next Milestone)

- [ ] **Question Bank Library**: Tagged shared question pool reusable across multiple quizzes.
- [ ] **Adaptive Difficulty Engine**: Real-time adjustment of question difficulty based on student accuracy.
- [ ] **Automated Certificate Generation**: PDF completion certificates issued upon achieving passing score.

---

## 4. Long-Term Vision (V4)

- [ ] **AI Proctoring & Integrity Verification**: Tab-switch monitoring and webcam framing alerts.
- [ ] **Native Mobile Application**: Cross-platform iOS/Android app built with React Native.
- [ ] **Enterprise Multi-Tenancy**: Organization workspace isolation and custom branding.
