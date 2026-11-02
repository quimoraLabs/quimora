<p align="center">
  <img src="frontend/src/assets/quimora.png" alt="Quimora Platform Banner" width="440" />
</p>

<p align="center">
  <strong>Next-Generation Adaptive E-Learning, Curriculum Hierarchy & Examination Platform</strong>
</p>

<p align="center">
  <a href="https://quimora-rho.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Production%20Demo-quimora--rho.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/badge/Backend-Node.js%20v18%2B-339933?style=for-the-badge&logo=nodedotjs" alt="Node.js" />
  <img src="https://img.shields.io/badge/Framework-Express%20v5-000000?style=for-the-badge&logo=express" alt="Express 5" />
  <img src="https://img.shields.io/badge/Frontend-React%20v19-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Bundler-Vite%20v8-646CFF?style=for-the-badge&logo=vite" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Database-MongoDB%209-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB Mongoose 9" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20v4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Tests-Vitest%2054%2F54%20Passing-brightgreen?style=for-the-badge&logo=vitest" alt="Vitest Passing" />
</p>

> 🚀 **Live Production App:** [https://quimora-rho.vercel.app](https://quimora-rho.vercel.app)  
> 🔗 **Production Backend API:** [https://quimora.onrender.com/api/v2](https://quimora.onrender.com/api/v2)  
> 📋 **Product Requirements (PRD):** [`prd.md`](file:///d:/quimora/prd.md)  
> 📊 **Live Sprint Progress Tracker:** [`progress.md`](file:///d:/quimora/progress.md)

---

## 📌 Milestone Roadmap Overview

Quimora has evolved through 5 major production-grade milestones:

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    V1 SHIPPED    │ ──► │    V2 SHIPPED    │ ──► │    V3 SHIPPED    │ ──► │   V3.5 SHIPPED   │ ──► │    V4 SHIPPED    │
│ Auth & Quizzes   │     │ Timed & Admin    │     │ Elo & Profiles   │     │ HackerRank & Nav │     │ Security & Audit │
│   ✅ 100% DONE   │     │   ✅ 100% DONE   │     │   ✅ 100% DONE   │     │   ✅ 100% DONE   │     │   ✅ 100% DONE   │
└──────────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘     └──────────────────┘
```

- **V1 (Shipped):** Core Auth, Quiz Management, Question Bank, Attempt Engine, Groq AI Question Generation.
- **V2 (Shipped):** Server-Validated Timed Quizzes, 15s Grace Buffer, Admin Control Suite, Redis Caching, Bulk CSV/JSON Import.
- **V3 (Shipped):** Interest-Driven Adaptive Engine, Mathematical Elo Ratings ($K=32$), 6-Tier Level Progression, 1:1 Instructor Assignment & Consent Flow, Privacy-Preserving Analytics.
- **V3.5 (Shipped):** Header Profile Dropdown, Enriched Student Navigation, HackerRank-Style Chapter Progression, Live Weekly/Monthly Challenges.
- **V4 (Shipped & Hardened):** 4-Level Curriculum Hierarchy (`Domain` > `Course` > `Chapter` > `Quiz`), Remedial Practice Drills vs Demo Mode, Store & Coins Economy, Comprehensive Security Audit & Mobile PWA Hardening (13 Remediation Phases).

---

## 🔑 Demo Accounts (Quick Test)

You can instantly test the live application or local deployment using these pre-configured accounts:

| Role | Email | Password | Access & Features |
| :--- | :--- | :--- | :--- |
| **Student** | `student@test.com` | `password123` | Take timed exams, practice remedial drills, track Elo ratings, manage coins & store rewards |
| **Instructor** | `instructor@test.com` | `password123` | Author curriculum quizzes, Groq AI question generator, student roster telemetry & grading |
| **Admin** | `admin@test.com` | `password123` | High-level system metrics, user role elevation/suspension, appeal approvals & store audit |

---

## 🌟 Key Platform Capabilities

### 🔐 1. Authentication, Security & Anti-Abuse
- **Multi-Role RBAC**: Strict role enforcement (`user`, `instructor`, `admin`) via Express middleware guards.
- **Public Registration Lockdown**: Public signup is strictly locked to role `user`; elevation to `instructor` or `admin` requires administrative actions.
- **Brute Force & Proxy-Aware Rate Limiting**: Dedicated rate limiters for OTP requests, OTP verifications, and auth endpoints configured with `trust proxy`.
- **Atomic Operations & Double-Spend Prevention**: MongoDB atomic operations (`findOneAndUpdate` with `$inc`) prevent race conditions during quiz submissions and coin transactions.
- **Dynamic CORS & Origin Validation**: Dynamic whitelist supporting production domains and `*.vercel.app` preview environments with strict `Vary: Origin` headers.
- **Orphan Cascade Cleanup**: Robust deletion lifecycle clearing dependent profiles, attempts, Elo records, and coin histories when a user is removed.

### ⏱️ 2. Timed Examination Hall & Proctoring Engine
- **Server-Authoritative Timer**: Single source of truth stored in `QuizAttempt.timeLimitSeconds`; server enforces duration limits with a 15-second grace buffer.
- **Mobile Proctoring & System Event Resilience**: Webkit fullscreen fallbacks and mobile system notification grace buffer preventing premature auto-submits.
- **Sticky Mobile Exam Action Bar**: Bottom-anchored mobile controls with Prev, Next, Submit, and Question Palette indicator with safe-area notch padding (`pb-safe`).
- **Keyboard Navigation & A11y**: Full keyboard accessibility (`Enter`/`Space`) for option selection, `select-text` for assistive screen readers, and `Escape` key modal dismissals.

### 📚 3. 4-Level Curriculum Hierarchy & Dynamic Enrollment
- **Curriculum Tree**: Structured learning paths structured across **Domain** ➔ **Course** ➔ **Chapter** ➔ **Quiz**.
- **Domain Isolation**: Students are strictly scoped to their enrolled/selected domains, preventing content leakage across unrelated tracks.
- **Dynamic Topic Enrollment**: Instant curriculum synthesis allowing students to choose and enroll in any technical track on the fly.

### 📈 4. Interest-Driven Adaptive Engine & Elo System
- **Real-Time Elo Calibration**: Mathematical Elo calculation ($K=32$) dynamically adjusting student skill levels post-attempt.
- **6 Performance Tiers**: Dynamic mapping across *Beginner, Learner, Intermediate, Advanced, Master,* and *Expert*.
- **Interest-Level Scoping**: Per-interest Elo tracking initialized cleanly from baseline 1000 with lower bound protection (`Math.max(0, ...)`).

### 🛠️ 5. Adaptive Practice Engine & Remedial Drills
- **Weak-Area Drills**: Automatic topic mastery tracking triggering targeted practice sessions when accuracy falls below 60%.
- **Interactive Tutorial Demo Mode**: Zero-penalty practice mode allowing learners to test concepts before taking ranked examinations.
- **Daily Streak Lifecycle**: IST-calibrated calendar streak tracker rewarding consistent daily practice and auto-resetting upon missed days.

### 🪙 6. Rewards, Coin Economy & Appeals
- **Coin Earning Rules**: Performance-based coin rewards with 90%+ mastery and first-attempt pass bonuses.
- **Store Redemptions**: Direct Pass and Extra Attempt allotments with verified quiz existence and atomic coin balance checks.
- **Admin Appeals System**: Structured appeal workflow for quizzes locked due to fail thresholds, with verified balance checks for fee waivers.

### 📱 7. Progressive Web App (PWA) & Mobile UX
- **Offline Resilience & Cache Modernization**: Service worker (`quimora-pwa-v4`) routing API traffic directly to network and safeguarding app assets.
- **Responsive Table-to-Card Layouts**: Wide desktop tables automatically transform into touch-friendly stacked cards on mobile viewports.
- **Dynamic Viewports & Touch Standards**: Calibrated touch targets ($\ge 36\text{–}40\text{px}$) and `dvh` units preventing toolbar clipping on Chrome and Safari mobile.

---

## 👑 Role Permission Matrix

| Feature | Student (`user`) | Instructor | Admin |
| :--- | :---: | :---: | :---: |
| Browse & Enroll in Domains & Chapters | ✅ | ✅ | ✅ |
| Take Timed Exams & Practice Drills | ✅ | ❌ | ❌ |
| Earn Coins, Buy Direct Pass & Appeal | ✅ | ❌ | ❌ |
| View Personal Elo Tier & Weak Areas | ✅ | ❌ | ❌ |
| Author Quizzes & AI Question Generation | ❌ | ✅ | ✅ |
| Manage Curriculum Courses & Chapters | ❌ | ✅ | ✅ |
| Inspect Assigned Student Submissions | ❌ | ✅ (Owned) | ✅ |
| Elevate Roles & Toggle Account Suspension | ❌ | ❌ | ✅ |
| Platform System Metrics & Review Appeals | ❌ | ❌ | ✅ |

---

## 🛡️ V4 Code Review & Audit Remediation (Phases 1–13)

Between October and November 2026, Quimora underwent a comprehensive static code review and mobile responsive UI audit. All findings were systematically resolved across **13 dedicated phases**:

1. **Phase 1 (Critical Security & Core Logic):** Exam timer single source of truth (`timeLimitSeconds`), rewards role authorization fix, data exposure lockdown, reverse proxy trust & rate limit splitting, enrolled domain hierarchy isolation.
2. **Phase 2 (Concurrency, Injection & UX):** Atomic attempt locking (`status: "submitting"`), atomic double-spend prevention, NoSQL operator injection sanitization, profile update 30-day throttle, quiz schedule window validation.
3. **Phase 3 (Infrastructure & Non-blocking Cache):** Redis reconnect exponential backoff, non-blocking `scanStream` eviction, database-aware health check, hierarchy domain authorization.
4. **Phase 4 (Modernization & Security Polish):** Mongoose 9 `{ returnDocument: 'after' }` migration, Docker Compose environment hardening, dead rewards code cleanup.
5. **Phase 5 (Client State & Integrity):** Proctoring warning side-effect refactoring, Axios CORS header cleanup, quiz draft snapshot integrity, challenge leaderboard ObjectIds casting.
6. **Phase 6 (PWA Polish & Trust Calibration):** Practice streak IST calendar lifecycle, Multer 400 error interception, modern service worker (`quimora-pwa-v4`), QuizCard trust UI calibration.
7. **Phase 7 (Deletion Cascades & Scroll Ergonomics):** Comprehensive user deletion cascade across profiles/attempts, mobile modal dynamic viewport scroll (`calc(100dvh-2rem)`), OTP multi-paste distribution.
8. **Phase 8 (Dynamic CORS & Shell Resilience):** Dynamic CORS with `Vary: Origin` header, safe avatar upload ordering, dark-mode boot theme flash elimination, Header Escape dismissal.
9. **Phase 9 (Elo Calibration & Pagination):** Interest-wise Elo base 1000 initialization and zero lower bound guard, attempt history pagination bounds, Google Fonts preconnect optimization.
10. **Phase 10 (Exam A11y & Policy Uniformity):** Exam option card keyboard navigation (`role="button"`, `tabIndex={0}`, `Enter`/`Space`), admin user password length uniformity, Vercel build directory alignment.
11. **Phase 11 (Mobile Card Layouts & Viewports):** Dual responsive views in `QuizHistoryPage.jsx` and `RecentAttemptsCard.jsx` (tables on desktop, stacked cards on mobile), modal dynamic heights (`max-h-[...dvh]`), touch targets $\ge 40\text{px}$.
12. **Phase 12 (Mobile Exam Sticky Action Bar):** Sticky bottom exam navigation with Prev, Next, Submit, and Question Palette indicator; tap target calibration across all modal dismiss buttons.
13. **Phase 13 (Rewards & Appeals Integrity):** Guarded `purchaseDirectPass` and `purchaseExtraPassAttempt` against non-existent/unpublished quizzes, strict status validation and balance check on appeals, non-blocking `recordAttemptRewards` error guard, exam text accessibility (`select-text`), and landscape phone (360px) height protections.

---

## 🧪 Verified Test Suite Status

```bash
# Run backend test suite
npm --prefix backend run test
```

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

## 💻 Tech Stack

- **Backend:** Node.js (v18+ / v22), Express.js v5.2, Mongoose v9.5 (MongoDB), Redis 7 (ioredis v6), Bcrypt, JWT, Groq Cloud AI SDK, Nodemailer, ImageKit.
- **Frontend:** React 19, Vite v8, Tailwind CSS v4, Motion (Framer Motion v13), Zustand v5, React Router DOM v7, Lucide Icons, Recharts v3.
- **Testing & Tooling:** Vitest v5, Supertest, ESLint 10, Rolldown / Babel Compiler.
- **Deployment:** Vercel (Frontend SPA), Render (Backend Node API Container), MongoDB Atlas, Upstash / Redis Cloud.

---

## 📚 Documentation System

- 📋 **Product Requirements Document (PRD):** [`prd.md`](file:///d:/quimora/prd.md)
- 🚀 **Sprint Progress & Phase Tracker:** [`progress.md`](file:///d:/quimora/progress.md)
- 🗺️ **Master Roadmap:** [`docs/MASTER_ROADMAP.md`](file:///d:/quimora/docs/MASTER_ROADMAP.md)
- 📐 **System Architecture:** [`docs/ARCHITECTURE.md`](file:///d:/quimora/docs/ARCHITECTURE.md)
- 🔌 **API Reference (V2):** [`docs/API_REFERENCE.md`](file:///d:/quimora/docs/API_REFERENCE.md)
- 🗄️ **Data Models & Schemas:** [`docs/DATA_MODEL.md`](file:///d:/quimora/docs/DATA_MODEL.md)
- ⚖️ **Business Decisions & Algorithms:** [`docs/DECISIONS.md`](file:///d:/quimora/docs/DECISIONS.md)
- 🧪 **Test Strategy & Definition of Done:** [`docs/TEST_STRATEGY.md`](file:///d:/quimora/docs/TEST_STRATEGY.md)

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.
