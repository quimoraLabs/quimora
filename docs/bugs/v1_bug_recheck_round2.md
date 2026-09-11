# Quimora — Round 2 Audit Findings & Security Hardening

This document records the Round 2 security audit findings and their resolution status.

## Status Legend
- `[ ]` Pending
- `[x]` Done

---

## 🔴 CRITICAL — Authentication & Security

### 1. `verify-otp` Endpoint Rate Limiting
- **File:** `backend/routes/auth.routes.js`
- **Issue:** Previously, `otpLimiter` was only configured on `PATCH /request-otp`. The `PATCH /verify-otp` route lacked rate limiting, exposing 6-digit OTP verification to brute-force attempts.
- **Fix:** Applied `otpLimiter` to `PATCH /verify-otp` route. Added 6-digit regex validation and password update constraints.
- [x] Done

### 2. Mandatory `JWT_SECRET` Enforcement
- **File:** `backend/config/config.js`
- **Issue:** Relying on fallback secret strings during deployment misconfigurations introduces authentication bypass risks.
- **Fix:** Added strict boot-time check `if (!process.env.JWT_SECRET) throw new Error(...)` to fail fast if `JWT_SECRET` is omitted.
- [x] Done

---

## 🟡 MEDIUM — Security & Middleware Stability

### 3. Login Endpoint Rate Limiting
- **File:** `backend/routes/auth.routes.js`
- **Issue:** `POST /login` lacked rate limiting, allowing unrestricted credential brute-forcing.
- **Fix:** Added `loginLimiter` middleware (10 requests / 15-minute window per IP).
- [x] Done

### 4. Auth Middleware Error Handling Safeguards
- **File:** `backend/middleware/auth.middleware.js`
- **Issue:** Potential double-response execution (`ERR_HTTP_HEADERS_SENT`) when unexpected JWT errors occurred.
- **Fix:** Unified error forwarding via `return next(err)` across unhandled JWT exceptions.
- [x] Done

### 5. Account Enumeration Prevention on Password Reset
- **File:** `backend/controllers/auth.controllers.js` → `forgetPasswordRequest`
- **Issue:** Distinguishing registered vs unregistered emails on password reset exposed user account presence.
- **Fix:** Standardized response message: `"If this email is registered, an OTP has been sent."` regardless of user existence.
- [x] Done

---

## 📋 Summary of Verified Round 1 & Round 2 Security Fixes

- [x] Question answer key leakage prevention
- [x] User update & avatar IDOR authorization checks
- [x] Admin self-protection `.toString()` fix & frontend table safeguards
- [x] Admin quiz deletion override logic
- [x] Complete cascade deletions for quizzes and deleted user accounts
- [x] Rate-limiting on `/login`, `/request-otp`, and `/verify-otp`
- [x] Mandatory environment variable validation for `JWT_SECRET`
