# Quimora — System Architecture (Layer 1)

> **Document Type:** Layer 1 Architecture Specification  
> **Source:** Extracted & refined from `agent/agent.md`  
> **Last Updated:** 2026-09-28  

---

## 1. High-Level System Architecture

Quimora follows a **decoupled monorepo design** with an Express.js REST API backend and a Vite-powered React single-page application (SPA) frontend.

```
+-------------------------------------------------------+
|                   CLIENT BROWSER                      |
|                 React 19 + Vite 8                     |
|                Zustand + Tailwind 4                   |
+---------------------------+---------------------------+
                            |
                            | HTTP / REST APIs (JSON)
                            v
+-------------------------------------------------------+
|                  EXPRESS 5.x SERVER                   |
|                  Node.js ES Modules                   |
+-------+-------------------+-------------------+-------+
        |                   |                   |
        v                   v                   v
+---------------+   +---------------+   +---------------+
| MONGODB + ODM |   | REDIS 7 DOCKER|   | GROQ AI ENGINE|
| Primary DB    |   | Cache Layer   |   | Llama 3 LLM   |
+---------------+   +---------------+   +---------------+
```

---

## 2. V3 Architecture & Service Module Ecosystem

```
+-------------------------------------------------------+
|                  V3 API ROUTE LAYER                   |
+---------------------------+---------------------------+
                            |
        +-------------------+-------------------+
        |                   |                   |
        v                   v                   v
+---------------+   +---------------+   +---------------+
|EloEngineServ  |   |InterestService|   |LevelMapService|
|Math Elo (K=32)|   |Topic Tagging  |   |Tier Badges    |
+-------+-------+   +-------+-------+   +-------+-------+
        |                   |                   |
        +-------------------+-------------------+
                            |
                            v
+-------------------------------------------------------+
|               InstructorConsent & Scope               |
|              Middleware (Privacy Guard)               |
+-------------------------------------------------------+
```

### Backend Micro-Services (V3 Core)
* **`user.service.js`**: Manages core account lifecycle, registration, suspension (`suspendedAt`, `suspendedReason`), and activity tracking (`lastLoginAt`, `lastUsernameChangedAt`).
* **`studentProfile.service.js`**: Manages student interest selection (5-6 onboarding, max 10 cap), counter metrics (`totalAttempts`, `totalQuizzesAttempted`, `lastAttemptAt`), and onboarding status.
* **`instructorProfile.service.js`**: Manages instructor bio and expertise, computes dynamic metrics (`totalStudents`, `assignedQuizCount`) with Redis caching.
* **`eloEngine.service.js`**: Calculates post-quiz attempt Elo adjustments for student ratings ($R_S$) and question difficulty ($R_Q$) using the standard Elo formula ($K = 32$). Handles `isArchived` and `highestRating` peak tracking.
* **`levelMapping.service.js`**: Maps computed Elo ratings to fixed platform level tiers (Beginner, Learner, Intermediate, Advanced, Master, Expert). Uses Redis caching (`system:level_thresholds`) with automatic invalidation on admin updates.

---

## 3. Strict Architectural Layer Boundaries

1. **Middleware Layer (`backend/middleware/`)**:
   * **Authentication & Authorization ONLY**: Validates JWT tokens (`auth.middleware.js`), enforces role checks (`authorizeRoles`), checks account suspension (`suspendedAt`), and blocks un-onboarded students (`403 ONBOARDING_REQUIRED`).
   * **Constraint**: ZERO business logic or database field mutations in middleware.

2. **Controller Layer (`backend/controllers/`)**:
   * **Request / Response Handler**: Extracts parameters from HTTP requests, calls corresponding service functions, and formats HTTP responses (`200 OK`, `400 Bad Request`, `403 Forbidden`, `404 Not Found`).
   * **Constraint**: ZERO direct MongoDB queries or business rule calculations in controllers.

3. **Service Layer (`backend/services/`)**:
   * **Business Logic Core**: Implements all business validation, transaction handling, Elo algorithms, and database operations.

---

## 4. Database Transactions & Redis Caching Policies

