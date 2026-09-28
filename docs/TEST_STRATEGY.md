# Quimora — Testing Strategy & QA Specification (Layer 6)

> **Document Type:** Layer 6 Automated Testing & Quality Assurance Blueprint  
> **Test Framework:** Vitest (Backend)  
> **Last Updated:** 2026-09-28  

---

## 1. Automated Test Suite Breakdown

Backend automated tests are located in `backend/tests/` and run using Vitest.

| Test File | Focus & Scope | Execution Command |
| :--- | :--- | :--- |
| `01_authentication.test.js` | User Registration, Login, JWT verification, OTP flows. | `npm run test` |
| `02_student_role.test.js` | Student quiz listing, attempt creation, server timer, eligibility checks. | `npm run test` |
| `03_instructor_role.test.js` | Quiz CRUD, Question Manager, Groq AI endpoints, CSV Export. | `npm run test` |
| `04_admin_role.test.js` | Admin statistics, user role management, account status. | `npm run test` |
| `05_v3_adaptive_engine.test.js` | **[V3]** Elo score formula ($K=32$), Level tier mapping, Interest filtering, Consent flow, Privacy scoping. | `npm run test` |

---

## 2. V3 Test Scenarios & Definition of Done Criteria

### 2.1 Elo Rating Engine Tests
- **Correct Answer Increment**: Verifies student Elo increases by $K \times (1 - E_S)$ and question difficulty decreases accordingly.
- **Incorrect Answer Decrement**: Verifies student Elo decreases by $K \times E_S$ and question difficulty increases.
- **K-Factor Bounds ($K = 32$)**: Verifies Elo rating floor ($\ge 0$) and question difficulty floor ($\ge 100$).

### 2.2 Interest Filtering & Catalog Tests
- **Tag Matching**: Verifies student with selected interest tags receives matched quizzes in `/api/v1/student/quizzes`.

### 2.3 Level Mapping Tier Tests
- **Boundary Verification**:
  - $0 - 1000$ Elo $\rightarrow$ `Beginner`
  - $1000 - 1200$ Elo $\rightarrow$ `Learner`
  - $1200 - 1400$ Elo $\rightarrow$ `Intermediate`
  - $1400 - 1600$ Elo $\rightarrow$ `Advanced`
  - $1600 - 1800$ Elo $\rightarrow$ `Master`
  - $1800+$ Elo $\rightarrow$ `Expert`

### 2.4 Instructor Assignment & Consent Flow Tests
- **Consent Block**: Attempting `/api/v1/student/quiz/start` without prior consent returns `403 Forbidden`.
- **Consent Passed**: Attempt starts cleanly once consent record exists.

### 2.5 Privacy Scoping RBAC Tests
- **Assigned Instructor Access**: Primary assigned instructor receives student names and detailed attempt breakdowns.
- **Unassigned Instructor Isolation**: External instructor requesting quiz metrics receives anonymized aggregate stats only (no student names or user IDs).

---

## 3. Test Runner Configuration

* **`package.json` Test Script**:
  ```json
  "scripts": {
    "test": "vitest run --reporter=verbose"
  }
  ```
* **Environment Setup (`backend/tests/setup.js`)**:
  - Automatically initializes an in-memory MongoDB server instance for fast, isolated test execution without polluting the production database.

---

## 4. Feature Definition of Done (DoD)

Before marking any feature as **Done** in `MASTER_ROADMAP.md` or `agent.md`:
1. **Automated Test Check**: All existing tests in `backend/tests/` must pass clean (`npm run test`).
2. **New Test Coverage**: Any new endpoint or business rule must have a corresponding test case in `05_v3_adaptive_engine.test.js`.
3. **Docs Sync**: Documentation layers (`API_REFERENCE.md`, `DATA_MODEL.md`, `DECISIONS.md`) must match code behavior.
