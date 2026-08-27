# Quimora — Admin Panel (V1) Progress Tracker

Isse project root mein rakh do (`quimora/ADMIN-V1-PLAN.md`). Jaise-jaise kaam hota jaye, status update karte jaana — `[ ]` → `[~]` → `[x]`. Gemini ke saath kaam karte waqt yahi file dikha dena, wo turant samajh jayega kaha tak pahuche ho.

---

## 🎯 Status Legend
- `[ ]` Pending — abhi shuru nahi hua
- `[~]` In Progress — kaam chal raha hai
- `[x]` Done — complete ho gaya

---

## Current State (jo maine analyze karke paya)

- `frontend/src/pages/admin/AdminDashboardPage.jsx` — **khali placeholder hai**, sirf `<div>AdminDashboardPage</div>`.
- `frontend/src/routes/adminRoutes.jsx` — route already set hai, `authorizeRoles(["admin"])` se protected. Isme change ki zarurat nahi.
- Backend mein **koi dedicated `admin.routes.js` / `admin.controllers.js` nahi hai** — jo admin-related endpoints hain wo `user.routes.js` aur `auth.routes.js` mein bikhre hue hain.
- Middleware `authorizeRoles("admin")` already bana hua hai (`backend/middleware/auth.middleware.js`) — reuse karna hai, naya nahi banana.

---

## 🧩 Feature 1 — User Management Table

**Status:** `[ ]` Pending

**Kya karna hai:**
- Admin ek table mein saare users dekh sake (name, email, role, joined date)
- Search/filter by role (`user` / `instructor` / `admin`)
- Delete user button

**Backend — already ready hai, koi naya code nahi chahiye:**
- `GET /users/all` (admin-protected) — sabhi users
- `DELETE /users/:userId` (admin-protected) — user delete

**Kya file me kya karna hai:**
- [ ] `frontend/src/pages/admin/AdminDashboardPage.jsx` — table UI banani hai (ya isko split karke `AdminUserListPage.jsx` bana sakte ho, jaisa instructor ke `InstructorStudentListPage.jsx` pattern hai)
- [ ] Ek naya store banao (Zustand) — `frontend/src/features/admin/users/store/useAdminUsersStore.js` — reference ke liye `frontend/src/features/instructor/students/store/useInstructorStudents.js` dekhna (same pattern copy karo)
- [ ] Reference design ke liye `frontend/src/pages/instructor/InstructorStudentListPage.jsx` dikhana Gemini ko

---

## 🧩 Feature 2 — Activate / Deactivate User

**Status:** `[~]` In Progress (field decided, ab wire karna baaki)

**Naming decision (finalized):** `isSuspended` nahi, **`active`** (Boolean) field use karenge — `active: true` = normal, `active: false` = blocked. Poori codebase mein isi naam se consistent rehna hai (model, login check, admin toggle, stats — sab jagah `active`).

**Kya karna hai:**
- Delete karne ki bajaye "deactivate" karna safer option — user ka data delete nahi hota, bas login block ho jaata hai
- Admin panel se toggle button (Deactivate / Reactivate)

**Backend changes chahiye:**
- [ ] `backend/models/user.model.js` — `active: { type: Boolean, default: true }` field add karna
- [ ] `backend/controllers/auth.controllers.js` — `loginUser` function mein check add karna: agar `active === false` to login reject karo with proper message
- [ ] `backend/controllers/user.controllers.js` — naya function `toggleUserActive` banana
- [ ] `backend/routes/user.routes.js` — naya route `PATCH /users/:userId/active` (admin-protected) add karna
- [ ] Stats endpoint (Feature 3) mein `active`/`deactivated` count isi field se aana chahiye — already demo response mein match ho raha hai

**Frontend:**
- [ ] User table mein Activate/Deactivate button add karna (Feature 1 ke table mein hi)

---

## 🧩 Feature 3 — System Overview Stats

**Status:** `[~]` In Progress (demo/mock response already design ho chuka hai, isi shape ko real data se implement karna hai)

**Finalized response shape (demo se confirm hua):**
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

Ye shape original plan (sirf 4 stat cards) se behtar aur zyada complete hai — isi flow ko follow karke pehle build karna hai, phir extra cheezein (jaise Recent Activity feed) add karke perfect banana hai.

**Notes:**
- `users.active` / `users.deactivated` — Feature 2 ke `active` boolean field se hi calculate hoga (`countDocuments({active: true})` vs `false`)
- `completionRate` — `completedAttempts / totalAttempts` — ye original plan mein nahi tha, achha addition hai
- `avgQuizzesPerInstructor` — `totalQuizzes / totalInstructors` — bhi naya addition, achha engagement metric hai

**Backend — naya banana hai:**
- [ ] `backend/routes/admin.routes.js` — naya file, pattern copy karo `backend/routes/instructorDashboard.routes.js` se
- [ ] `backend/controllers/admin.controllers.js` — naya file, stats aggregation logic (`countDocuments`, simple `aggregate`), pattern copy karo instructor dashboard ke controller se
- [ ] `backend/api/server.js` — `apiRouter.use("/admin", adminRoutes)` line add karni hai

**Frontend:**
- [ ] `AdminDashboardPage.jsx` mein 4 stat cards add karna — design reference ke liye `frontend/src/features/student/dashboard/StatsCard.jsx` dikhana Gemini ko (same component reuse ya copy ho sakta hai)

---

## 📁 Master File List (Gemini ko saath mein bhejne ke liye)

**Reference/pattern files (copy karne ke liye):**
- `backend/routes/instructorDashboard.routes.js`
- `backend/controllers/instructorDashboard.controllers.js` *(exact naam verify kar lena)*
- `frontend/src/features/instructor/students/store/useInstructorStudents.js`
- `frontend/src/pages/instructor/InstructorStudentListPage.jsx`
- `frontend/src/features/student/dashboard/StatsCard.jsx`

**Directly edit karni hain:**
- `frontend/src/pages/admin/AdminDashboardPage.jsx`
- `backend/models/user.model.js` (Feature 2 ke liye)
- `backend/controllers/auth.controllers.js` (Feature 2 ke liye)
- `backend/controllers/user.controllers.js` (Feature 2 ke liye)
- `backend/routes/user.routes.js` (Feature 2 ke liye)
- `backend/api/server.js` (Feature 3 ke liye, route mount karne)

**Naya banani hain:**
- `backend/routes/admin.routes.js`
- `backend/controllers/admin.controllers.js`
- `frontend/src/features/admin/users/store/useAdminUsersStore.js`

**Already theek hai, chhedna nahi:**
- `frontend/src/routes/adminRoutes.jsx`
- `backend/middleware/auth.middleware.js`

---

## 📝 Suggested order of building
1. Feature 1 (User Table) — sabse fast win, backend already ready
2. Feature 2 (Suspend/Ban) — chhota backend addition
3. Feature 3 (Stats) — naya module, thoda zyada kaam

---

## Overall Admin V1 Progress: 0 / 3 features done