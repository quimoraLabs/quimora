# Quimora — Pre-Launch Checklist (Before V2)

## Status Legend
- `[ ]` Pending
- `[~]` In Progress  
- `[x]` Done

---

## 🔴 Critical Bugs

### 1. ✅ `motion/react` migration complete
- **Status:** Already fixed, no action needed
- [x] Done

### 2. Negative Marking key mismatch
- **File:** `backend/services/quizAttempt.service.js` + `backend/utils/grading.utils.js`
- **Issue:** `negativeMarking` vs `negativeMarkingPercentage` key mismatch
- **Fix:** Use same key name in both files
- [x] Done

### 3. `createBulkQuestions` validation order
- **File:** `backend/controllers/question.controllers.js`
- **Issue:** `.length` check before `Array.isArray()` → crash risk
- **Fix:** Move `Array.isArray()` check to top
- [x] Done

---

## 🟡 Backend Fixes

### 4. `getAllUsers` empty list handling
- **File:** `backend/controllers/user.controllers.js`
- **Issue:** Returns 404 for 0 users
- **Fix:** Return 200 with empty array
- [x] Done

### 5. `getAllUsers` response format
- **File:** `backend/controllers/user.controllers.js`
- **Issue:** Direct array vs wrapper format mismatch
- **Fix:** Use `{ success, count, users }` format
- [x] Done

### 6. Admin self-protection
- **File:** `backend/controllers/user.controllers.js`
- **Issue:** Admin can delete/deactivate own account
- **Fix:** Check `userId !== currentUserId`
- [x] Done

### 7. Last-admin protection
- **File:** `backend/controllers/user.controllers.js`
- **Issue:** Can delete the only remaining admin
- **Fix:** Check admin count before delete/deactivate
- [x] Done

---

## 🟡 Frontend Fixes

### 8. Admin error display
- **File:** `frontend/src/pages/admin/AdminDashboardPage.jsx`
- **Issue:** `error` state set but not rendered
- **Fix:** Add error banner component
- [x] Done

### 9. Admin store axiosClient migration
- **File:** `frontend/src/features/admin/store/useAdminStore.js`
- **Issue:** Uses raw axios + manual auth header
- **Fix:** Replace with `axiosClient`
- [x] Done

### 10. Chart fake data
- **File:** `frontend/src/features/admin/components/NewUserChart.jsx`
- **Issue:** Generates random data with `Math.random()`
- **Fix:** Pass real data or show "No data" message
- [x] Done

---

## 🟢 Feature Work (Non-blocking)

### 11. Create User UI
- **File:** `frontend/src/features/admin/components/CreateUserModal.jsx`
- **Endpoint:** `POST /auth/admin/create-user` (already exists)
- **Task:** Build form UI
- [x] Done

### 12. Delete confirmation modal
- **File:** `frontend/src/features/admin/store/useAdminStore.js`
- **Issue:** Uses `window.confirm()`
- **Fix:** Replace with `ConfirmModal` component
- [x] Done

---

## ✅ Verified Working

- [x] Admin User Table (search, filter, pagination)
- [x] Admin Activate/Deactivate toggle
- [x] Admin Stats (`GET /admin/stats`)
- [x] View User modal
- [x] Student Result screen
- [x] Store field mappings

---

## 📝 Suggested Fix Order

1. Negative marking key mismatch
2. Bulk question validation order
3. Admin self-protection + last-admin protection
4. `getAllUsers` fixes
5. Admin error display + axiosClient migration
6. Chart real data
7. Create User UI + ConfirmModal