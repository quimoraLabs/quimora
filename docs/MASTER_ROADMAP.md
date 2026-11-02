# Quimora — Master Roadmap (Layer 4)

> **Document Type:** Layer 4 Unified Backlog & Single Source of Truth  
> **Milestone Status:** V4 Shipped & Hardened (Phases 1–13 Audit Remediation Complete)  
> **Last Updated:** 2026-11-02  

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
  - [x] Student pre-quiz eligibility check endpoint (`GET /api/v2/student/quiz/:quizId/eligibility`).
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
  - [x] 1-Click Quiz Clone / Duplication (`POST /api/v2/quizzes/:quizId/clone`).

---

## 🔵 V3 Shipped Scope (Interest-Driven Adaptive Engine — Completed & Stable)

- [x] **Interest Selection & Dynamic Quiz Filtering**: 5–6 initial selection during onboarding, max 10 profile interests.
- [x] **Elo-Based Adaptive Engine**: $K=32$ Elo calculation with dynamic score delta bonuses on pass and tier-proportional deductions on fail.
- [x] **6 Canonical Level Tiers**: Beginner (0–999), Learner (1000–1199), Intermediate (1200–1399), Advanced (1400–1599), Master (1600–1799), Expert (1800+).
- [x] **1:1 Quiz Assignment & Pre-Quiz Transparency**: Transparent instructor badge on examination pre-start with explicit consent flow.
- [x] **Elo-Aware Groq AI Question Generation**: Tier-calibrated MCQ generation.
- [x] **Automated Vitest Test Suite**: Integration test suite expanded (`05_v3_adaptive_engine.test.js`).

---

## 🟣 V3.5 Shipped Scope (Navigation & HackerRank Architecture — Completed & Stable)

- [x] **Header Avatar Dropdown**: Profile & Logout cleanly housed in modern avatar dropdown menu in `Header.jsx`.
- [x] **Streamlined Student Navigation**: Enriched student sidebar with *Dashboard, Skill Tracks, Live Challenges, All Quizzes, Leaderboard, My Attempts*.
- [x] **Quiz Card Faculty Badge**: Verified teacher/evaluator profile snippets rendered conditionally on `QuizCard.jsx`.
- [x] **HackerRank Progression Architecture**:
  - [x] Domain ➔ Chapter curriculum assessment ladder.
  - [x] Sequential progression: passing a quiz unlocks subsequent challenges.
  - [x] Domain Star ratings (1★ to 5★) awarded based on cumulative mastery.
  - [x] Live weekly/monthly challenge events with countdown clocks and leaderboards.

---

## 🔴 V4 Shipped Scope (Curriculum Hierarchy, Practice Engine & Audit Remediation — Completed & Hardened)

- [x] **4-Level Curriculum Hierarchy**:
  - [x] Structured learning tree: `Domain` ➔ `Course` ➔ `Chapter` ➔ `Quiz`.
  - [x] Enrolled domain isolation: student views strictly filtered to enrolled curriculum branches.
  - [x] Dynamic on-the-fly curriculum generation when student selects any interest topic.
- [x] **Remedial Practice Engine & Demo Mode**:
  - [x] Weak-area topic drills triggered automatically when accuracy drops below 60%.
  - [x] Zero-stakes Tutorial Demo Mode for risk-free skill testing.
  - [x] Daily practice streak calendar with IST boundary verification.
- [x] **Coins Economy & Store Rewards**:
  - [x] Performance-based coin rewards with 90%+ mastery and first-attempt pass bonuses.
  - [x] Direct Pass and Extra Attempt allotments with verified quiz existence and atomic coin balance checks.
  - [x] Structured admin appeal workflow for quizzes locked due to fail thresholds.
- [x] **Comprehensive Security Audit & Mobile PWA Hardening (13 Remediation Phases)**:
  - [x] **Phase 1**: Exam timer single source of truth, rewards role authorization fix, public registration locked to `user`, reverse proxy rate limiting, mobile proctoring grace buffer, Docker/env alignment.
  - [x] **Phase 2**: Atomic attempt locking, atomic coin double-spend prevention, NoSQL operator injection sanitization, profile update 30-day throttle, quiz schedule window validation.
  - [x] **Phase 3**: Redis reconnect exponential backoff & non-blocking `scanStream` eviction, database-aware health check, hierarchy domain authorization, vendor motion chunk splitting.
  - [x] **Phase 4**: Mongoose 9 `{ returnDocument: 'after' }` migration, Docker Compose environment hardening, dead rewards cleanup.
  - [x] **Phase 5**: Proctoring warning side-effect refactoring, Axios CORS preflight cleanup, draft save integrity, challenge leaderboard ObjectIds casting.
  - [x] **Phase 6**: Practice streak IST calendar lifecycle, Multer 400 error interception, modern service worker (`quimora-pwa-v4`), QuizCard trust UI calibration.
  - [x] **Phase 7**: Comprehensive user deletion cascade across profiles/attempts/gamification, mobile modal dynamic viewport scroll (`calc(100dvh-2rem)`), OTP multi-paste distribution.
  - [x] **Phase 8**: Dynamic CORS with `Vary: Origin` header, safe avatar upload ordering, dark-mode boot theme flash elimination, Header Escape dismissal.
  - [x] **Phase 9**: Per-interest Elo base 1000 initialization and zero lower bound guard, attempt history pagination query bounds, Google Fonts preconnect optimization.
  - [x] **Phase 10**: Exam option card keyboard navigation (`role="button"`, `tabIndex={0}`, `Enter`/`Space`), admin user password length uniformity, Vercel build directory alignment.
  - [x] **Phase 11**: Mobile table-to-card responsive layouts in `QuizHistoryPage.jsx` and `RecentAttemptsCard.jsx`, modal dynamic heights (`max-h-[...dvh]`), touch targets $\ge 40\text{px}$.
  - [x] **Phase 12**: Mobile exam sticky action bar (`Prev`, `Next`, `Submit`, `Question Palette` quick pill with safe area padding), tap target calibration across all modal dismiss buttons.
  - [x] **Phase 13**: Rewards coin burn prevention on non-existent or unpublished quizzes in `purchaseDirectPass` and `purchaseExtraPassAttempt`, strict appeal status validation (`approved`/`rejected`) and student balance verification, non-blocking `recordAttemptRewards` error guard, exam text accessibility (`select-text`), and landscape phone (360px) height protections.

---

## 🔮 Future Horizon (Post-V4)

- [ ] AI Video & Webcam Proctoring with facial orientation & tab-switch telemetry.
- [ ] Dedicated Cross-Platform Native Mobile Application (React Native / Flutter).
- [ ] Enterprise Multi-Tenancy & Custom Organization Workspaces with custom domain whitelabeling.
