# 🚀 Quimora — Project Progress Tracker

> **Last Updated:** 2026-10-20  
> **Active Branch:** `v3`  
> **Production Branch:** `main` (V2 Shipped & Stable)

---

## 📌 Executive Summary

Quimora is evolving through distinct, versioned milestones:
- **V1 (Shipped):** Core Auth, Quiz Management, Question Bank, Attempt Engine, Basic AI Question Generation.
- **V2 (Shipped):** Server-Validated Timed Quizzes, 15s Grace Buffer, Admin Management Suite, Redis Caching, Bulk CSV/JSON Import.
- **V3 (Shipped & Stable):** Interest-Driven Adaptive Engine, Elo Ratings ($K=32$), 6-Tier Level Progression, 1:1 Instructor Assignment & Consent Flow, Privacy-Preserving Analytics.
- **V3.5 (Active Sprint):** Polish, Navigation Upgrade (Header Profile Dropdown, Enriched Sidebar, Instructor Quiz Cards) & HackerRank-Style Chapter Progression & Weekly/Monthly Challenges Architecture.

```
┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
│       V1 SHIPPED        │ ───► │       V2 SHIPPED        │ ───► │       V3 SHIPPED        │ ───► │       V3.5 ACTIVE       │
│  Baseline Auth & Quizzes│      │  Timed Engine & Admin   │      │ Adaptive Elo & Profiles │      │ Polish & HackerRank Flow│
│       ✅ 100% DONE       │      │       ✅ 100% DONE       │      │       ✅ 100% DONE       │      │       🚧 IN PROGRESS     │
└─────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
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

### Phase 2: Level Badges & Instructor Assignment Flow (✅ 100% Complete)
- [x] **Frontend Tier Badges**:
  - [x] `LevelBadge.jsx` component supporting 6 tiers (Beginner, Learner, Intermediate, Advanced, Master, Expert) with dynamic Elo auto-mapping (`getTierFromElo`).
  - [x] Integrated into `StudentDashboardPage.jsx` alongside real-time Elo ratings.
- [x] **Level Thresholds API**:
  - [x] `GET /api/v2/levels` (Fetch all 6 canonical level tiers).
  - [x] `GET /api/v2/levels/current-tier?elo=:elo` (Real-time tier calculation and metadata).
- [x] **1:1 Quiz Assignment & Consent Engine**:
  - [x] `POST /api/v2/instructor/quizzes/:quizId/assign` (Assign quiz to certified instructor with role).
  - [x] `GET /api/v2/instructor/quizzes/assigned` (List instructor's assigned quizzes).
  - [x] `GET /api/v2/quizzes/:quizId/assigned-instructor` (Transparency endpoint returning verified instructor credentials, bio, and expertise).
  - [x] `POST /api/v2/student/quiz/:quizId/consent` (Student telemetry disclosure consent recording).
  - [x] `InstructorConsentModal.jsx` (Interactive pre-quiz student modal showing instructor profile and telemetry terms).
  - [x] Wired into `QuizInstructionsCard.jsx` before entering examination hall.
- [x] **Privacy-Preserving Analytics**:
  - [x] `instructorDashboard.controllers.js` updated to include both author and assigned quizzes in student roster analytics.

---

### Phase 3: Elo-Aware AI Question Generation & Vitest Suites (✅ 100% Complete)
- [x] **Elo-Aware Groq AI Generation**:
  - [x] Pedagogical prompt calibration for 6 skill tiers (Beginner to Expert) and arbitrary student Elo ratings in `backend/services/aiQuestion.service.js`.
  - [x] Controller parameter extraction (`targetTier`, `targetElo`) in `backend/controllers/aiQuestion.controllers.js`.
  - [x] Frontend skill tier selector with visual pills in `AIGenerateModal.jsx`.
  - [x] Question preview cards tagged with calibrated skill tier metadata.
- [x] **Automated Test Coverage**:
  - [x] `backend/tests/05_v3_adaptive_engine.test.js` created and passing (9 tests covering levels, real-time Elo tier mapping, 1:1 quiz assignment, pre-quiz transparency profile, telemetry consent, and AI generation calibration).

---

## 🟣 V3.5 Active Sprint — Polish & HackerRank Mission Architecture

### 1. Navigation & Header Polish (Active)
- [x] **Mongoose 9 Deprecation Fixes**: Migrated legacy `{ new: true }` to `{ returnDocument: 'after' }` across all backend models and services (43/43 tests passing).
- [x] **Rank Warning Calibration**: Red Elo penalty warning conditionally displays only when a beginner student attempts an ahead/higher tier difficulty.
- [x] **Adaptive Selection Dropdown**: Auto-converts cramped button grids to clean dropdown menus when options count $\ge 4$.
- [ ] **Header Profile Dropdown**:
  - [ ] Move Profile and Logout out of the Sidebar into a top-right User Avatar dropdown in `Header.jsx`.
  - [ ] Include user avatar, full name, username/role badge, Profile link, theme switcher, and red Logout action.
- [ ] **Enriched Student Sidebar**:
  - [ ] Remove awkward bottom profile & logout from `Sidebar.jsx`.
  - [ ] Add gamified navigation items: Dashboard, Skill Tracks, Live Challenges, All Quizzes, Leaderboard, My Attempts.
- [ ] **Quiz Card Instructor Showcase**:
  - [ ] Display verified domain instructor snippet (Avatar, Name, "Academic Certified" badge) directly on `QuizCard.jsx` and `QuizListPage.jsx` rows.

### 2. HackerRank-Style Progression Architecture (Design Approved)
- [ ] **Domain ➔ Chapter Curriculum Tree**:
  - [ ] Structure domains into 5–8 logical Chapters (e.g. *Python ➔ Ch 1: Syntax, Ch 2: Data Structures, Ch 3: Functions, Ch 4: OOP, Ch 5: Error Handling*).
  - [ ] Average 5–6 progressive quizzes per chapter (~60–100 quizzes per domain track).
- [ ] **Sequential Progression & Auto-Unlocking**:
  - [ ] Complete quiz with passing score ($\ge 50\%$) to unlock the next quiz / chapter.
  - [ ] One-click **"Solve Next Challenge"** CTA directly on the Quiz Result screen.
- [ ] **Domain Star Badges (1★ to 5★)**:
  - [ ] Gamified star ratings per skill displayed on Student Profile (e.g. *Python ★★★★☆*).
- [ ] **Live Challenges Engine (Weekly Sprints & Monthly Cups)**:
  - [ ] Time-bound contest window with real-time countdown timer.
  - [ ] Strict single-attempt proctored examination mode.
  - [ ] Event Leaderboard with top 10 spotlight rankings and exclusive trophy badges.
- [ ] **Domain-Wise Auto-Assigned Faculty**:
  - [ ] Automatic provisioning of verified academic faculty per interest domain.
  - [ ] Future extension: Proctored "Domain Skill Certification Assessment" issuing signed digital certificates.

---

## 🧪 Test Suite Status

| Test Suite | Purpose | Status |
| :--- | :--- | :--- |
| `01_authentication.test.js` | Auth, JWT, OTP, Bcrypt, Role guards | 🟢 Verified (8/8) |
| `02_student_role.test.js` | Timed quizzes, quiz attempts, eligibility | 🟢 Verified (9/9) |
| `03_instructor_role.test.js` | Quiz CRUD, AI generation, bulk import | 🟢 Verified (9/9) |
| `04_admin_role.test.js` | System metrics, user suspension, role elevation | 🟢 Verified (6/6) |
| `05_v3_adaptive_engine.test.js` | Elo rating math, level mapping, assignment consent | 🟢 Verified (9/9) |

**Total:** 41 / 41 Tests Passing (100% Pass Rate across 5 test suites)

---

## 🔮 Future Horizon (V4 / V5)

- [ ] AI Video & Webcam Proctoring with tab-switch logging.
- [ ] Cross-Platform Mobile Application (React Native).
- [ ] Enterprise Multi-Tenancy & Custom Organization Workspaces.
