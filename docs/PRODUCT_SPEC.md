# Quimora — Product Specification (Layer 0)

> **Document Type:** Layer 0 Product Blueprint  
> **Version Scope:** V1 Shipped | V2 Active | V3 Planned | V4 Future  
> **Last Updated:** 2026-09-15  

---

## 1. Product Vision & Mission

**Quimora** is an end-to-end, high-performance Quiz & Assessment Management Platform designed for educational institutions, online instructors, and enterprise certification bodies. It simplifies quiz creation, automated AI-assisted question generation, real-time timed test taking, and detailed student analytics.

---

## 2. Target User Personas

| Persona | Primary Needs & Responsibilities | Key User Flows |
| :--- | :--- | :--- |
| **Student / User** | Take assigned/public quizzes, track historical scores, view attempt step-by-step breakdown, receive instant feedback. | Browse available quizzes → Start timed attempt → Submit responses → View score breakdown & leaderboard. |
| **Instructor** | Create & manage quizzes, bulk import questions, generate AI questions via Groq AI, inspect student submissions, export roster CSVs. | Create Quiz → Add/Import Questions → Publish → View Submissions & Analytics → Export Grades. |
| **Admin** | System-wide moderation, user role elevation/suspension, platform analytics, infrastructure oversight. | View Global Metrics → Manage User Accounts → Audit System Logs. |

---

## 3. Version Boundary & Scope Locks

```
┌──────────────────────────┐    ┌──────────────────────────┐    ┌──────────────────────────┐
│       V1 (SHIPPED)       │ ──►│       V2 (ACTIVE)        │ ──►│     V3/V4 (FUTURE)       │
│ Core Auth & Dashboards   │    │ AI Suite & Analytics     │    │ Mobile App & Proctoring  │
└──────────────────────────┘    └──────────────────────────┘    └──────────────────────────┘
```

### ✅ V1 Scope (Shipped Baseline)
* **Auth System**: Email/Password registration, JWT sessions, Bcrypt hashing, Email OTP password reset.
* **Role-Based Access Control**: Student, Instructor, Admin roles with route guard enforcement.
* **Quiz Management**: Manual question creation, quiz publishing/unpublishing, basic scoring.
* **Attempt Engine**: Student quiz submission and instant score calculation.

### 🚀 V2 Scope (Active Development)
* **Groq AI Assistant**: AI question generation (`/instructor/ai/generate-questions`) and description auto-generation.
* **Bulk Question Importer**: CSV & JSON bulk upload modal with client-side validation.
* **Advanced Instructor Analytics**: Roster performance overview, 7-day attempt trends (Recharts), CSV export.
* **Server-Validated Timed Attempt**: Real-time timer auto-submit and server-side clock tampering prevention.
* **Admin Management Suite**: Full system overview metrics and user role/status controls.

### 🔮 V3 Scope (Planned Future)
* **Question Bank & Tagging**: Global tagged library shared across quizzes.
* **Adaptive Test Engine**: Dynamic difficulty scaling based on student accuracy.
* **Certificate Generator**: Automated PDF certificate issuance upon achieving passing score.

### 🌌 V4 Scope (Long-Term Vision)
* **AI Proctoring**: Webcam framing and tab-switch detection logs.
* **Native Mobile Apps**: React Native iOS & Android client applications.
* **Enterprise Multi-Tenancy**: Organization and team workspace isolation.

---

## 4. Key Non-Functional Requirements (NFRs)

* **Performance:** API response latency $< 200\text{ms}$ for quiz retrieval and submission processing.
* **Security:** Strict CORS policy, HTTP-only JWT storage option, rate limiting (100 req/15 min per IP), input sanitization.
* **Reliability:** Idempotent attempt submission handling to prevent duplicate attempt records.
