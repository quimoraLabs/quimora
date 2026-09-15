# Quimora — Business Rules & Decisions Log (Layer 5)

> **Document Type:** Layer 5 Immutable Business Logic & Technical Rules  
> **Rule Policy:** AI coding assistants MUST NOT modify or assume these rules without explicit user approval.  
> **Last Updated:** 2026-09-15  

---

## 1. Grading & Scoring Rules

1. **Default Question Marks**: Every standard multiple-choice question defaults to `1` mark unless explicitly overridden by the instructor during creation.
2. **Negative Marking Policy**:
   * Default setting: **No negative marking** ($0$ deduction for incorrect answers).
   * Penalty formula (when enabled): $\text{Score} = \text{Correct Marks} - (\text{Wrong Answers} \times \text{Penalty Factor})$.
3. **Passing Criteria**: Passing percentage defaults to `40%`. If $\text{percentage} \ge 40$, `passed = true`; otherwise `false`.
4. **Partial Credit Policy**: Single-choice questions offer no partial credit. Partial credit for multi-select questions is disabled in V1/V2.

---

## 2. Quiz Attempt, Retake & Timer Policies (V2 P0 Engine)

1. **Retake Allotment Policy (`maxAttempts`)**:
   * Default: `maxAttempts = 0` signifies **unlimited attempts**.
   * When `maxAttempts > 0`, the backend checks the count of existing attempts with status `['completed', 'abandoned']`. If `count >= maxAttempts`, new attempt requests return `403 Forbidden`.
2. **Server-Validated Timer Enforcement**:
   * Attempt `startedAt` is stored on the server upon session creation.
   * `remainingTimeSeconds` is calculated dynamically on the server:
     $$\text{remainingTimeSeconds} = \max\left(0, (\text{timeLimit} \times 60) - \left\lfloor \frac{\text{Now} - \text{startedAt}}{1000} \right\rfloor\right)$$
3. **Server Grace Buffer**:
   * A **15-second grace window** is added on the backend to accommodate network latency before auto-abandoning an expired attempt:
     $$\text{Max Allowed Seconds} = (\text{timeLimit} \times 60) + 15\text{s}$$
4. **Attempt Status Lifecycle**:
   * `in-progress`: Active ongoing quiz attempt.
   * `completed`: Normal student submission graded by server.
   * `abandoned`: Session timed out beyond max allowed seconds without manual submit.

---

## 3. Role & Access Control Rules

1. **Default Registration Role**: New users registering via `/api/auth/register` default to the `user` (Student) role unless explicitly specified as `instructor`.
2. **Admin Privileges**: Only users with `role: 'admin'` can change user roles or suspend accounts.
3. **Quiz Content Privacy**:
   * Students CANNOT view question answer keys (`isCorrect` flag) before or during an active quiz attempt.
   * Instructors can only edit or delete quizzes created by themselves unless the requester is an Admin.

---

## 4. Soft Delete & Data Retention Rules

1. **User Account Deletion**: Soft deletion flags are preferred over hard deletion to maintain historical integrity of `QuizAttempt` analytics.
2. **Quiz Deletion Impact**: Deleting a quiz removes all attached `Question` entities and marks associated `QuizAttempt` records as archived.
