# 📋 Quimora — Product Requirements Document (PRD)

> **Document Version:** 4.0  
> **Status:** Active Reference & Production Baseline  
> **Target Release:** V4 Shipped & Hardened  
> **Production Baseline:** V4 (Phases 1–13 Audit Remediation Complete)  
> **Last Updated:** 2026-11-02  

---

## 1. Product Overview

### 1.1 Vision
**Quimora** is an end-to-end, high-performance Quiz & Assessment Management Platform tailored for educational institutions, independent instructors, and learners. It bridges the gap between passive multiple-choice testing and active adaptive skill measurement through real-time Elo rating progression, 4-level curriculum hierarchies, interest-driven discovery, remedial practice drills, server-validated timed sessions, Groq AI question authoring, and privacy-preserving analytics.

### 1.2 Core Value Proposition
- **For Students:** Self-directed learning path where quizzes match selected curriculum tracks, difficulty dynamically adapts to student skill via real-time Elo calculation, weak areas are reinforced through remedial drills, and exam controls are accessible on mobile and desktop.
- **For Instructors:** Streamlined AI-assisted question generation, bulk CSV/JSON importing, strict 1:1 quiz ownership, granular student attempt telemetry, and benchmark analytics.
- **For Administrators:** High-level platform health surveillance, user role management, account suspension enforcement, store rewards audit, and system uptime oversight.

---

## 2. Target Personas & User Journeys

| Persona | Goals | Pain Points Solved | Key Journey |
| :--- | :--- | :--- | :--- |
| **Student / Learner** | Find quizzes relevant to personal interests; receive fair, level-appropriate questions; see skill rank improve over time; practice weak areas. | Avoids irrelevant generic tests; eliminates static difficulty walls; ensures exam integrity through timed sessions. | Choose Interests ➔ Browse Curriculum Tree ➔ Consent to Instructor ➔ Complete Timed Attempt ➔ View Updated Elo Rating & Level Badge ➔ Practice Remedial Drills. |
| **Instructor** | Create high-quality assessments quickly; monitor student understanding with deep analytics. | Solves tedious manual question creation with Groq AI; provides clear ownership boundary and attempt telemetry. | Create Quiz ➔ Generate AI Questions ➔ Publish ➔ Review Submissions & Leaderboard ➔ Analyze Roster Performance. |
| **Administrator** | Protect system integrity; ensure fair platform use; monitor infrastructure metrics. | Eliminates manual DB edits for role promotion; instant audit and account suspension capabilities. | View Platform Metrics ➔ Audit User Accounts ➔ Elevate/Suspend Users ➔ Review Appeals ➔ Monitor Server Health. |

---

## 3. Product Scope by Release

```
┌─────────────────────────────────┐
│       V1 SHIPPED BASELINE       │  Core Auth, Models, Quiz Taking, Groq AI Question Generator
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│       V2 SHIPPED BASELINE       │  Server Timed Engine, 15s Grace Buffer, Admin Panel, Redis Cache
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│       V3 SHIPPED BASELINE       │  Interest Taxonomy, Elo Engine (K=32), Level Tiers, Consent Flow
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│      V3.5 SHIPPED BASELINE      │  Header Profile Dropdown, HackerRank Chapters & Challenges
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│       V4 SHIPPED & HARDENED     │  4-Level Hierarchy, Remedial Drills, Coins, 13-Phase Audit
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│         V5 FUTURE               │  AI Video & Webcam Proctoring, React Native Native App
└─────────────────────────────────┘
```

### 3.1 Shipped Baseline (V1)
- **Authentication**: Email/Password, Bcrypt password hashing, JWT stateless tokens, 6-digit email OTP password recovery.
- **Role System**: Student (`user`), Instructor (`instructor`), Admin (`admin`) with route middleware guards.
- **Quiz Engine**: Quiz authoring, question management, instant submission scoring, anti-cheating basic browser locks.
- **AI Integration**: Groq SDK for generating multiple-choice questions and auto-summarizing quiz descriptions.
- **Import/Export**: Bulk CSV and JSON question importer, CSV leaderboard export.

### 3.2 Shipped Baseline (V2)
- **Server-Validated Timed Attempt**:
  - Authoritative server timer calculating remaining time based on initial session `startedAt`.
  - 15-second grace buffer to handle network latency before auto-marking abandoned sessions.
  - Student pre-quiz eligibility verification endpoint.
- **Admin Control Suite**:
  - Dashboard for system metrics (total registered users, total quizzes, system pass rate).
  - User role promotion/demotion and one-click account suspension toggle.
- **Infrastructure & UX Polish**:
  - Redis 7 container integration with automatic database fallback caching.
  - ImageKit media integration for question illustrations and user avatars.
  - One-click quiz duplication / cloning endpoint.

### 3.3 Shipped Baseline (V3 & V3.5)
- **Interest Selection & Dynamic Catalog**:
  - Taxonomical interest tags (`Interest` model).
  - Student onboarding interest selection (min 5, max 10 interests).
  - Dynamic filtering of quiz feed matching student's active interests.
