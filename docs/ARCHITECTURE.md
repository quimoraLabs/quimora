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
* **`EloEngineService`**: Calculates post-quiz attempt Elo adjustments for student ratings ($R_S$) and question difficulty ($R_Q$) using the standard Elo formula ($K = 32$).
* **`InterestMatchingService`**: Indexes quiz topics against student interest choices for personalized dashboard recommendations.
* **`LevelMappingService`**: Maps computed Elo ratings to fixed platform level tiers (Beginner, Learner, Intermediate, Advanced, Master, Expert).
* **`InstructorAssignmentService`**: Enforces 1:1 quiz instructor mapping and tracks student pre-quiz consent confirmations.
* **`PrivacyScopingMiddleware`**: Filters analytics payload based on instructor role (full breakdown for assigned instructor, anonymized aggregate data for external instructors).

---

## 3. Technical Stack Specifications

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

## 4. Directory Layout & Module Decoupling

```
quimora/
├── backend/
│   ├── config/          # DB connection & env setup
│   ├── controllers/     # Route request handlers
│   ├── middleware/      # Auth, consent, privacy scope, error middleware
│   ├── models/          # Mongoose schema definitions (User, Quiz, Elo, Level, etc.)
│   ├── routes/          # Express route definitions
│   ├── services/        # Elo engine, Groq AI, Nodemailer, Level service
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

## 5. Security & Authentication Model

1. **Authentication Flow**:
   - `POST /api/auth/register` creates user with hashed password (`bcrypt.hash`).
   - `POST /api/auth/login` returns signed JWT token.
   - Client attaches token as `Authorization: Bearer <token>`.
2. **Role Verification Middleware**:
   - `verifyToken`: Validates JWT signature and extracts `req.user`.
   - `authorizeRoles('instructor', 'admin')`: Enforces role-based route access.
   - `verifyQuizConsent`: Verifies student has confirmed pre-quiz consent before start.
   - `scopeInstructorAnalytics`: Restricts non-primary instructors to aggregate data.
