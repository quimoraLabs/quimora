# 🚀 Quimora — Project Progress Tracker

> **Last Updated:** 2026-11-01  
> **Active Branch:** `v4`  
> **Milestone Status:** V4 Audit Remediation (Phases 1–5 Complete)  
> **Test Status:** 🟢 53/53 Backend Tests Passing (100%) | 🟢 Frontend Build Clean

---

## 📌 Executive Summary

Quimora is evolving through distinct, versioned milestones:
- **V1 (Shipped):** Core Auth, Quiz Management, Question Bank, Attempt Engine, Basic AI Question Generation.
- **V2 (Shipped):** Server-Validated Timed Quizzes, 15s Grace Buffer, Admin Management Suite, Redis Caching, Bulk CSV/JSON Import.
- **V3 (Shipped & Stable):** Interest-Driven Adaptive Engine, Elo Ratings ($K=32$), 6-Tier Level Progression, 1:1 Instructor Assignment & Consent Flow, Privacy-Preserving Analytics.
- **V3.5 (Shipped):** Header Profile Dropdown, Enriched Student Sidebar, HackerRank Progression, Live Weekly/Monthly Challenges.
- **V4 (Shipped & Hardened):** 4-Level Curriculum Hierarchy (Domain > Course > Chapter > Quiz), Weak-Area Remedial Drills vs Demo Mode, Comprehensive Security Audit & Mobile PWA Hardening.

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    V1 SHIPPED    │ ──► │    V2 SHIPPED    │ ──► │    V3 SHIPPED    │ ──► │   V3.5 SHIPPED   │ ──► │    V4 SHIPPED    │
│ Auth & Quizzes   │     │ Timed & Admin    │     │ Elo & Profiles   │     │ HackerRank & Nav │     │ Security & Audit │
│   ✅ 100% DONE   │     │   ✅ 100% DONE   │     │   ✅ 100% DONE   │     │   ✅ 100% DONE   │     │   ✅ 100% DONE   │
└──────────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘
```

---

## 🛡️ V4 Code Review & Audit Remediation (Phases 1–5)

### Phase 1: Critical Security & Core Logic Fixes (✅ Completed)
- [x] **B-01 (Exam Timer Discrepancy)**: Added `timeLimitSeconds` to `QuizAttempt` as the single source of truth stored at attempt creation; server enforces strict time limit with +15s grace buffer in `quizAttempt.service.js` and `studentQuiz.controllers.js`.
- [x] **B-02 (Rewards Role Authorization)**: Changed authorization guard in `rewards.routes.js` to `authorizeRoles("user")` across all student reward endpoints; added integration test coverage in `backend/tests/02_student_role.test.js`.
- [x] **B-03 (Data Exposure Lockdown)**: Added owner-or-admin checks on `GET /users/:userId`, enforced pagination limit capping on `GET /users`, filtered quiz queries for non-admins to `{ status: "published", isActive: true }`, and removed instructor emails from public populates.
- [x] **B-04 (Public Registration Lockdown)**: Forced `role: "user"` in public registration controller (`auth.controllers.js`), completely preventing self-elevation to instructor/admin.
- [x] **B-05 (Reverse Proxy & Rate Limiting)**: Configured `app.set("trust proxy", 1)` for Render/Vercel proxies and split OTP rate limiting into `requestOtpLimiter` (5 per 15m) and `verifyOtpLimiter` (10 per 15m).
- [x] **M-01 & M-03 (Mobile Proctoring & PWA Banner)**: Added Webkit/iOS fullscreen API fallbacks and a 2-second grace period for mobile system events in `useExamProctoring.js`; hid PWA install banner during active exams.
- [x] **D-01 & B-15 (DevOps & Environment Alignment)**: Corrected `Dockerfile` CMD to `backend/server.js`; updated `backend/.env.example` with `PORT=5001`, `API_PREFIX=/api/v2`, `GROQ_API_KEY`, and `REDIS_URI`.
- [x] **Domain Isolation**: Bound `GET /api/v2/hierarchy/domains` strictly to the student's enrolled/selected domains in `hierarchy.controllers.js` and `useHierarchyStore.js`.

### Phase 2: Concurrency, Injection Prevention & UX Hardening (✅ Completed)
- [x] **B-07 (Race Conditions - Double Submit & Double Spend)**:
  - Atomic attempt locking via `findOneAndUpdate({ _id, userId, status: "started" }, { $set: { status: "submitting" } })`.
  - Atomic coin deduction for direct pass and extra attempts via `{ userId, coinsBalance: { $gte: cost } }, { $inc: { coinsBalance: -cost } }`.
  - Atomic practice session completion locking.
- [x] **B-09 (NoSQL Operator Injection)**: Validated `typeof email === "string"` across login, OTP request, and password reset flows.
- [x] **B-11 (Profile Update Hardening)**: Restricted direct profile updates to `name`; routed username changes through 30-day throttled `updateUsername` method; blocked unauthorized `avatar.fileId` tampering.
- [x] **B-12 (Quiz Schedule Window)**: Enforced `startDate` and `endDate` in `checkQuizEligibility` and `startQuizAttempt`.
- [x] **B-13 (OTP & Password Validation)**: Enforced 6-character minimum for passwords on reset; prevented user enumeration.
- [x] **F-01, F-02, F-03 (Client State & Auth)**: Preserved auth token during network glitches/cold starts; cleared quiz attempt caches on logout; added `isSubmitting` guard to prevent double-submit spam.
- [x] **M-04, M-05, M-06, M-07 (Mobile & Touch Polish)**: Added `pb-safe`, `pt-safe`, and `min-h-dvh` utilities in `frontend/src/index.css`; wrapped button hover styles in `@media (hover: hover)`.
- [x] **D-03 (CI Workflow)**: Added `v4` to branch triggers in `.github/workflows/ci.yml`.

### Phase 3: Infrastructure, Cache & Query Hygiene (✅ Completed)
- [x] **B-22 (Redis Reconnection & Non-blocking Eviction)**: Added exponential backoff reconnection up to 10s in `backend/config/redis.js`; replaced blocking `keys()` with non-blocking `scanStream` pipeline in `delPattern`.
- [x] **B-23 (Server Routing Hygiene & Genuine Health Check)**: Removed recursive `/api/v2` router mounting and duplicate hierarchy mount; moved `/health` above rate limiters and added MongoDB connection readiness check.
- [x] **B-14 (Hierarchy Publishing Authorization)**: Restricted `POST /hierarchy/domains/ensure` to admin/instructor; enforced `{ status: "published", isActive: true }` in `getQuizzesByChapter` and `getCourseHierarchy` for students.
- [x] **B-10 (Practice Question Isolation)**: Filtered fallback practice questions strictly by `{ status: "published", isActive: true }` in `practiceEngine.service.js`.
- [x] **Frontend Code Splitting**: Configured Rollup `manualChunks` in `vite.config.js` to split `vendor-motion`, reducing main vendor chunk size below 500 kB.

### Phase 4: Modernization & Security Polish (✅ Completed)
- [x] **Mongoose 9 Deprecation Migration**: Replaced all remaining `{ new: true }` occurrences with `{ returnDocument: 'after' }` across services.
- [x] **D-02 (Docker Compose Security)**: Removed obsolete `version: '3.8'` key; replaced hardcoded `JWT_SECRET` with `${JWT_SECRET:-...}`; added missing environment variables (`GROQ_API_KEY`, `EMAIL_*`, `IMAGEKIT_*`).
- [x] **B-16 (Rewards Dead Code Cleanup)**: Removed dead ternary branch in `rewards.service.js`.
- [x] **D-08 (Root Directory Hygiene)**: Moved manual testing scripts into `backend/scripts/manual/`.

### Phase 5: Client Hygiene, Draft Integrity & Leaderboard (✅ Completed)
- [x] **F-04 (Proctoring Warning Refactor)**: Refactored `incrementWarning` in `useStudentQuizStore.js` to execute `submitAttempt(navigate)` cleanly outside the state updater function.
- [x] **F-06 (Axios CORS Preflight Cleanup)**: Removed global `Cache-Control`, `Pragma`, and `Expires` headers from `axiosClient.js` default config, eliminating unnecessary preflight OPTIONS requests on mobile devices; aligned default baseURL fallback to `/api/v2`.
- [x] **B-18 (Draft Save Integrity)**: Filtered draft answer payloads against `attempt.questionSnapshots` in `saveDraftSession` to prevent saving arbitrary question IDs.
- [x] **B-06 (Challenge Leaderboard Cast & Bounds)**: Enforced `mongoose.Types.ObjectId` casting on `challenge.quizId` and robust `completedAt` window filtering in `challenge.service.js`.

### Phase 6: PWA Polish, Streak Lifecycle & UI Trust Calibration (✅ Completed)
- [x] **B-19 (Practice Streak Auto-Reset & Calendar Lifecycle)**: Implemented `getYesterdayDateIST` and calendar boundary verification in `practiceProfile.model.js` and `practiceEngine.service.js`. Inactivity breaking streak resets to 0, continuous daily practice increments streak, and same-day sessions maintain streak.
- [x] **B-21 (Enterprise Error Handling)**: Gracefully intercepted `MulterError` and image format rejections with clean 400 Bad Request responses instead of 500 in `error.middleware.js`.
- [x] **F-07 (Service Worker Modernization)**: Versioned cache to `quimora-pwa-v4`; added development mode registration guard in `registerServiceWorker.js`; routed API requests directly to network to prevent synthetic 503 errors from masking network drops; guarded HTML cache writes with `response.ok`.
- [x] **F-09 (Navbar & Auth Sync)**: Connected global auth store fallback to `Navbar.jsx`; removed noisy render `console.log`; added `logout` handler to mobile drawer menu; added semantic image alt and link wrapper to brand logo.
- [x] **F-10 (QuizCard Trust UI Calibration)**: Replaced hardcoded "Easy" difficulty with dynamic prop; conditionally rendered verified instructor badge only when verified faculty is assigned.
- [x] **F-11 (Quiz History Accurate Pass Criteria)**: Replaced hardcoded `>= 50` check with server-evaluated `attempt.passed` and quiz-specific `passingScore` thresholding.

### Phase 7: Orphan Deletion Cascades, Mobile Modal Viewports & Test Coverage (✅ Completed)
- [x] **B-20 (User Deletion Cascade & Orphan Cleanup)**: Added cascade deletion across associated profiles (`StudentProfile`, `InstructorProfile`, `PracticeProfile`, `PracticeSession`, `EloRating`, `CoinTransaction`, `QuizAttempt`) upon user deletion in `user.controllers.js`; safely archived instructor quizzes rather than breaking student attempt history; guarded avatar deletion against external CDN failure.
- [x] **M-04 (Mobile Modal Scroll Containers)**: Added `overflow-y-auto` outer wrappers and `max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto` inner cards to `InstructorConsentModal.jsx`, `CreateUserModal.jsx`, and `ConfirmModal.jsx` to guarantee all interactive controls remain reachable in landscape and on small mobile screens.
- [x] **F-14 (OTP Autofill & Multi-Paste)**: Cleaned duplicate autocomplete attributes and handled multi-digit paste/SMS autofill distribution across input boxes in `VerifyOTP.jsx`.
- [x] **Integration Test Expansion (Quiz Window Test #13)**: Added test #13 in `02_student_role.test.js` validating that future-scheduled quizzes (`startDate` > now) reject eligibility (`isEligible: false`) and attempt starts with 400 Bad Request.

### Phase 8: Dynamic CORS Routing, Avatar Lifecycle & Shell Resilience (✅ Completed)
- [x] **B-24 (Dynamic CORS, Vary Header & Preflight Lockdown)**: Configured dynamic origin validation supporting `process.env.CLIENT_URL` and `*.vercel.app` preview environments with strict `Vary: Origin` header; blocked unapproved origins from receiving permissive access headers and rejected invalid preflight requests with 403 in `app.js`.
- [x] **B-26 (Avatar Update Transaction Ordering)**: Reversed avatar upload-and-delete order in `user.controllers.js` to ensure the new avatar image buffer is securely uploaded and stored before safely deleting the old file ID.
- [x] **F-12 (Header Escape Accessibility & Live Stats Refresh)**: Added `Escape` keyboard dismissal for profile and notification dropdowns in `Header.jsx`; bound window `focus` and `stats-updated` custom events to re-fetch student Coins/Elo badges; increased mobile hamburger tap target to 40px.
- [x] **F-13 (Theme Flash Elimination)**: Synced initial `.dark` class toggling alongside `data-theme` attribute in `main.jsx` to prevent light canvas flashing during dark-mode app boot.
- [x] **F-17 (Dashboard Shell Flicker Guard & dvh Viewports)**: Replaced `min-h-screen` with dynamic `min-h-dvh` in `DashboardLayout`; guarded dashboard layout mounting with immediate `isAuthenticated` check to prevent brief unauthenticated layout flashes.

### Phase 9: Elo Rating Integrity, Font Preconnect & History Pagination (✅ Completed)
- [x] **B-17 (Interest-Wise Elo Rating Initialization & Bounds Guard)**: Fixed interest-level Elo rating updates in `quizAttempt.service.js` to initialize from base 1000 rather than delta on first test; clamped ratings at lower bound `Math.max(0, ...)` to prevent negative ratings; accurate interest-wise highest rating tracking.
- [x] **B-25 (Student Attempt History Pagination)**: Added bounded `page` and `limit` (max 100) query handling in `getStudentAttemptHistory` to prevent unconstrained database queries on high-volume student accounts.
- [x] **F-15 (Font Preconnect & Performance)**: Added `<link rel="preconnect">` and direct stylesheet link in `index.html` while removing render-blocking `@import` from `index.css` to accelerate First Contentful Paint (FCP).
- [x] **M-05 (Mobile Viewport Notch Fit)**: Added `viewport-fit=cover` to meta viewport in `index.html` for native iOS PWA safe-area-inset alignment.

### Phase 10: Exam Keyboard Accessibility, Root Deploy Alignment & Policy Uniformity (✅ Completed)
- [x] **F-16 (Exam Option Card Keyboard Navigation & A11y)**: Added semantic `role="button"`, `tabIndex={0}`, and `Enter` / `Space` key handlers in `TakeExamPage.jsx` for fully accessible exam option selection.
- [x] **B-13 (Admin Password Policy Uniformity)**: Enforced strict 6+ character password minimum validation on `createUserByAdmin` in `auth.controllers.js`.
- [x] **D-09 (Vercel Output Alignment)**: Aligned root `vercel.json` outputDirectory to `frontend/dist` with SPA rewrite fallback rules for root deployment environments.

### Phase 11: Mobile Responsive Card Layouts, Dynamic Viewport Heights & Touch Target Hardening (✅ Completed)
- [x] **4.3 (Mobile Table-to-Card Responsive Layout)**: Implemented dual responsive views in `QuizHistoryPage.jsx` (`hidden md:block` table vs `md:hidden` stacked cards with score/accuracy/duration and quick view / full report PDF links) and `RecentAttemptsCard.jsx` (`hidden sm:block` table vs `sm:hidden` stacked cards with skeletons).
- [x] **M-06 (Mobile Dynamic Viewport Heights & Modal Limits)**: Migrated `max-h-[...vh]` to `max-h-[...dvh]` across `ModalWrapper`, `ConfirmModal`, `AiGeneratorBanner`, `AIGenerateModal`, `AttemptReviewModal`, `InterestOnboardingModal`, `QuizDetailsModal`, and `TakeExamPage` question palette. Switched mobile `Sidebar` height from `h-screen` to `h-dvh`.
- [x] **4.4 (Touch Targets & Modal A11y)**: Expanded tap targets to >= 40px on `Sidebar` close button, `ModalWrapper` close button, `ConfirmModal` close button, and `TakeExamPage` question palette buttons (`w-10 h-10 min-w-[40px] min-h-[40px]`). Added Escape key dismissal and `aria-label` to `ModalWrapper`.
- [x] **2.4 (Package Dependency Hygiene)**: Removed unused duplicate `react-router` dependency from `frontend/package.json` to prevent package version conflicts; moved `nodemon` from `dependencies` to `devDependencies` in `backend/package.json`.

### Phase 12: Mobile Exam Sticky Action Bar, Tap Target Hardening & Viewport Polishing (✅ Completed)
- [x] **4.5 (Mobile Exam Sticky Action Bar)**: Added a sticky bottom navigation bar with safe-area padding (`fixed bottom-0 left-0 right-0 z-20 sm:hidden bg-surface/95 backdrop-blur-md border-t border-main px-4 py-2.5 pb-safe`) to `TakeExamPage.jsx` featuring Previous, Next, Submit, and Question Palette indicator buttons, eliminating the need to scroll to the bottom of long questions on phones.
- [x] **4.4 (Modal Dismiss & Palette Tap Targets)**: Increased tap target dimensions to >= 36-40px across modal and banner close buttons (`PwaInstallBanner`, `CreateUserModal`, `AIGenerateModal`, `InstructorConsentModal`, `FirstTimePracticeModal`, `ResultModal`, and `TakeExamPage` question palette close button).
- [x] **M-06 & M-05 (Dynamic Viewport & Content Padding in Exam)**: Switched `TakeExamPage` root to `min-h-dvh` and added `pb-24 sm:pb-6` on the main exam container to guarantee content never gets obscured behind the mobile bottom bar.

### Phase 13: Rewards & Appeals Integrity, Exam Text A11y & Landscape Modal Protection (✅ Completed)
- [x] **B-16 (Rewards, Direct Pass & Appeals Integrity)**: Guarded `purchaseDirectPass` and `purchaseExtraPassAttempt` against non-existent or unpublished quizzes (`Quiz.findOne({ _id: quizId, status: "published", isActive: true })`) preventing coin deductions on invalid quizzes; enforced strict status validation (`approved` / `rejected`) and verified student coin balance on `reviewPassAppeal`; wrapped `recordAttemptRewards` in a non-blocking `try...catch` in `studentQuiz.controllers.js`.
- [x] **F-16 & 4.5 (Exam Text A11y & Modal Ergonomics)**: Added `select-text` on question text in `TakeExamPage.jsx` for assistive technology and selection; added global `Escape` key dismissal for Question Palette and Submit Confirmation modals.
- [x] **4.5 & M-04 (Landscape Mobile Modal Resilience)**: Clamped Question Palette grid to `max-h-[min(24rem,50dvh)]` and wrapped Submit Confirmation modal in `max-h-[calc(100dvh-2rem)] overflow-y-auto my-auto` to prevent clipping on 360px landscape phones.

---

## 🧪 Verified Test Suite Status

| Test Suite | Purpose | Status |
| :--- | :--- | :--- |
| `01_authentication.test.js` | Auth, JWT, OTP, Bcrypt, Role guards, NoSQL injection | 🟢 Verified (8/8) |
| `02_student_role.test.js` | Timed quizzes, quiz attempts, eligibility, schedule window, rewards | 🟢 Verified (13/13) |
| `03_instructor_role.test.js` | Quiz CRUD, AI generation, bulk import | 🟢 Verified (9/9) |
| `04_admin_role.test.js` | System metrics, user suspension, role elevation | 🟢 Verified (6/6) |
| `05_v3_adaptive_engine.test.js` | Elo rating math, level mapping, assignment consent | 🟢 Verified (9/9) |
| `06_v35_tracks_challenges.test.js` | Skill Tracks, Chapter Progression & Live Challenges | 🟢 Verified (4/4) |
| `07_practice_engine.test.js` | Decoupled Practice Engine & Daily Midnight Reset | 🟢 Verified (5/5) |

**Total:** 54 / 54 Tests Passing (100% Pass Rate across all 7 test suites)

---

## 🔮 Future Horizon (Post-V4)

- [ ] AI Video & Webcam Proctoring with tab-switch logging.
- [ ] Cross-Platform Mobile Application (React Native / Flutter).
- [ ] Enterprise Multi-Tenancy & Custom Organization Workspaces.
