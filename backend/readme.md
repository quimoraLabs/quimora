# 🛡️ Quimora — Backend Service

The Express 5 & Node.js API server for **Quimora** (Quiz & Adaptive Learning Platform).

> 📌 **Main Documentation:** For comprehensive architecture, environment set up, API contracts, and roadmap, refer to the root [README.md](file:///d:/quimora/README.md), [PRD](file:///d:/quimora/prd.md), [Progress Tracker](file:///d:/quimora/progress.md), and [docs/](file:///d:/quimora/docs/).

---

## 🛠️ Quick Start

```bash
# Install dependencies
npm install

# Run backend development server
npm run dev

# Run Vitest integration test suite
npm run test
```

---

## 📂 Project Structure

```
backend/
├── app.js        # Express application configuration & route mounting
├── server.js     # HTTP server entry point & port listener
├── config/       # MongoDB, Redis, and ImageKit configurations
├── controllers/  # Route request handlers
├── middleware/   # Authentication, RBAC, validObjectId, and error guards
├── models/       # Mongoose schemas (User, Quiz, Question, EloRating, Level, etc.)
├── routes/       # API route declarations (/api/v2/... & /api/v1/...)
├── scripts/      # Data seeding (admin, levels, interests) and reset scripts
├── services/     # Business logic, Elo rating math, profiles, and level mapping
├── tests/        # Vitest integration test suites (Auth, Student, Instructor, Admin)
└── utils/        # Email OTP, JWT, and helper utilities
```

---

## 📚 Technical Specifications

- **Product Requirements**: [`prd.md`](file:///d:/quimora/prd.md)
- **Live Progress**: [`progress.md`](file:///d:/quimora/progress.md)
- **API Reference**: [`docs/API_REFERENCE.md`](file:///d:/quimora/docs/API_REFERENCE.md)
- **Data Models**: [`docs/DATA_MODEL.md`](file:///d:/quimora/docs/DATA_MODEL.md)
- **Business Decisions**: [`docs/DECISIONS.md`](file:///d:/quimora/docs/DECISIONS.md)
- **Master Roadmap**: [`docs/MASTER_ROADMAP.md`](file:///d:/quimora/docs/MASTER_ROADMAP.md)