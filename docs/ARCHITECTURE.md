# Quimora — System Architecture (Layer 1)

> **Document Type:** Layer 1 Architecture Specification  
> **Source:** Extracted & refined from `agent/agent.md`  
> **Last Updated:** 2026-09-15  

---

## 1. High-Level System Architecture

Quimora follows a **decoupled monorepo design** with an Express.js REST API backend and a Vite-powered React single-page application (SPA) frontend.

```
                                  ┌────────────────────────┐
                                  │   CLIENT BROWSER       │
                                  │   React 19 + Vite 8    │
                                  │   Zustand + Tailwind 4 │
                                  └───────────┬────────────┘
                                              │
                                              │ HTTP / REST APIs (JSON)
                                              ▼
                                  ┌────────────────────────┐
                                  │   EXPRESS 5.x SERVER   │
                                  │   Node.js ES Modules   │
                                  └─┬──────────┬─────────┬─┘
                                    │          │         │
              ┌─────────────────────┘          │         └─────────────────────┐
              ▼                                ▼                               ▼
    ┌───────────────────┐            ┌───────────────────┐           ┌───────────────────┐
    │ MONGODB + MONGOOSE│            │ REDIS 7 (DOCKER)  │           │  GROQ AI ENGINE   │
    │ Primary Database  │            │ In-Memory Cache   │           │ Llama 3 / Mixtral │
    └───────────────────┘            └───────────────────┘           └───────────────────┘
```

---

## 2. Technical Stack Specifications

### Backend Ecosystem
* **Runtime**: Node.js (ES Modules `"type": "module"`)
* **Framework**: Express.js 5.x
* **Database**: MongoDB with Mongoose 9.x ODM
* **In-Memory Cache**: Redis 7 Container (Docker Compose) + `ioredis` with graceful DB fallback
* **Authentication**: JSON Web Tokens (JWT) + Bcrypt password hashing
* **Email Service**: Nodemailer (OTP Mailer for password recovery)
* **AI Integration**: Groq SDK (`groq-sdk`) for fast LLM question generation
* **Security & Middleware**: `helmet()` security headers, Morgan logger, Express Rate Limit, Cors

### Frontend Ecosystem
* **Framework**: React 19 + Vite 8
* **Styling**: Tailwind CSS v4 + Motion
* **State Management**: Zustand (Global session & persistent state)
* **Routing**: React Router Dom v7/v8
* **Visualization**: Recharts (Data charts & visual metrics)
* **Icons**: Lucide React

---

## 3. Directory Layout & Module Decoupling

```
quimora/
├── backend/
│   ├── config/          # DB connection & env setup
│   ├── controllers/     # Business logic handlers
│   ├── middleware/      # Auth, role check, error middleware
│   ├── models/          # Mongoose schema definitions
│   ├── routes/          # Express route definitions
│   ├── services/        # External services (Groq AI, Nodemailer)
│   └── tests/           # Vitest integration test suite
├── frontend/
│   ├── src/
│   │   ├── components/  # Modular UI elements
│   │   ├── pages/       # Route-level view pages
│   │   ├── store/       # Zustand state management
│   │   └── utils/       # Axios interceptors & helpers
└── docs/                # 8-Layer Documentation System
```

---

## 4. Groq AI Integration Architecture

Groq AI is integrated as a dedicated service layer (`backend/services/aiQuestion.service.js`) and controller (`backend/controllers/aiQuestion.controllers.js`).

```
Instructor Input (Topic, Count, Difficulty)
             │
             ▼
POST /instructor/ai/generate-questions
             │
             ▼
AI Question Controller (Validates input)
             │
             ▼
Groq AI Service (Invokes Groq SDK with structured JSON prompt)
             │
             ▼
JSON Response Parsed & Sanitized
             │
             ▼
Returned to Frontend for Instructor Review & One-Click Insert
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