- **Elo-Based Adaptive Engine**:
  - Domain-specific Elo rating computed per student interest ($K = 32$).
  - Correct response elevates student Elo and lowers question difficulty; incorrect lowers student Elo and elevates question difficulty.
- **Level Tier Progression Matrix**:
  - Automated rank tier mapping from Elo scores across 6 tiers (Beginner to Expert).
- **HackerRank Progression Architecture**:
  - Sequential progression and auto-unlocking of subsequent chapter challenges upon passing.
  - Domain Star ratings (1★ to 5★) awarded based on cumulative mastery.
  - Live weekly/monthly challenge events with countdown clocks and leaderboards.

### 3.4 Shipped Scope (V4 - Hardened)
- **4-Level Curriculum Hierarchy**:
  - Strict hierarchical navigation: **Domain** ➔ **Course** ➔ **Chapter** ➔ **Quiz**.
  - Enrolled domain isolation: student views strictly locked to enrolled curriculum branches.
  - Dynamic on-the-fly curriculum generation when student selects any interest topic.
- **Remedial Practice Engine & Demo Mode**:
  - Weak-area topic drills triggered automatically when accuracy drops below 60%.
  - Zero-stakes Tutorial Demo Mode for risk-free skill testing.
  - Daily practice streak calendar with IST boundary verification.
- **Coins Economy & Store Rewards**:
  - Performance-based coin rewards with 90%+ mastery and first-attempt pass bonuses.
  - Direct Pass and Extra Attempt allotments with verified quiz existence and atomic coin balance checks.
  - Structured admin appeal workflow for quizzes locked due to fail thresholds.
- **Comprehensive Audit Remediation (Phases 1–13)**:
  - Single source of truth for timer (`timeLimitSeconds`), atomic attempt locks, NoSQL injection sanitization, profile update 30-day throttle, dynamic CORS with `Vary: Origin`, modern service worker (`quimora-pwa-v4`), sticky mobile exam action bar, and responsive table-to-card layouts.

---

## 4. Key Business Logic & Mathematical Formulas

### 4.1 Elo Rating Update Formula ($K = 32$)
The expected score $E_A$ and new rating $R_A'$ of a student against a question with rating $R_B$ are calculated as:

$$E_A = \frac{1}{1 + 10^{(R_B - R_A) / 400}}$$

$$R_A' = R_A + K \cdot (S_A - E_A)$$

- $S_A = 1$ for a correct answer; $S_A = 0$ for an incorrect answer.
- $K = 32$ for sensitive, responsive calibration.
- Initial student rating defaults to $1000$ (Beginner threshold), clamped with lower bound $\ge 0$.

### 4.2 Onboarding Guard Rule
- Any authenticated student who has selected $< 5$ interests receives `403 ONBOARDING_REQUIRED` upon attempting to start quizzes, forcing completion of the interest onboarding modal.

### 4.3 Protected Admin Role Rule
- Admin users cannot be suspended or deleted by other users or through standard user modification routes.

---

## 5. Non-Functional Requirements (NFRs)

- **Performance:** 
  - Standard API read endpoints: $\le 100\text{ms}$ response time (leveraging Redis 7 caching with non-blocking `scanStream` pipelines).
  - Attempt submission and Elo calculation: $\le 200\text{ms}$ response time.
- **Security & Integrity:**
  - Mandatory JWT token authentication on all protected routes.
  - Password hashing via Bcrypt (salt rounds $\ge 10$, min 6 characters).
  - Strict CORS policy supporting preview URLs with `Vary: Origin`.
  - Dedicated rate limiters for OTP requests (5 per 15m) and verifications (10 per 15m).
  - Server-enforced exam timer with +15s grace buffer.
- **Reliability & Data Consistency:**
  - Atomic MongoDB operations (`findOneAndUpdate` with `$inc`) used for attempt locks, coin deductions, and practice sessions to prevent double-spending and race conditions.
  - Graceful Redis connection exponential backoff with automatic fallback to MongoDB queries.

---

## 6. Definition of Done (DoD) & Release Criteria

1. **Schema & Model Validation:** All Mongoose schemas include strict validation rules, indexed query fields, and Mongoose 9 `{ returnDocument: 'after' }` compliance.
2. **Service Layer Isolation:** Business logic lives entirely inside `backend/services/` (controllers only handle HTTP parsing and response formatting).
3. **Automated Test Coverage (100% Pass Rate):**
   - Auth & Role Guards (`01_authentication.test.js`): 8/8 passing.
   - Student & Exam Sessions (`02_student_role.test.js`): 13/13 passing.
   - Instructor Suite (`03_instructor_role.test.js`): 9/9 passing.
   - Admin Controls (`04_admin_role.test.js`): 6/6 passing.
   - V3 Adaptive Engine (`05_v3_adaptive_engine.test.js`): 9/9 passing.
   - Skill Tracks & Challenges (`06_v35_tracks_challenges.test.js`): 4/4 passing.
   - Practice Engine & Midnight Reset (`07_practice_engine.test.js`): 5/5 passing.
   - **Total:** 54/54 Tests Passing.
4. **Documentation Compliance:** `README.md`, `prd.md`, `progress.md`, and all 8 canonical layers in `docs/` updated synchronously.
