# 🧠 QUIMORA — AGENT & DEVELOPER STATE TRACKER

> **Document Type:** Active Progress & State Tracker  
> **Purpose:** Single source of truth for current implementation progress, active sprint tasks, and pending milestones.  
> **Last Updated:** 2026-09-28  

---

## 📌 Core Documentation Links

All technical specifications, schemas, business rules, and roadmaps are maintained in the standardized `docs/` folder:
- 🗺️ **Master Roadmap**: [`docs/MASTER_ROADMAP.md`](file:///d:/quimora/docs/MASTER_ROADMAP.md)
- 🚀 **V3 Execution Plan**: [`docs/V3_PLAN.md`](file:///d:/quimora/docs/V3_PLAN.md)
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
- [x] **V3 Product Alignment**: Synchronized `PRODUCT_SPEC.md`, `API_REFERENCE.md`, `ARCHITECTURE.md`, `TEST_STRATEGY.md`, and `V3_PLAN.md`.
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
- [x] **Automated Test Suite**: Vitest integration suites across authentication, student, instructor, admin roles.

---

## 🟡 V3 PHASE 1: USER ARCHITECTURE REFACTOR & ELO ENGINE (Active Sprint)

- [x] **V3 Documentation Alignment**:
  - Defined V3 Fresh Start policy, Protected Admin Role rule, and V3 User Architecture specifications in `DECISIONS.md`, `DATA_MODEL.md`, and `ARCHITECTURE.md`.
- [ ] **V3 User & Role Profile Models**:
  - Update `User` model (`backend/models/user.model.js`) with `suspendedAt`, `suspendedReason`, `lastLoginAt`, `lastUsernameChangedAt`.
  - Create `StudentProfile` model (`backend/models/studentProfile.model.js`) with max 10 interests validator.
  - Create `InstructorProfile` model (`backend/models/instructorProfile.model.js`) with min 1 expertise validator.
  - Create `EloRating` model (`backend/models/eloRating.model.js`) with `isArchived` flag and `highestRating`.
- [ ] **V3 Seed & Data Reset Scripts**:
  - Implement `backend/scripts/reset_v3_data.js` to wipe all V3 database collections cleanly.
  - Implement `backend/scripts/seed_admin.js` to seed admin user via `ADMIN_PASSWORD` env var.
  - Implement `backend/scripts/seed_v3_levels.js` to seed 6 level tiers (`bulkWrite` + `upsert`).
  - Implement `backend/scripts/seed_v3_interests.js` to seed 8 default interest topics (`bulkWrite` + `upsert`).
- [ ] **V3 Service Layer Refactoring**:
  - Implement `user.service.js` for auth/user lifecycle and account suspension.
  - Implement `studentProfile.service.js` for interest selection (5-6 initial, max 10 cap) and counter tracking.
  - Implement `instructorProfile.service.js` for bio/expertise management and dynamic count calculations.
  - Implement `eloEngine.service.js` for Elo math ($K=32$), peak rating updates, and archiving.
  - Implement `levelMapping.service.js` for Elo → Level tier mapping with Redis caching.
- [ ] **Middleware Updates**:
  - Update `auth.middleware.js` to enforce suspension checks (`suspendedAt`) and student onboarding guard (`403 ONBOARDING_REQUIRED`).

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
