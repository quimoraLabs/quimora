# Quimora — V1 Recheck (Bugs Found After Re-Audit)

This file was created after rechecking the codebase directly, despite `before-v2-plan.md` and `Admin-v1-plan.md` marking items as `[x] Done`. Below are new findings that were not covered in previous documentation.

## Status Legend
- `[ ]` Pending
- `[x]` Done

---

## 🔴 CRITICAL — Security / Answer Leak

### 1. Any logged-in user can view correct answers for a quiz
- **File:** `backend/routes/question.routes.js` (line 11) → `GET /quiz/:quizId/questions`
- **Controller:** `backend/controllers/question.controllers.js` → `getQuizQuestions`
- **Issue:** Only `authMiddleware` is applied on this route; there is no `authorizeRoles` or ownership check. The controller uses `.select("+options.isCorrect")` and returns all questions **including correct answers** — regardless of whether the user is a student, whether the quiz belongs to another instructor, or if the quiz is in draft/unpublished status.
- **Impact:** Any student can directly hit this endpoint before starting a quiz and extract the full answer key. This is a critical flaw for a quiz platform.
- **Comparison:** In the same file, `getQuestionById` properly checks ownership via `getQuizAccess()`. Only `getQuizQuestions` missed this check.
- **Fix:** Restrict route with `authorizeRoles("instructor", "admin")` and enforce ownership checks (`getQuizAccess()`), or allow admin override. Never include `isCorrect` in student-facing responses.
- [x] Done

---

## 🔴 CRITICAL — Broken Access Control (IDOR)

### 2. Any logged-in user can edit any other user's profile
- **File:** `backend/routes/user.routes.js` (line 11) → `PATCH /users/:userId`
- **Controller:** `backend/controllers/user.controllers.js` → `updateUser`
- **Issue:** The route lacks `authorizeRoles` and the controller lacks a check for `req.auth.userId === userId` or admin role. Simply being logged in allows any user (e.g. using a student JWT) to change another user's (even an admin's) `username`, `email`, `name`, or `avatar`.
- **Fix:** Add check `req.auth.role === "admin" || req.auth.userId.toString() === userId` inside controller.
- [x] Done

### 3. Avatar update endpoint is open for any user
- **File:** `backend/routes/user.routes.js` (line 14) → `PATCH /users/:userId/avatar`
- **Controller:** `backend/controllers/user.controllers.js` → `upadteAvatar`
- **Issue:** Same problem as #2 — missing ownership or role check. Any user can use their JWT to overwrite the avatar of any `userId` (and delete the previous ImageKit file).
- **Fix:** Add ownership/admin check similar to #2.
- [x] Done

### 4. Admin self-delete / self-deactivate protection is broken (Object comparison bug)
- **File:** `backend/controllers/user.controllers.js` → `deleteUser` & `toggleUserActiveStatus`
- **Issue:** `auth.middleware.js` sets `req.auth.userId = user._id` which is a Mongoose **ObjectId object**, not a string. However, `deleteUser` and `toggleUserActiveStatus` use:
  ```js
  const currentUserId = req.auth.userId;        // ObjectId object
  if (userId === currentUserId) { ... }          // userId is a string (req.params)
  ```
  Comparing string `===` ObjectId always returns `false`, meaning this self-protection check **never triggers**. Elsewhere in the codebase (`quiz.controllers.js`, `question.controllers.js`, `attemptQuiz.controllers.js`), `.toString()` is always called before comparison.
- **Frontend gap:** `frontend/src/features/admin/components/AdminUserTable.jsx` has no `currentUser`/self check — the Delete and Deactivate buttons remain active even on the logged-in admin's own row.
- **Impact:** An admin can accidentally deactivate or delete their own account, locking themselves out.
- **Fix:** Change to `userId === currentUserId.toString()` in both controllers. Additionally, disable/hide Delete and Deactivate buttons on the logged-in admin's row in the frontend table.
- [x] Done

---

## 🟡 Medium — Logic / Data Integrity

### 5. Admin given quiz delete route access, but controller blocks non-creators
- **File:** `backend/routes/quiz.routes.js` (line 50) → `DELETE /quizzes/:quizId` specifies `authorizeRoles("instructor", "admin")`
- **Controller:** `backend/controllers/quiz.controllers.js` → `deleteQuiz`
- **Issue:** Route level permits admin, but inside controller `quiz.createdBy.toString() !== userId` blocks anyone who is not the creator, returning 403. The intended admin override is broken.
- **Fix:** Change condition to `if (quiz.createdBy.toString() !== userId && req.auth.role !== "admin")`.
- [x] Done

### 6. Quiz deletion leaves orphaned QuizAttempts
- **File:** `backend/controllers/quiz.controllers.js` → `deleteQuiz`
- **Issue:** Deleting a quiz only cascade-deletes `Question` documents (`Question.deleteMany({ quizId })`), but leaves `QuizAttempt` records.
- **Fix:** Cascade-delete linked attempts via `QuizAttempt.deleteMany({ quizId })`.
- [x] Done

### 7. User/Instructor deletion does not clean up linked Quiz / Attempt data
- **File:** `backend/controllers/user.controllers.js` → `deleteUser`
- **Issue:** Deleting an instructor leaves their created `Quiz` documents (and associated questions/attempts) dangling. Deleting a student leaves their `QuizAttempt` records dangling.
- **Fix:** In `deleteUser`, clean up student attempts (`QuizAttempt.deleteMany({ userId })`) and instructor quizzes (cascade delete questions & attempts when quiz is deleted).
- [x] Done

---

## 🟢 Minor / Cleanup

### 8. `V2-BACKLOG.md` item is stale
- **Claim in doc:** "Remove debug `console.log` in `user.model.js` — Two leftover console.log calls inside Mongoose pre-hooks (deleteOne, findOneAndUpdate)"
- **Reality:** `backend/models/user.model.js` currently has only a `pre("save")` hook and no `console.log` statements.
- **Fix:** Mark item as `[x]` in `V2-BACKLOG.md`.
- [x] Done

### 9. Server request logger runs in production
- **File:** `backend/api/server.js` (line ~43)
- **Issue:** `console.log` runs on every request without checking `NODE_ENV`.
- **Fix:** Wrap with `if (config.nodeENV === "development")`.
- [x] Done

---

## 📝 Suggested Fix Order
1. **#1** — Question/answer leak (Critical)
2. **#2, #3** — updateUser & avatar IDOR (Critical)
3. **#4** — Admin self-protection ObjectId bug + Frontend UI check (Critical)
4. **#5** — Admin delete-quiz override (Medium)
5. **#6, #7** — Cascade delete / orphaned data cleanup (Medium)
6. **#8, #9** — Backlog item update + request log hygiene (Minor)