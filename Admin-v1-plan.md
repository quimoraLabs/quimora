# Quimora — Admin Panel (V1) Progress Tracker

Place this file in project root: `quimora/ADMIN-V1-PLAN.md`

---

## 🎯 Status Legend
- `[ ]` Pending — Not started
- `[~]` In Progress — Work in progress
- `[x]` Done — Completed

---

## Current State

- `frontend/src/pages/admin/AdminDashboardPage.jsx` — **Working** with stats, user table, chart, error handling
- `frontend/src/routes/adminRoutes.jsx` — Route already configured with `authorizeRoles(["admin"])`. No changes needed.
- Backend admin files created — `admin.routes.js` + `admin.controllers.js` exist
- Middleware `authorizeRoles("admin")` already exists — reuse, do not create new

---

## 🧩 Feature 1 — User Management Table

**Status:** `[x]` Done

**Requirements:**
- Display all users in a table (name, email, role, joined date) ✅
- Search/filter by role (`user` / `instructor` / `admin`) ✅
- Delete user button ✅
- View user details modal ✅

**Backend — Already Ready:**
- `GET /users` (admin-protected) — all users ✅
- `DELETE /users/:userId` (admin-protected) — delete user ✅
- `PATCH /users/:userId/active` (admin-protected) — toggle active ✅

**Frontend:**
- [x] `AdminDashboardPage.jsx` — User table integrated with search/filter/pagination
- [x] `AdminUserTable.jsx` — Complete table component
- [x] `AdminUserViewModal.jsx` — User detail modal
- [x] `useAdminStore.js` — Zustand store with fetchUsers, deleteUser, toggleUserActive

---

## 🧩 Feature 2 — Activate / Deactivate User

**Status:** `[x]` Done

**Naming Decision (Finalized):** Use `active` (Boolean) — `active: true` = normal, `active: false` = blocked. Consistent across model, login check, admin toggle, stats.

**Requirements:**
- Safer alternative to delete — user data preserved, login blocked ✅
- Admin panel toggle button (Deactivate / Reactivate) ✅
- Self-protection + Last-admin protection ✅

**Backend:**
- [x] `backend/models/user.model.js` — `active: { type: Boolean, default: true }` field added
- [x] `backend/controllers/auth.controllers.js` — login check for `active: false`
- [x] `backend/controllers/user.controllers.js` — `toggleUserActiveStatus` function
- [x] `backend/controllers/user.controllers.js` — Self-protection (admin cannot deactivate self)
- [x] `backend/controllers/user.controllers.js` — Last-admin protection (cannot deactivate only admin)
- [x] `backend/routes/user.routes.js` — `PATCH /users/:userId/active` (admin-protected)

**Frontend:**
- [x] `AdminUserTable.jsx` — Activate/Deactivate button with toggle
- [x] `useAdminStore.js` — `toggleUserActive` function with optimistic update

---

## 🧩 Feature 3 — System Overview Stats

**Status:** `[x]` Done

**Finalized Response Shape:**
```json
{
  "success": true,
  "stats": {
    "users": {
      "total": 150,
      "roles": { "user": 120, "instructor": 25, "admin": 5 },
      "active": 142,
      "deactivated": 8
    },
    "studentsOverview": {
      "totalAttempts": 450,
      "completedAttempts": 410,
      "passedAttempts": 320,
      "overallPassRate": "78%",
      "completionRate": "91%"
    },
    "instructorsOverview": {
      "totalInstructors": 25,
      "totalQuizzes": 85,
      "publishedQuizzes": 70,
      "draftQuizzes": 15,
      "avgQuizzesPerInstructor": 3.4
    }
  }
}