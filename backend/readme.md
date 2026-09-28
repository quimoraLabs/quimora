# 🛡️ Quimora — Backend Service

The Express 5 & Node.js API server for **Quimora** (Quiz Management Platform).

> 📌 **Main Documentation:** For comprehensive architecture, environment set up, API contracts, and roadmap, refer to the root [README.md](file:///d:/quimora/README.md) and [docs/](file:///d:/quimora/docs/).

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
├── api/          # Express server entry point (server.js)
├── config/       # MongoDB, Redis, and ImageKit configurations
├── controllers/  # Route request handlers
├── middleware/   # Authentication, RBAC, and error guards
├── models/       # Mongoose schemas (User, Quiz, Question, QuizAttempt, etc.)
├── routes/       # API route declarations (/api/v1/...)
├── services/     # Business logic & grading services
├── tests/        # Vitest integration test suites
└── utils/        # Email OTP, JWT, and helper utilities
```

---

## 📚 Technical Specifications

- **API Reference**: [`docs/API_REFERENCE.md`](file:///d:/quimora/docs/API_REFERENCE.md)
- **Data Models**: [`docs/DATA_MODEL.md`](file:///d:/quimora/docs/DATA_MODEL.md)
- **Business Decisions**: [`docs/DECISIONS.md`](file:///d:/quimora/docs/DECISIONS.md)
- **Master Roadmap**: [`docs/MASTER_ROADMAP.md`](file:///d:/quimora/docs/MASTER_ROADMAP.md)