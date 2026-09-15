# Quimora — Testing Strategy & QA Specification (Layer 6)

> **Document Type:** Layer 6 Automated Testing & Quality Assurance Blueprint  
> **Test Framework:** Vitest (Backend)  
> **Last Updated:** 2026-09-15  

---

## 1. Automated Test Suite Breakdown

Backend automated tests are located in `backend/tests/` and run using Vitest.

| Test File | Focus & Scope | Total Lines | Execution Command |
| :--- | :--- | :--- | :--- |
| `01_authentication.test.js` | User Registration, Login, JWT verification, OTP flows. | 89 lines | `npm run test` |
| `02_student_role.test.js` | Student quiz listing, attempt creation, score calculation. | 49 lines | `npm run test` |
| `03_instructor_role.test.js` | Quiz CRUD, Question Manager, Groq AI endpoints, CSV Export. | 80 lines | `npm run test` |
| `04_admin_role.test.js` | Admin statistics, user role management, account status. | 63 lines | `npm run test` |

---

## 2. Test Runner Configuration

* **`package.json` Test Script**:
  ```json
  "scripts": {
    "test": "vitest run --reporter=verbose"
  }
  ```
* **Environment Setup (`backend/tests/setup.js`)**:
  - Automatically initializes an in-memory MongoDB server instance for fast, isolated test execution without polluting the production database.

---

## 3. Feature Definition of Done (DoD)

Before marking any feature as **Done** in `MASTER_ROADMAP.md`:
1. **Automated Test Check**: All existing tests in `backend/tests/` must pass clean (`npm run test`).
2. **New Test Coverage**: Any new endpoint or business rule must have a corresponding test case in the relevant test suite file.
3. **Docs Sync**: Documentation layers (`API_REFERENCE.md`, `DATA_MODEL.md`, `DECISIONS.md`) must be updated to match implementation.
