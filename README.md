# 🎓 Quimora — Modern Quiz & Learning Management Platform

![Quimora Banner](https://img.shields.io/badge/Quimora-Full--Stack%20LMS-6366f1?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20v18%2B-339933?style=for-the-badge&logo=nodedotjs)
![Express.js](https://img.shields.io/badge/Framework-Express%20v5-000000?style=for-the-badge&logo=express)
![React](https://img.shields.io/badge/Frontend-React%20v19-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Bundler-Vite%20v8-646CFF?style=for-the-badge&logo=vite)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20v4-06B6D4?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

**Quimora** is a high-performance, full-stack online quiz management and adaptive e-learning platform. Built with modern web technologies, Quimora offers role-based user management (Students, Instructors, Admins), an **Interest-driven Adaptive Engine** powered by Elo ratings, 6-tier level rank mapping (Beginner to Expert), 1:1 instructor quiz ownership with pre-quiz student consent, and privacy-preserving analytics.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **Role-Based Access Control (RBAC)**: Enforced via modular middleware (`authorizeRoles`) for `student`, `instructor`, and `admin`.
- **JWT Session Tokens**: Secure HTTP header token authentication with configurable expiry.
- **Bcrypt Password Hashing**: Industry-standard salt rounds for user credentials.
- **Email OTP Password Reset**: Professional HTML email OTPs sent via Nodemailer (10-minute security window).
- **Account Protection**: Admin self-protection and last-admin deactivation prevention guards.

### 📝 Quiz & Grading Engine
- **Server-Validated Timed Engine (V2)**: Real-time server-side timestamp validation (`remainingTimeSeconds`), 15-second grace buffer, and student pre-quiz eligibility checks.
- **Negative Marking Penalty**: Granular negative marking per quiz attempt submission.
- **Real-Time Attempt Evaluation**: Automated calculation of score, total marks, percentage, passed/failed status, and time taken.
- **Bulk Question Management**: API endpoints for single or bulk question creation via CSV and JSON.

### 🎯 V3 Interest-Driven Adaptive Engine (Current Target)
- **Interest Selection & Discovery**: Students customize topic interest tags to discover interest-aligned quizzes without forced enrollment.
- **Elo-Based Adaptive Difficulty**: Mathematical Elo rating formula ($K = 32$) dynamically adjusting student Elo ratings ($R_S$) and question difficulty ($R_Q$) post-submission.
- **6-Tier Level Mapping**: Tiered rank progression (Beginner, Learner, Intermediate, Advanced, Master, Expert) computed dynamically from Elo ratings.
- **1:1 Instructor Ownership & Consent**: Quizzes assigned to primary instructors with mandatory student pre-quiz consent modals.
- **Privacy-Preserving Analytics**: Detailed analytics for assigned instructors; anonymized aggregate analytics for non-assigned external instructors.
- **Elo-Aware Groq AI**: AI question generation calibrated to target student Elo levels.

---

## 👑 Role Permission Matrix

| Feature | Student | Instructor | Admin |
| :--- | :---: | :---: | :---: |
| Browse & Filter Quizzes by Interest | ✅ | ✅ | ✅ |
| Select Personal Interests & View Elo Rank | ✅ | ❌ | ❌ |
| Pre-Quiz Instructor Consent Modal | ✅ | ❌ | ❌ |
| Create & Manage Assigned Quizzes | ❌ | ✅ | ✅ |
| Detailed Analytics for Assigned Students | ❌ | ✅ (Owned) | ✅ |
| Anonymized Aggregate External Analytics | ❌ | ✅ (External)| ✅ |
| Manage All System Users & System Metrics | ❌ | ❌ | ✅ |

---

## 📚 Documentation System

Quimora uses a standardized **Documentation Framework** located in `docs/`:

| Layer | Specification Document | Description |
| :--- | :--- | :--- |
| **Layer 0** | [PRODUCT_SPEC.md](file:///d:/quimora/docs/PRODUCT_SPEC.md) | Product vision, user personas, and version boundaries (V1–V5). |
| **Layer 1** | [ARCHITECTURE.md](file:///d:/quimora/docs/ARCHITECTURE.md) | High-level system design, monorepo stack, and Groq AI pipeline. |
| **Layer 2** | [API_REFERENCE.md](file:///d:/quimora/docs/API_REFERENCE.md) | Authoritative API contracts, endpoints, request schemas, and error codes. |
| **Layer 3** | [DATA_MODEL.md](file:///d:/quimora/docs/DATA_MODEL.md) | Mongoose schemas (`User`, `Quiz`, `Question`, `QuizAttempt`, `Interest`, `EloRating`, `Level`, `InstructorProfile`, `QuizAssignment`). |
| **Layer 4** | [MASTER_ROADMAP.md](file:///d:/quimora/docs/MASTER_ROADMAP.md) | **Single Source of Truth Roadmap** for V1 Shipped, V2 Shipped, V3 Target. |
| **Layer 5** | [DECISIONS.md](file:///d:/quimora/docs/DECISIONS.md) | Immutable business logic (Grading, timer, Elo $K=32$ math, consent rules). |
| **Layer 6** | [TEST_STRATEGY.md](file:///d:/quimora/docs/TEST_STRATEGY.md) | Automated backend Vitest coverage breakdown & Definition of Done. |
| **Layer 7** | [AI_DELEGATION_GUIDE.md](file:///d:/quimora/docs/AI_DELEGATION_GUIDE.md) | Standard Operating Procedure (SOP) for working with AI coding assistants. |
| **V3 Plan** | [V3_PLAN.md](file:///d:/quimora/docs/V3_PLAN.md) | Interest-driven adaptive assessment engine execution roadmap. |

---

## 🗺️ Master Roadmap

All active features, shipped baseline tasks, and upcoming milestones are tracked in **[docs/MASTER_ROADMAP.md](file:///d:/quimora/docs/MASTER_ROADMAP.md)** and **[agent/agent.md](file:///d:/quimora/agent/agent.md)**.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/quimoraLabs/quimora/issues).

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.
