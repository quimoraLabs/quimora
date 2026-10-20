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
- [ ] **Phase 1 Remaining Deliverables**:
  - [ ] Interest selection API endpoints (`/api/v2/interests`, `/api/v2/student/profile/interests`).
  - [ ] Student onboarding guard enforcement (`403 ONBOARDING_REQUIRED`).
  - [ ] Frontend Student Onboarding Modal (pick 5–6 initial interests, max 10).
  - [ ] Frontend Student Dashboard Interest Filter Bar.

---

## ⏳ V3 PHASE 2 & PHASE 3 (Pending Next)

- [ ] **Instructor Assignment & Consent Flow**:
  - Implement `QuizAssignment` model, pre-quiz consent modal, and consent check middleware.
- [ ] **Instructor Privacy-Preserving Analytics**:
  - Implement `scopeInstructorAnalytics` middleware returning detailed data for assigned quizzes and anonymized aggregate data for external quizzes.
- [ ] **Elo-Aware AI Question Generation**:
  - Extend Groq AI service to calibrate generated MCQs based on target student Elo ratings.
- [ ] **V3 Integration Test Suite**:
  - Create `backend/tests/05_v3_adaptive_engine.test.js` covering Elo, Level, Consent, and Privacy Scoping.

---

## 🔮 FUTURE SCOPE NOTE

> *Future is bright. Once V3 is reached, V4/V5 will be planned. For now, focus on V3.*
