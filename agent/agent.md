# 🧠 QUIMORA — AGENT & DEVELOPER STATE TRACKER

> **Document Type:** Active Progress & State Tracker  
> **Purpose:** Single source of truth for current implementation progress, active sprint tasks, and pending milestones.  
> **Last Updated:** 2026-09-28  

---

## 📌 Core Documentation Links

All technical specifications, schemas, business rules, and roadmaps are maintained in the standardized `docs/` folder:
- 📋 **Product Requirements**: [`prd.md`](file:///d:/quimora/prd.md)
- 🚀 **Live Progress**: [`progress.md`](file:///d:/quimora/progress.md)
- 🗺️ **Master Roadmap**: [`docs/MASTER_ROADMAP.md`](file:///d:/quimora/docs/MASTER_ROADMAP.md)
- 📐 **System Architecture**: [`docs/ARCHITECTURE.md`](file:///d:/quimora/docs/ARCHITECTURE.md)
- 🔌 **API Reference**: [`docs/API_REFERENCE.md`](file:///d:/quimora/docs/API_REFERENCE.md)
- 🗄️ **Data Models**: [`docs/DATA_MODEL.md`](file:///d:/quimora/docs/DATA_MODEL.md)
- ⚖️ **Business Decisions**: [`docs/DECISIONS.md`](file:///d:/quimora/docs/DECISIONS.md)
- 📋 **Product Spec**: [`docs/PRODUCT_SPEC.md`](file:///d:/quimora/docs/PRODUCT_SPEC.md)
- 🧪 **Test Strategy**: [`docs/TEST_STRATEGY.md`](file:///d:/quimora/docs/TEST_STRATEGY.md)
- 🤖 **AI Delegation SOP**: [`docs/AI_DELEGATION_GUIDE.md`](file:///d:/quimora/docs/AI_DELEGATION_GUIDE.md)
- 🗣️ **Language Rules**: [`.agents/rules/language_rules.md`](file:///d:/quimora/.agents/rules/language_rules.md) (Code in English only, chat in Hinglish)

---

## 📊 CURRENT CODEBASE STATUS & PROGRESS TRACKER

### ✅ Phase 0: Documentation Alignment & Cleanup (Completed)
- [x] **Single Source of Truth Roadmap**: Merged all roadmaps into `MASTER_ROADMAP.md`.
- [x] **Agent State Tracker**: Cleaned `agent/agent.md` to remove duplicate tech stack & directory trees.
- [x] **V3 Business Rules**: Defined exact mathematical Elo formula ($K=32$), 6 level thresholds, instructor 1:1 assignment, pre-quiz consent, and enrolled student privacy scoping in `DECISIONS.md`.
- [x] **V3 Data Models**: Designed Mongoose schemas (`Interest`, `EloRating`, `Level`, `InstructorProfile`, `QuizAssignment`) in `DATA_MODEL.md`.
- [x] **V3 Product Alignment**: Synchronized `PRODUCT_SPEC.md`, `API_REFERENCE.md`, `ARCHITECTURE.md`, `TEST_STRATEGY.md`, and `MASTER_ROADMAP.md`.
- [x] **Unwanted Docs Purged**: Deleted outdated plan backlogs and public bug reports.

### ✅ Shipped Baseline (V1 & V2 Completed & Verified)
- [x] **Authentication & Role Authorization**: Registration, Login, Bcrypt hashing, JWT sessions, 6-digit Email OTP reset.
- [x] **Core Database Models**: `User`, `Quiz`, `Question`, `QuizAttempt` models fully wired.
- [x] **Anti-Cheating Safeguards**: Fullscreen lock overlay, tab-switch tracking, copy-paste disabling.
- [x] **Server-Validated Timed Engine (V2 P0)**: Real-time duration validation, 15s grace buffer, student eligibility endpoint.
- [x] **Groq AI Integration**: AI question generator & description generator.
- [x] **Instructor Suite & Analytics**: Bulk CSV/JSON importer, Leaderboard export, Student Roster page.
- [x] **Admin Control Suite (V2 P1)**: System metrics panel, user role elevation, account suspension toggle.
- [x] **Docker & Redis Caching**: Redis 7 container service with DB fallback.
- [x] **Automated Test Suite**: Vitest integration suites across authentication, student, instructor, admin roles (30/30 passing).

---

## 🟡 V3 PHASE 1: USER ARCHITECTURE REFACTOR & ELO ENGINE (Active Sprint)

- [x] **V3 Documentation Alignment**:
  - Defined V3 Fresh Start policy, Protected Admin Role rule, and V3 User Architecture specifications in `DECISIONS.md`, `DATA_MODEL.md`, and `ARCHITECTURE.md`.
- [x] **V3 User & Role Profile Models**:
  - Updated `User` model (`backend/models/user.model.js`) with `suspendedAt`, `suspendedReason`, `lastLoginAt`, `lastUsernameChangedAt`.
  - Created `StudentProfile` model (`backend/models/studentProfile.model.js`) with max 10 interests validator.
  - Created `InstructorProfile` model (`backend/models/instructorProfile.model.js`) with min 1 expertise validator.
  - Created `EloRating` model (`backend/models/eloRating.model.js`) with `isArchived` flag and `highestRating`.
  - Created `Interest`, `Level`, and `QuizAssignment` models.
- [x] **V3 Seed & Data Reset Scripts**:
  - Implemented `backend/scripts/reset_v3_data.js` to wipe all V3 database collections cleanly.
  - Implemented `backend/scripts/seed_admin.js` to seed admin user via `ADMIN_PASSWORD` env var.
  - Implemented `backend/scripts/seed_v3_levels.js` to seed 6 level tiers (`bulkWrite` + `upsert`).
  - Implemented `backend/scripts/seed_v3_interests.js` to seed default interest topics (`bulkWrite` + `upsert`).
- [x] **V3 Service Layer Refactoring**:
  - Implemented `user.service.js` for auth/user lifecycle and account suspension.
  - Implemented `studentProfile.service.js` for interest selection (5-6 initial, max 10 cap) and counter tracking.
  - Implemented `instructorProfile.service.js` for bio/expertise management and dynamic count calculations.
  - Implemented `eloEngine.service.js` for Elo math ($K=32$), peak rating updates, and archiving.
  - Implemented `levelMapping.service.js` for Elo → Level tier mapping with Redis caching.
- [x] **Middleware Updates**:
  - Updated `auth.middleware.js` with account suspension check and active user status verification.
- [x] **Phase 1 Completed Deliverables**:
  - [x] Interest selection API endpoints (`/api/v2/interests`, `/api/v2/interests/student/onboarding`, `/api/v2/interests/student/interests`, `/api/v2/interests/student/profile`).
  - [x] Student onboarding guard enforcement (`checkStudentOnboarding` -> `403 ONBOARDING_REQUIRED`).
  - [x] Frontend Student Onboarding Modal (`InterestOnboardingModal.jsx` with 5–6 initial selection, max 10 cap).
  - [x] Frontend Student Dashboard & Quiz List Interest Filter Bar (`InterestFilterBar.jsx`).
  - [x] Automated test coverage: 32/32 tests passing; frontend build 100% verified.

### ✅ V3 Shipped & Verified (100% Completed)
- [x] **V3 Documentation Alignment**: `DECISIONS.md`, `DATA_MODEL.md`, `ARCHITECTURE.md`, `MASTER_ROADMAP.md` aligned.
- [x] **V3 User Architecture & Profiles**: `StudentProfile` (max 10 interests), `InstructorProfile` (min 1 expertise), `EloRating` ($K=32$, `highestRating`, `isArchived`), `Level` (6 canonical tiers), `QuizAssignment`.
- [x] **V3 Seed & Migration Scripts**: `reset_v3_data.js`, `seed_admin.js`, `seed_v3_levels.js`, `seed_v3_interests.js`.
- [x] **V3 Service Layer**: `user.service.js`, `studentProfile.service.js`, `instructorProfile.service.js`, `eloEngine.service.js`, `levelMapping.service.js`.
- [x] **V3 Interest Discovery & Onboarding**: `/interests` catalog, `/onboarding`, onboarding guard middleware, modal & filter bar UI.
- [x] **V3 1:1 Quiz Assignment & Transparency**: `/assign`, `/assigned`, `/assigned-instructor`, `/consent`, and pre-quiz consent modal.
- [x] **V3 Elo-Aware Groq AI Question Generation**: Pedagogical prompt calibration for 6 skill tiers and student Elo rating.
- [x] **V3 Automated Tests**: 43/43 tests passing across 5 test suites (`vitest run`).
- [x] **Mongoose 9 Migration**: Replaced deprecated `new: true` with `returnDocument: 'after'` across all services and seeders.

---

## 🟣 V3.5 ACTIVE SPRINT: POLISH & HACKERRANK MISSION ARCHITECTURE

### 1. Navigation Ergonomics & UI Polish (In Progress)
- [x] **Rank Warning Calibration**: Only displays when a beginner attempts an ahead/higher difficulty level.
- [x] **Adaptive Dropdowns**: Auto-converts $\ge 4$ option grids into clean custom dropdown menus.
- [ ] **Header User Avatar Dropdown (`Header.jsx`)**:
  - Move Profile and Logout out of the Sidebar into a top-right User Avatar dropdown.
  - Display user avatar, full name, username, role badge, Profile link, theme toggle, and Logout button.
- [ ] **Streamlined Sidebar (`Sidebar.jsx`)**:
  - Remove awkward bottom Profile & Logout buttons.
  - Enrich student navigation: Dashboard, Skill Tracks, Live Challenges, All Quizzes, Leaderboard, My Attempts.
- [ ] **Quiz Card Faculty Badge (`QuizCard.jsx` & `QuizListPage.jsx`)**:
  - Display verified domain evaluator / faculty snippet on quiz cards so students know who curated the quiz before starting.

### 2. HackerRank-Style Progression Architecture (Design Approved)
- [ ] **Domain ➔ Chapter Curriculum Tree**:
  - 5–8 logical Chapters per domain track (e.g. *Python ➔ Ch 1: Syntax, Ch 2: Data Structures, Ch 3: Functions, Ch 4: OOP, Ch 5: Error Handling*).
  - Average 5–6 progressive quizzes per chapter (~60–100 quizzes per domain track).
- [ ] **Sequential Progression & Auto-Unlocking**:
  - Passing a quiz ($\ge 50\%$) unlocks the next quiz/chapter.
  - Direct **"Solve Next Challenge"** CTA button on the attempt result screen.
- [ ] **Domain Star Badges (1★ to 5★)**:
  - Gamified topic mastery badges displayed prominently on the student profile.
- [ ] **Live Challenges Engine (Weekly Sprints & Monthly Cups)**:
  - Time-bound contest window with live countdown timer.
  - Strict single attempt with active proctoring.
  - Dedicated event leaderboards with top-10 spotlights and trophy badges.
- [ ] **Domain-Wise Auto-Created Faculty**:
  - Automatic domain evaluator assignment per topic track.
  - Future: Proctored Domain Certification Assessment with signed digital certificate.

---

## 🔮 FUTURE SCOPE NOTE

> *V1, V2, and V3 are shipped and stable. Active focus is on V3.5 Polish & HackerRank Theme Mission.*
