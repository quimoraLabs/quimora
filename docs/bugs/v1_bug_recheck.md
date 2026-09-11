# Quimora — V1 Recheck Audit (Round 1)

This document contains the findings from the initial re-audit of the Quimora codebase. All critical, medium, and minor issues listed below have been resolved and verified.

## Status Legend
- `[ ]` Pending
- `[x]` Done

---

## 🔴 CRITICAL — Security & Answer Leak

### 1. Questions & Answer Key Leak in Public Endpoint
- **File:** `backend/routes/question.routes.js` → `GET /quiz/:quizId/questions`
- **Controller:** `backend/controllers/question.controllers.js` → `getQuizQuestions`
- **Issue:** Previously, `getQuizQuestions` returned `.select("+options.isCorrect")` without verifying user roles or quiz ownership, exposing full answer keys to students prior to quiz attempts.
- **Fix:** Added role checks (`authorizeRoles("instructor", "admin")`) and ownership validation via `getQuizAccess()`. Correct answers (`isCorrect`) are sanitized and stripped from all student-facing responses.
- [x] Done

---

## 🔴 CRITICAL — Broken Access Control (IDOR)

### 2. Unauthorized User Profile Modifications
- **File:** `backend/routes/user.routes.js` → `PATCH /users/:userId`
- **Controller:** `backend/controllers/user.controllers.js` → `updateUser`
- **Issue:** Missing ownership verification permitted any authenticated user to modify another user's profile details.
- **Fix:** Added authorization check: `req.auth.role === "admin" || req.auth.userId.toString() === userId`.
- [x] Done

### 3. Unauthorized Avatar Modification
- **File:** `backend/routes/user.routes.js` → `PATCH /users/:userId/avatar`
- **Controller:** `backend/controllers/user.controllers.js` → `updateAvatar`
- **Issue:** Missing ownership check allowed users to overwrite avatar images for arbitrary user IDs.
- **Fix:** Added strict ownership and admin authorization checks.
- [x] Done

### 4. Admin Self-Protection Mongoose ObjectId Comparison Bug
- **File:** `backend/controllers/user.controllers.js` → `deleteUser` & `toggleUserActiveStatus`
- **Issue:** Mongoose `req.auth.userId` (ObjectId) was compared against `req.params.userId` (string) using strict equality `===`, causing self-deactivation protection to evaluate to `false`.
- **Fix:** Updated comparison to use `userId === currentUserId.toString()`. Added UI safeguards in `AdminUserTable.jsx` to disable delete/deactivate buttons on the active admin's row.
- [x] Done

---

## 🟡 MEDIUM — Business Logic & Data Integrity

### 5. Admin Quiz Deletion Override
- **File:** `backend/routes/quiz.routes.js` & `backend/controllers/quiz.controllers.js` → `deleteQuiz`
- **Issue:** Route allowed admin role, but controller restricted deletion strictly to the quiz creator.
- **Fix:** Updated check: `if (quiz.createdBy.toString() !== userId && req.auth.role !== "admin")`.
- [x] Done

### 6. Cascade Cleanup of Quiz Attempts on Quiz Deletion
- **File:** `backend/controllers/quiz.controllers.js` → `deleteQuiz`
- **Issue:** Quiz deletion left orphaned `QuizAttempt` records in the database.
- **Fix:** Implemented automatic cascading delete: `QuizAttempt.deleteMany({ quizId })`.
- [x] Done

### 7. Cascade Cleanup on User Deletion
- **File:** `backend/controllers/user.controllers.js` → `deleteUser`
- **Issue:** User deletion left dangling quizzes, questions, and attempts.
- **Fix:** Added cascading deletion logic for student attempts (`QuizAttempt.deleteMany({ userId })`) and instructor quizzes/questions/attempts upon user deletion.
- [x] Done

---

## 🟢 MINOR — Code Hygiene

### 8. Outdated Backlog Items Cleared
- **Issue:** Mongoose pre-hook `console.log` removal item in `V2-BACKLOG.md` was already complete.
- **Fix:** Updated backlog status.
- [x] Done

### 9. Development Request Logger Scoping
- **File:** `backend/api/server.js`
- **Issue:** Verbose logging executed in all environments.
- **Fix:** Scoped verbose request logging strictly to `config.nodeENV === "development"`.
- [x] Done
