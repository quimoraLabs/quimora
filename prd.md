# 📋 Quimora — Product Requirements Document (PRD)

> **Document Version:** 3.0  
> **Status:** Active Reference  
> **Target Release:** V3 (Adaptive & Interest-Driven Engine)  
> **Production Baseline:** V2 Shipped & Stable  
> **Last Updated:** 2026-10-20  

---

## 1. Product Overview

### 1.1 Vision
**Quimora** is an end-to-end, high-performance Quiz & Assessment Management Platform tailored for educational institutions, independent instructors, and learners. It bridges the gap between passive multiple-choice testing and active adaptive skill measurement through real-time Elo rating progression, interest-driven discovery, server-validated timed sessions, Groq AI question authoring, and privacy-preserving analytics.

### 1.2 Core Value Proposition
- **For Students:** Self-directed learning path where quizzes match selected interest areas, difficulty dynamically adapts to student skill via real-time Elo calculation, and instructor credentials are fully transparent.
- **For Instructors:** Streamlined AI-assisted question generation, bulk CSV/JSON importing, strict 1:1 quiz ownership, granular student attempt telemetry, and benchmark analytics.
- **For Administrators:** High-level platform health surveillance, user role management, account suspension enforcement, and system uptime oversight.

---

## 2. Target Personas & User Journeys

| Persona | Goals | Pain Points Solved | Key Journey |
| :--- | :--- | :--- | :--- |
| **Student / Learner** | Find quizzes relevant to personal interests; receive fair, level-appropriate questions; see skill rank improve over time. | Avoids irrelevant generic tests; eliminates static difficulty walls; ensures exam integrity through timed sessions. | Choose Interests ➔ Browse Quizzes ➔ Consent to Instructor ➔ Complete Timed Attempt ➔ View Updated Elo Rating & Level Badge. |
| **Instructor** | Create high-quality assessments quickly; monitor student understanding with deep analytics. | Solves tedious manual question creation with Groq AI; provides clear ownership boundary and attempt telemetry. | Create Quiz ➔ Generate AI Questions ➔ Publish ➔ Review Submissions & Leaderboard ➔ Analyze Roster Performance. |
| **Administrator** | Protect system integrity; ensure fair platform use; monitor infrastructure metrics. | Eliminates manual DB edits for role promotion; instant audit and account suspension capabilities. | View Platform Metrics ➔ Audit User Accounts ➔ Elevate/Suspend Users ➔ Monitor Server Health. |

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
│     V3 CURRENT SPRINT TARGET    │  Interest Taxonomy, Elo Engine (K=32), Level Tiers, Consent Flow
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐
│         V4/V5 FUTURE            │  Webcam/AI Video Proctoring, React Native Mobile App, Multi-Tenancy
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

### 3.3 Active Target Scope (V3)
- **Interest Selection & Dynamic Catalog**:
  - Taxonomical interest tags (`Interest` model).
  - Student onboarding interest selection (min 5, max 10 interests).
  - Dynamic filtering of quiz feed matching student's active interests.
- **Elo-Based Adaptive Engine**:
  - Domain-specific Elo rating computed per student interest ($K = 32$).
  - Correct response elevates student Elo and lowers question difficulty; incorrect lowers student Elo and elevates question difficulty.
- **Level Tier Progression Matrix**:
  - Automated rank tier mapping from Elo scores:
    - **Beginner**: $0 - 1000$ Elo
    - **Learner**: $1000 - 1200$ Elo
    - **Intermediate**: $1200 - 1400$ Elo
    - **Advanced**: $1400 - 1600$ Elo
    - **Master**: $1600 - 1800$ Elo
    - **Expert**: $1800+$ Elo
- **1:1 Instructor Assignment & Mandatory Consent**:
  - Strict 1:1 mapping between Quiz and Instructor via `QuizAssignment`.
  - Pre-quiz modal displays instructor credentials, bio, and performance rating.
  - Explicit student consent recorded prior to test session creation.
- **Privacy-Preserving Analytics**:
  - Detailed telemetry accessible only to the assigned quiz instructor.
  - Anonymized aggregate benchmarks displayed for non-assigned instructor quizzes.
- **Elo-Aware Groq AI Question Generation**:
  - AI prompt calibrated with target student Elo level / difficulty tier.

---

## 4. Key Business Logic & Mathematical Formulas

### 4.1 Elo Rating Update Formula ($K = 32$)
The expected score $E_A$ and new rating $R_A'$ of a student against a question with rating $R_B$ are calculated as:

$$E_A = \frac{1}{1 + 10^{(R_B - R_A) / 400}}$$

$$R_A' = R_A + K \cdot (S_A - E_A)$$

- $S_A = 1$ for a correct answer; $S_A = 0$ for an incorrect answer.
- $K = 32$ for sensitive, responsive calibration.
- Initial student rating defaults to $1000$ (Beginner threshold).

### 4.2 Onboarding Guard Rule
- Any authenticated student who has selected $< 5$ interests receives `403 ONBOARDING_REQUIRED` upon attempting to start quizzes, forcing completion of the interest onboarding modal.

### 4.3 Protected Admin Role Rule
- Admin users cannot be suspended or deleted by other users or through standard user modification routes.

---

## 5. Non-Functional Requirements (NFRs)

- **Performance:** 
  - Standard API read endpoints: $\le 100\text{ms}$ response time (leveraging Redis 7 caching).
  - Attempt submission and Elo calculation: $\le 200\text{ms}$ response time.
- **Security & Integrity:**
  - Mandatory JWT token authentication on all protected routes.
  - Password hashing via Bcrypt (salt rounds $\ge 10$).
  - Strict CORS policy and rate limiting (100 requests per 15 minutes per IP).
  - Server-enforced exam timer preventing client-side timer manipulation.
- **Reliability & Data Consistency:**
  - Database transactions used for Elo score mutations and attempt submissions to prevent race conditions.
  - Graceful Redis connection failure with automatic fallback to MongoDB queries.

---

## 6. Definition of Done (DoD) & Release Criteria

1. **Schema & Model Validation:** All Mongoose schemas include strict validation rules and indexed query fields.
2. **Service Layer Isolation:** Business logic lives entirely inside `backend/services/` (controllers only handle HTTP parsing and response formatting).
3. **Automated Test Coverage:**
   - Auth & Role Guards (`01_authentication.test.js`) passing 100%.
   - Student & Exam Sessions (`02_student_role.test.js`) passing 100%.
   - Instructor Suite (`03_instructor_role.test.js`) passing 100%.
   - Admin Controls (`04_admin_role.test.js`) passing 100%.
   - V3 Adaptive Engine (`05_v3_adaptive_engine.test.js`) passing 100%.
4. **Documentation Compliance:** All 8 canonical layers in `docs/` (`PRODUCT_SPEC.md`, `ARCHITECTURE.md`, `API_REFERENCE.md`, `DATA_MODEL.md`, `MASTER_ROADMAP.md`, `DECISIONS.md`, `TEST_STRATEGY.md`, `AI_DELEGATION_GUIDE.md`) updated synchronously.
