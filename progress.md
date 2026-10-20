# 🚀 Quimora — Project Progress Tracker

> **Last Updated:** 2026-10-20  
> **Active Branch:** `v3`  
> **Production Branch:** `main` (V2 Shipped & Stable)

---

## 📌 Executive Summary

Quimora is evolving through distinct, versioned milestones:
- **V1 (Shipped):** Core Auth, Quiz Management, Question Bank, Attempt Engine, Basic AI Question Generation.
- **V2 (Shipped):** Server-Validated Timed Quizzes, 15s Grace Buffer, Admin Management Suite, Redis Caching, Bulk CSV/JSON Import.
- **V3 (In Progress):** Interest-Driven Adaptive Engine, Elo Ratings ($K=32$), 6-Tier Level Progression, 1:1 Instructor Assignment & Consent Flow, Privacy-Preserving Analytics.

```
┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│       V1 SHIPPED        │ ───► │       V2 SHIPPED        │ ───► │       V3 IN PROGRESS    │
│  Baseline Auth & Quizzes│      │  Timed Engine & Admin   │      │ Adaptive Elo & Profiles │
│       ✅ 100% DONE       │      │       ✅ 100% DONE       │      │      🟡 ~25% DONE       │
└─────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

---

## 🟢 Shipped Baseline (V1 & V2)

### V1 — Core Platform
- [x] **Authentication & Role Authorization**:
  - [x] Email/Password registration with Bcrypt hashing.
  - [x] JWT sessions with role middleware (`user`/`student`, `instructor`, `admin`).
  - [x] 6-digit email OTP forgot password flow (10-minute expiration).
- [x] **Quiz & Question Authoring**:
  - [x] Quiz creation, publish/unpublish, tag assignment, questions linking.
  - [x] Groq AI Question & Quiz Description generation.
- [x] **Attempt & Scoring Engine**:
  - [x] Submission handling, automatic grading, instant score results.
  - [x] Anti-cheating client safeguards (fullscreen overlay, tab switch detection, copy-paste block).
- [x] **Instructor Suite**:
  - [x] Bulk CSV and JSON importer with client-side validation.
  - [x] Student submissions inspection and CSV leaderboard export.

### V2 — Server Timed Engine & Admin Suite
- [x] **Server-Validated Timed Attempt**:
  - [x] Backend session `startedAt` duration calculation (`createAttemptSession`).
  - [x] Exact server `remainingTimeSeconds` returned in session initialization payload.
  - [x] 15-second server grace buffer before marking session as `'abandoned'`.
  - [x] Student pre-quiz eligibility check endpoint (`GET /api/v1/student/quiz/:quizId/eligibility`).
- [x] **Admin Suite**:
  - [x] System overview metrics endpoint & dashboard (total users, active quizzes, platform pass rates).
  - [x] Role promotion (`user` ↔ `instructor`) and account deactivation/suspension.
- [x] **Caching & Assets**:
  - [x] Redis 7 docker service + fallback in-memory caching.
  - [x] ImageKit image upload integration for question media and user avatars.
- [x] **UX & Operations**:
  - [x] 1-click quiz cloning (`POST /api/v1/quizzes/:quizId/clone`).
  - [x] Vitest test suites configured in `backend/package.json` (`npm run test`).

---

## 🟡 V3 Active Work Tracker (Adaptive & Interest-Driven Engine)

### Phase 1: Foundation, User Architecture & Elo Engine (✅ 100% Complete)
- [x] **V3 Documentation Alignment**:
  - [x] Defined V3 Fresh Start policy, Protected Admin Role rule, and V3 User Architecture specifications in `DECISIONS.md`, `DATA_MODEL.md`, `ARCHITECTURE.md`, and `MASTER_ROADMAP.md`.
- [x] **V3 Schemas & Models**:
  - [x] `backend/models/user.model.js` (Added `suspendedAt`, `suspendedReason`, `lastLoginAt`, `lastUsernameChangedAt`).
  - [x] `backend/models/studentProfile.model.js` (Student profile with max 10 interests validator).
  - [x] `backend/models/instructorProfile.model.js` (Instructor profile with min 1 expertise validator).
  - [x] `backend/models/eloRating.model.js` (Rating tracking with `highestRating` and `isArchived`).
  - [x] `backend/models/interest.model.js` (Interest topics taxonomy).
  - [x] `backend/models/level.model.js` (6-tier level thresholds).
  - [x] `backend/models/quizAssignment.model.js` (1:1 Quiz to Instructor assignment schema).
- [x] **V3 Seed & Migration Scripts**:
  - [x] `backend/scripts/reset_v3_data.js` (Clean database collection reset).
  - [x] `backend/scripts/seed_admin.js` (Seed default administrator).
  - [x] `backend/scripts/seed_v3_levels.js` (Seed 6 Elo rating tiers).
  - [x] `backend/scripts/seed_v3_interests.js` (Seed default interest tags).
- [x] **V3 Service Layer**:
  - [x] `backend/services/user.service.js` (User lifecycle, authentication, suspension handling).
  - [x] `backend/services/studentProfile.service.js` (Interest selection, limits, counter updates).
  - [x] `backend/services/instructorProfile.service.js` (Instructor bio, expertise, assigned quiz counters).
  - [x] `backend/services/eloEngine.service.js` (Mathematical Elo rating calculation, $K=32$).
  - [x] `backend/services/levelMapping.service.js` (Elo score to tier mapping with Redis cache).
- [x] **V3 Interest & Onboarding APIs**:
  - [x] `GET /api/v2/interests` (Public interest topic catalog).
  - [x] `GET /api/v2/interests/student/profile` (Student profile with active Elo ratings).
  - [x] `POST /api/v2/interests/student/onboarding` (Onboarding validation: 5-6 interests).
  - [x] `PUT /api/v2/interests/student/interests` (Post-onboarding updates: max 10 interests).
  - [x] Student onboarding guard in middleware (`checkStudentOnboarding` -> `403 ONBOARDING_REQUIRED`).
- [x] **Frontend Onboarding & Discovery UI**:
  - [x] `InterestOnboardingModal.jsx` (Interactive modal with 5-6 topic selection, live pill counter, Framer Motion animations).
  - [x] `InterestFilterBar.jsx` (Horizontal pill filter bar on `QuizListPage.jsx` and `StudentDashboardPage.jsx`).
  - [x] Adaptive Elo Skill Tiers display card on student dashboard.

---

### Phase 2: Level Badges & Instructor Assignment Flow (Pending)
- [ ] **Frontend Tier Badges**:
  - [ ] Visual badge indicators for Beginner, Learner, Intermediate, Advanced, Master, Expert tiers.
  - [ ] Student Profile Elo progression chart.
- [ ] **Quiz Assignment & Consent**:
  - [ ] Instructor Quiz Assignment management UI.
  - [ ] Pre-Quiz Student Consent Modal showing instructor bio, rating, and verified credentials.
  - [ ] Pre-Quiz Consent API endpoint (`POST /api/v1/student/quiz/:quizId/consent`).
- [ ] **Privacy-Preserving Analytics Middleware**:
  - [ ] Granular analytics for assigned quiz students.
  - [ ] Anonymized aggregate analytics for external student attempts.

---

### Phase 3: Elo-Aware AI Question Generation & Vitest Suites (Pending)
- [ ] **Elo-Aware Groq AI Generation**:
  - [ ] Pass student Elo level or target difficulty band to AI question generator prompt.
  - [ ] Generate questions calibrated to target student capability bands.
- [ ] **Automated Test Coverage**:
  - [ ] `backend/tests/05_v3_adaptive_engine.test.js` covering Elo score changes, level transitions, and consent enforcement.

---

## 🧪 Test Suite Status

| Test Suite | Purpose | Status |
| :--- | :--- | :--- |
| `01_authentication.test.js` | Auth, JWT, OTP, Bcrypt, Role guards | 🟢 Verified |
| `02_student_role.test.js` | Timed quizzes, quiz attempts, eligibility | 🟢 Verified |
| `03_instructor_role.test.js` | Quiz CRUD, AI generation, bulk import | 🟢 Verified |
| `04_admin_role.test.js` | System metrics, user suspension, role elevation | 🟢 Verified |
| `05_v3_adaptive_engine.test.js` | Elo rating math, level mapping, assignment consent | 🟡 Planned for Phase 3 |

---

## 🔮 Future Horizon (V4 / V5)

- [ ] AI Video & Webcam Proctoring with tab-switch logging.
- [ ] Cross-Platform Mobile Application (React Native).
- [ ] Enterprise Multi-Tenancy & Custom Organization Workspaces.