### 4.1 MongoDB Session Transactions
* **Multi-Document ACID Safety**: Post-quiz submission updates involving `QuizAttempt`, `StudentProfile` counters (`totalAttempts`, `totalQuizzesAttempted`, `lastAttemptAt`), and `EloRating` are wrapped inside a single **MongoDB Session Transaction** (`session = await mongoose.startSession(); session.startTransaction()`).
* **Failure Safety**: Any error during attempt scoring or profile counter updates causes a full transaction rollback (`session.abortTransaction()`), guaranteeing zero data corruption.

### 4.2 Redis In-Memory Caching & Invalidation Policy
* **Keys & TTL Specifications**:
  * `instructor:assigned_count:<instructorId>` — Caches `assignedQuizCount` computed via `QuizAssignment` query. TTL: 300s (5 min). Invalidated on quiz assignment or unassignment.
  * `instructor:total_students:<instructorId>` — Caches distinct enrolled student count. TTL: 300s (5 min). Invalidated when a new student submits their first quiz attempt for that instructor.
  * `system:level_thresholds` — Caches platform level tiers. TTL: 3600s (1 hr). Invalidated on admin level threshold updates (`redis.del`).
* **Fallback**: Graceful fallback to primary MongoDB queries if Redis service is disconnected.

---

## 5. Technical Stack Specifications

### Backend Ecosystem
* **Runtime**: Node.js (ES Modules `"type": "module"`)
* **Framework**: Express.js 5.x
* **Database**: MongoDB with Mongoose 9.x ODM
* **In-Memory Cache**: Redis 7 Container (Docker Compose) + `ioredis` with graceful DB fallback
* **Authentication**: JSON Web Tokens (JWT) + Bcrypt password hashing
* **Email Service**: Nodemailer (OTP Mailer for password recovery)
* **AI Integration**: Groq SDK (`groq-sdk`) for Elo-aware LLM question generation
* **Security & Middleware**: `helmet()` security headers, Morgan logger, Express Rate Limit, Cors

### Frontend Ecosystem
* **Framework**: React 19 + Vite 8
* **Styling**: Tailwind CSS v4 + Motion
* **State Management**: Zustand (Global session & persistent state)
* **Routing**: React Router Dom v7/v8
* **Visualization**: Recharts (Data charts & visual metrics)
* **Icons**: Lucide React

---

## 6. Directory Layout & Module Decoupling

```
quimora/
├── backend/
│   ├── config/          # DB connection & env setup
│   ├── controllers/     # Route request handlers
│   ├── middleware/      # Auth, consent, privacy scope, error middleware
│   ├── models/          # Mongoose schema definitions (User, Quiz, Elo, Level, etc.)
│   ├── routes/          # Express route definitions
│   ├── scripts/         # Seed scripts (seed_admin, seed_v3_levels, seed_v3_interests) & reset_v3_data
│   ├── services/        # User, StudentProfile, InstructorProfile, EloEngine, LevelMapping services
│   └── tests/           # Vitest integration test suite
├── frontend/
│   ├── src/
│   │   ├── components/  # Modular UI elements & StatCards
│   │   ├── pages/       # Route-level view pages
│   │   ├── store/       # Zustand state management
│   │   └── utils/       # Axios interceptors & helpers
└── docs/                # Standardized Specification Documents
```

---

## 7. Security & Authentication Model

1. **Authentication Flow**:
   - `POST /api/v1/auth/register` creates user with hashed password (`bcrypt.hash`). Role defaults to `user` or `instructor` (`admin` forbidden).
   - `POST /api/v1/auth/login` checks active/suspended status, updates `lastLoginAt`, and returns signed JWT token.
   - Client attaches token as `Authorization: Bearer <token>`.
2. **Role & Status Verification Middleware**:
   - `authMiddleware`: Validates JWT signature, checks `user.active` and `user.suspendedAt`, extracts `req.auth`.
   - `authorizeRoles('instructor', 'admin')`: Enforces role-based route access.
   - `checkStudentOnboarding`: Blocks un-onboarded students (`onboardingCompleted === false`) with `403 ONBOARDING_REQUIRED`.
   - `verifyQuizConsent`: Verifies student has confirmed pre-quiz consent before start.
   - `scopeInstructorAnalytics`: Restricts non-primary instructors to aggregate data.
