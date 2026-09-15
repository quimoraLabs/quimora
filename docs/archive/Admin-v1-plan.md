# Quimora — Admin Panel (V1) Progress & Specification

This document tracks the V1 implementation progress for the Quimora Admin Panel.

## 🎯 Status Legend
- `[ ]` Pending
- `[~]` In Progress
- `[x]` Done

---

## Architecture Overview

- **Frontend Component:** `frontend/src/pages/admin/AdminDashboardPage.jsx`
- **Route Configuration:** `frontend/src/routes/adminRoutes.jsx` protected via `authorizeRoles(["admin"])`
- **Backend Services:** `backend/routes/admin.routes.js`, `backend/controllers/admin.controllers.js`, `backend/routes/user.routes.js`, `backend/controllers/user.controllers.js`
- **Authorization Middleware:** `backend/middleware/auth.middleware.js`

---

## 🧩 Feature 1 — User Management Table

**Status:** `[x]` Done

### Completed Requirements:
- Display all platform users in a structured table (Name, Email, Role, Active Status, Date Joined)
- Full-text search and role filter (`user`, `instructor`, `admin`)
- User deletion modal with confirmation
- User details view modal

### API Endpoints:
- `GET /users` (Admin-protected) — Fetch all users with pagination and filtering
- `DELETE /users/:userId` (Admin-protected) — Delete user and trigger cascading cleanup

---

## 🧩 Feature 2 — Account Activation / Deactivation Toggle

**Status:** `[x]` Done

### Completed Requirements:
- Toggle user `active` state (`active: true` for normal access, `active: false` to block login)
- Account deactivation preserves historical quiz and attempt records while preventing login
- Self-deactivation and last-admin protection guards in backend controller

### API Endpoint:
- `PATCH /users/:userId/active` (Admin-protected) — Toggle user active status

---

## 🧩 Feature 3 — System Analytics & Platform Stats

**Status:** `[x]` Done

### Summary Metrics Structure:
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
```
