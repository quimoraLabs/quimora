# 🧠 QUIMORA — AGENT & DEVELOPER STATE TRACKER

> **Document Type:** Active Progress & State Tracker  
> **Purpose:** Single source of truth for current implementation progress, active sprint tasks, and verified milestones.  
> **Milestone Status:** V4 Shipped & Hardened (Phases 1–13 Complete)  
> **Test Status:** 🟢 54/54 Backend Tests Passing (100%) | 🟢 Frontend Build Clean  
> **Last Updated:** 2026-11-02  

---

## 📌 Core Documentation Links

All technical specifications, schemas, business rules, and roadmaps are maintained in the standardized `docs/` folder:
- 📋 **Product Requirements**: [`prd.md`](file:///d:/quimora/prd.md)
- 🚀 **Live Sprint Progress**: [`progress.md`](file:///d:/quimora/progress.md)
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

### ✅ Shipped Baseline (V1 & V2 Completed & Verified)
- [x] **Authentication & Role Authorization**: Registration, Login, Bcrypt hashing, JWT sessions, 6-digit Email OTP reset.
- [x] **Core Database Models**: `User`, `Quiz`, `Question`, `QuizAttempt` models fully wired.
- [x] **Anti-Cheating Safeguards**: Fullscreen lock overlay, tab-switch tracking, copy-paste disabling.
- [x] **Server-Validated Timed Engine (V2 P0)**: Real-time duration validation, 15s grace buffer, student eligibility endpoint.
- [x] **Groq AI Integration**: AI question generator & description generator.
- [x] **Instructor Suite & Analytics**: Bulk CSV/JSON importer, Leaderboard export, Student Roster page.
- [x] **Admin Control Suite (V2 P1)**: System metrics panel, user role elevation, account suspension toggle.
- [x] **Docker & Redis Caching**: Redis 7 container service with DB fallback.

### ✅ V3 Shipped & Verified (Adaptive Engine — 100% Completed)
- [x] **V3 User Architecture & Profiles**: `StudentProfile` (max 10 interests), `InstructorProfile` (min 1 expertise), `EloRating` ($K=32$, `highestRating`, `isArchived`), `Level` (6 canonical tiers), `QuizAssignment`.
- [x] **V3 Seed & Migration Scripts**: `reset_v3_data.js`, `seed_admin.js`, `seed_v3_levels.js`, `seed_v3_interests.js`.
- [x] **V3 Service Layer**: `user.service.js`, `studentProfile.service.js`, `instructorProfile.service.js`, `eloEngine.service.js`, `levelMapping.service.js`.
- [x] **V3 Interest Discovery & Onboarding**: `/interests` catalog, `/onboarding`, onboarding guard middleware, modal & filter bar UI.
- [x] **V3 1:1 Quiz Assignment & Transparency**: `/assign`, `/assigned`, `/assigned-instructor`, `/consent`, and pre-quiz consent modal.
- [x] **V3 Elo-Aware Groq AI Question Generation**: Pedagogical prompt calibration for 6 skill tiers and student Elo rating.

### ✅ V3.5 Shipped & Verified (Navigation & HackerRank Architecture — 100% Completed)
- [x] **Header Avatar Dropdown (`Header.jsx`)**: Profile and Logout moved out of the Sidebar into a top-right User Avatar dropdown menu with live stats.
- [x] **Streamlined Sidebar (`Sidebar.jsx`)**: Enriched student navigation: Dashboard, Skill Tracks, Live Challenges, All Quizzes, Leaderboard, My Attempts.
- [x] **Quiz Card Faculty Badge (`QuizCard.jsx` & `QuizListPage.jsx`)**: Verified domain evaluator / faculty snippet on quiz cards.
- [x] **HackerRank Progression Architecture**: Sequential chapter challenge ladder, auto-unlocking on pass ($\ge 50\%$), and Domain Star ratings.
- [x] **Live Weekly/Monthly Challenges**: Time-bound contest window with countdown timer and leaderboard rankings.

### ✅ V4 Shipped & Hardened (Curriculum Hierarchy, Practice Engine & 13 Audit Phases)
- [x] **4-Level Curriculum Hierarchy**: `Domain` ➔ `Course` ➔ `Chapter` ➔ `Quiz` with enrolled domain isolation and on-the-fly curriculum generation.
- [x] **Remedial Practice Engine & Demo Mode**: Weak-area drills (<60% accuracy triggers), zero-stakes demo mode, and IST-calibrated streak calendar.
- [x] **Store & Coins Economy**: Performance coin rewards, Direct Pass and Extra Attempt allotments, and admin appeal workflows.
- [x] **Comprehensive Audit Remediation (Phases 1–13 Completed)**:
  - Phase 1: Timer single source of truth, rewards role authorization, public registration lock, proxy trust rate limiting.
  - Phase 2: Atomic attempt locking, atomic coin double-spend prevention, NoSQL injection sanitization, profile update 30-day throttle.
  - Phase 3: Redis reconnect backoff & non-blocking `scanStream`, DB health check, hierarchy domain authorization.
  - Phase 4: Mongoose 9 `{ returnDocument: 'after' }`, Docker Compose security, dead rewards code cleanup.
  - Phase 5: Proctoring warning side-effect refactoring, Axios CORS header cleanup, draft save integrity, leaderboard ObjectIds casting.
  - Phase 6: Practice streak IST calendar lifecycle, Multer 400 interception, PWA service worker v4, QuizCard trust UI calibration.
  - Phase 7: Comprehensive user deletion cascade, mobile modal dynamic viewport scroll (`calc(100dvh-2rem)`), OTP multi-paste.
  - Phase 8: Dynamic CORS with `Vary: Origin`, safe avatar upload ordering, dark-mode boot theme flash elimination, Header Escape dismissal.
  - Phase 9: Interest Elo base 1000 initialization & zero lower bound, attempt history pagination bounds, Google Fonts preconnect.
  - Phase 10: Exam option card keyboard navigation (`role="button"`, `tabIndex={0}`, `Enter`/`Space`), admin password policy uniformity, Vercel build output alignment.
  - Phase 11: Mobile table-to-card responsive layouts in `QuizHistoryPage.jsx` and `RecentAttemptsCard.jsx`, modal dynamic heights (`max-h-[...dvh]`), touch targets $\ge 40\text{px}$.
  - Phase 12: Mobile exam sticky action bar (`Prev`, `Next`, `Submit`, `Question Palette` quick pill with safe area padding), tap target calibration across all modal dismiss buttons.
  - Phase 13: Rewards coin burn prevention on non-existent/unpublished quizzes in `purchaseDirectPass` and `purchaseExtraPassAttempt`, strict appeal status validation and student balance verification, non-blocking `recordAttemptRewards` error guard, exam text accessibility (`select-text`), and landscape phone (360px) height protections.

---

## 🧪 Verified Test Suite Status

| Test Suite | Purpose | Status |
| :--- | :--- | :---: |
| `01_authentication.test.js` | Auth, JWT, OTP, Bcrypt, Role guards, NoSQL injection | 🟢 8/8 Passing |
| `02_student_role.test.js` | Timed quizzes, quiz attempts, eligibility, schedule window, rewards | 🟢 13/13 Passing |
| `03_instructor_role.test.js` | Quiz CRUD, AI generation, bulk import | 🟢 9/9 Passing |
| `04_admin_role.test.js` | System metrics, user suspension, role elevation | 🟢 6/6 Passing |
| `05_v3_adaptive_engine.test.js` | Elo rating math ($K=32$), level mapping, assignment consent | 🟢 9/9 Passing |
| `06_v35_tracks_challenges.test.js` | Skill Tracks, Chapter Progression & Live Challenges | 🟢 4/4 Passing |
| `07_practice_engine.test.js` | Decoupled Practice Engine & Daily Midnight Reset | 🟢 5/5 Passing |

**Total:** 54 / 54 Tests Passing (100% Pass Rate across all 7 test suites).

---

## 🔮 Future Horizon (Post-V4)

- [ ] AI Video & Webcam Proctoring with facial orientation & tab-switch telemetry.
- [ ] Dedicated Cross-Platform Native Mobile Application (React Native / Flutter).
- [ ] Enterprise Multi-Tenancy & Custom Organization Workspaces with custom domain whitelabeling.
