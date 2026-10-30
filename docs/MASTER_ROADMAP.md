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

## 🔵 V3 Shipped Scope (Interest-Driven Adaptive Engine — Completed & Stable)

### 🎯 V3 Objective (Achieved)
Built an **Interest-Driven Adaptive Assessment Engine** for Quimora that dynamically tailors quiz experiences to student skill levels via Elo ratings ($K=32$), maps skill progression to 6 canonical performance tiers, enforces explicit instructor assignments with student consent, and provides privacy-preserving analytics.

### 🌟 Shipped V3 Capabilities
- [x] **Interest Selection & Dynamic Quiz Filtering**: 5–6 initial selection during onboarding, max 10 profile interests.
- [x] **Elo-Based Adaptive Engine**: $K=32$ Elo calculation with dynamic score delta bonuses on pass and tier-proportional deductions on fail.
- [x] **6 Canonical Level Tiers**: Beginner (0–999), Learner (1000–1199), Intermediate (1200–1399), Advanced (1400–1599), Master (1600–1799), Expert (1800+).
- [x] **1:1 Quiz Assignment & Pre-Quiz Transparency**: Transparent instructor badge on examination pre-start with explicit consent flow.
- [x] **Elo-Aware Groq AI Question Generation**: Tier-calibrated MCQ generation.
- [x] **Automated Vitest Test Suite**: 43/43 tests passing across 5 test suites.

---

## 🟣 V3.5 Active Scope — Polish, Navigation & HackerRank Mission Architecture

### 🎯 V3.5 Objective
Polish the existing V3 system with modern navigation ergonomics (Header user dropdown, streamlined sidebar, quiz card faculty badges) and introduce the **HackerRank-Style Gamified Mission Architecture** (Domain Chapters, Sequential Unlocking, Domain Stars, and Live Weekly/Monthly Challenges).

### 🌟 Core V3.5 Deliverables

1. **Navigation & Header Polish**:
   - **Header Avatar Dropdown**: Move Profile & Logout out of the Sidebar into a modern avatar dropdown menu in `Header.jsx`.
   - **Streamlined Sidebar**: Remove awkward bottom profile & logout from `Sidebar.jsx`; enrich student navigation with *Dashboard, Skill Tracks, Live Challenges, All Quizzes, Leaderboard, My Attempts*.
   - **Quiz Card Faculty Badge**: Display verified teacher/evaluator profile snippet on `QuizCard.jsx` and `QuizListPage.jsx`.
   - **Mongoose 9 Deprecation Fixes**: Migrated `new: true` to `returnDocument: 'after'`.
   - **Dynamic Rank Warning**: Display penalty warning only when beginner attempts higher difficulty.
   - **Adaptive Dropdowns**: Auto-convert button groups to dropdowns when $\ge 4$ options.

2. **HackerRank Progression Architecture**:
   - **Domain ➔ Chapter Curriculum Tree**:
     - No lengthy lessons/videos needed. Pure chapter-wise assessment ladder (5–8 chapters per domain).
     - Average 5–6 progressive quizzes per chapter (Easy ➔ Medium ➔ Hard ➔ Boss Quiz), creating ~60–100 quizzes per domain.
   - **Sequential Progression & Auto-Unlocking**:
     - Passing a quiz ($\ge 50\%$) unlocks the next quiz/chapter.
     - Direct **"Solve Next Challenge"** button on the attempt result screen.
   - **Domain Star Ratings (1★ to 5★)**:
     - Gamified topic mastery badges displayed prominently on the student profile.
   - **Weekly Sprints & Monthly Grand Challenges**:
     - Time-bound contest window with live countdown timer.
     - Strict single attempt with active proctoring.
     - Dedicated event leaderboards with top-10 spotlights and trophy badges.
   - **Domain-Wise Auto-Created Faculty**:
     - Automatic domain evaluator assignment per topic track.
     - Future: Proctored Domain Certification Assessment with signed digital certificate.

---

## 🔮 Future Horizon (V4 / V5)

- [ ] AI Video & Webcam Proctoring with tab-switch logging.
- [ ] Cross-Platform Mobile Application (React Native).
- [ ] Enterprise Multi-Tenancy & Custom Organization Workspaces.

