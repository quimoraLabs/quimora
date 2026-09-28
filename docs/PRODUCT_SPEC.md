# Quimora — Product Specification (Layer 0)

> **Document Type:** Layer 0 Product Blueprint  
> **Version Scope:** V1 Shipped | V2 Active | V3 Current Target | V4/V5 Future Scope  
> **Last Updated:** 2026-09-28  

---

## 1. Product Vision & Mission

**Quimora** is an end-to-end, high-performance Quiz & Assessment Management Platform designed for educational institutions, online instructors, and adaptive learning environments. It simplifies interest-driven quiz discovery, automated AI-assisted question generation, real-time timed test taking, dynamic Elo-based skill progression, and privacy-preserving instructor analytics.

---

## 2. Target User Personas

| Persona | Primary Needs & Responsibilities | Key User Flows |
| :--- | :--- | :--- |
| **Student / User** | Select interest topic tags, discover interest-aligned quizzes, view instructor credentials with consent flow, receive adaptive Elo scoring, track level rank progression (Beginner → Expert). | Choose Interests → Browse Interest Quizzes → Consent to Instructor → Complete Timed Attempt → View Elo Score & Rank Level. |
| **Instructor** | Create & manage quizzes, view detailed analytics for assigned students, view anonymized aggregate data for external quizzes, generate Elo-calibrated Groq AI questions. | Create Quiz → Assign Ownership → Generate AI Questions → Publish → View Assigned Student Reports & Aggregate Benchmarks. |
| **Admin** | System-wide moderation, user role elevation/suspension, platform-wide analytics, infrastructure oversight. | View Global Metrics → Manage User Accounts → Audit System Logs. |

---

## 3. Version Boundary & Scope Locks

```
┌──────────────────────────┐    ┌──────────────────────────┐    ┌──────────────────────────┐
│       V1 (SHIPPED)       │ ──►│       V2 (SHIPPED)       │ ──►│   V3 (CURRENT TARGET)    │
│ Core Auth & Dashboards   │    │ Timed Engine & AI Basics │    │ Adaptive Elo & Interests │
└──────────────────────────┘    └──────────────────────────┘    └─────────────┬────────────┘
                                                                              │
                                                                              ▼
                                                                ┌──────────────────────────┐
                                                                │     V4/V5 (FUTURE)       │
                                                                │ Mobile App & Proctoring  │
                                                                └──────────────────────────┘
```

### ✅ V1 Scope (Shipped Baseline)
* **Auth System**: Email/Password registration, JWT sessions, Bcrypt hashing, Email OTP password reset.
* **Role-Based Access Control**: Student, Instructor, Admin roles with route guard enforcement.
* **Quiz Management**: Manual question creation, quiz publishing/unpublishing, basic scoring.
* **Attempt Engine**: Student quiz submission and instant score calculation.

### 🟡 V2 Scope (Shipped Baseline)
* **Groq AI Assistant**: AI question generation (`/instructor/ai/generate-questions`) and description auto-generation.
* **Bulk Question Importer**: CSV & JSON bulk upload modal with client-side validation.
* **Advanced Instructor Analytics**: Roster performance overview, 7-day attempt trends (Recharts), CSV export.
* **Server-Validated Timed Attempt**: Real-time timer auto-submit, 15s grace buffer, student eligibility checks.
* **Admin Management Suite**: Full system overview metrics, account suspension, role elevation.
* **Docker & Redis Caching**: In-memory Redis 7 caching service with DB fallback.

### 🔵 V3 Scope (Current Active Target — Interest-Driven Adaptive Engine)
* **Interest Selection & Filtering**: Topic tag selection for customized quiz discovery.
* **Elo-Based Adaptive Difficulty Engine**: Real-time mathematical Elo rating adjustment per interest ($K = 32$).
* **Level Mapping Tier System**: Tiered rank progression (Beginner, Learner, Intermediate, Advanced, Master, Expert).
* **Instructor Assignment & Consent Flow**: 1:1 instructor quiz ownership with mandatory student pre-quiz consent.
* **Privacy-Preserving Analytics**: Detailed analytics for assigned students; anonymized aggregate analytics for unassigned instructors.
* **Elo-Aware AI Question Generation**: Groq AI SDK generating questions calibrated to student Elo levels.

### 🔮 Future Scope (V4/V5)
> *Future is bright. Once V3 is reached, V4/V5 will be planned. For now, focus on V3.*
* **AI Video Proctoring**: Webcam framing and tab-switch detection logs.
* **Native Mobile Apps**: React Native iOS & Android client applications.
* **Enterprise Multi-Tenancy**: Organization and team workspace isolation.

---

## 4. Key Non-Functional Requirements (NFRs)

* **Performance:** API response latency $< 200\text{ms}$ for quiz retrieval, submission grading, and Elo calculation.
* **Security:** Strict CORS policy, HTTP-only JWT storage option, rate limiting (100 req/15 min per IP), input sanitization, instructor student privacy isolation.
* **Reliability:** Idempotent attempt submission handling and transaction-backed Elo score updates.
