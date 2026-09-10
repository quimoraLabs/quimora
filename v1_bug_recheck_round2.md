# Quimora — Round 2 Recheck (New Findings, Not in Previous Docs)

Purana `v1_bug_recheck.md` verify kiya — us file ke saare 9 issues genuinely fix mile hain
(code me confirm kiya, sirf doc claim pe trust nahi kiya). Lekin isi audit ke dauraan
**5 naye issues** mile jo pehle kisi doc (`before-v2-plan.md`, `v1_bug_recheck.md`,
`V2-BACKLOG.md`, `PRODUCTION_DEPLOYMENT_GUIDE.md`) me cover nahi the.

## Status Legend
- `[ ]` Pending
- `[x]` Done

---

## 🔴 CRITICAL — Auth / Security

### 1. `verify-otp` endpoint has NO rate limiting (OTP brute-force → account takeover)
- **File:** `backend/routes/auth.routes.js`
- **Issue:** `otpLimiter` (5 req / 15 min) is only applied to `PATCH /request-otp`. The actual
  `PATCH /verify-otp` route — where the 6-digit OTP is checked and password reset happens —
  has **no rate limiter at all**.
  ```js
  router.patch("/request-otp", otpLimiter, forgetPasswordRequest); // limited
  router.patch("/verify-otp", verifyOTP);                          // NOT limited
  ```
- **Impact:** OTP is a 6-digit code (1M combinations) valid for 10 minutes. Without a limiter
  on `verify-otp`, an attacker who knows a victim's email can script unlimited guesses against
  `verify-otp` within that 10-minute window and take over the account (OTP flow directly sets
  a new password on match).
- **Fix:** Apply `otpLimiter` (or a stricter one, e.g. 5–10 attempts/15 min per IP+email) to the
  `verify-otp` route as well. Consider also locking/invalidating the OTP after N failed attempts.
- [ ] Pending

### 2. Insecure hardcoded fallback for `JWT_SECRET`
- **File:** `backend/config/config.js`
  ```js
  jwtSecret: process.env.JWT_SECRET || "your_jwt_secret",
  ```
- **Issue:** If `JWT_SECRET` is missing/misconfigured in any environment (common deploy mistake —
  e.g. forgot to set it on Render/Vercel), the server **silently** falls back to the publicly
  known string `"your_jwt_secret"` instead of failing to start. Anyone can then forge a valid JWT
  for any `userId`/role and fully bypass authentication.
- **Fix:** Remove the fallback — throw/exit on boot if `JWT_SECRET` is not set:
  ```js
  if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
  ```
- [ ] Pending

---

## 🟡 MEDIUM

### 3. `/auth/login` has no rate limiting
- **File:** `backend/routes/auth.routes.js`
- **Issue:** `otpLimiter` exists in this file but is only wired to `request-otp`. `POST /login`
  has zero rate limiting, so passwords can be brute-forced without restriction.
- **Fix:** Add a login-specific limiter (e.g. 10 attempts / 15 min per IP, or per IP+email).
- [ ] Pending

### 4. Double response in `auth.middleware.js` on unexpected errors (crashes request)
- **File:** `backend/middleware/auth.middleware.js`
  ```js
  } catch (err) {
    if (err.name === "TokenExpiredError") { return res.status(401).json({...}); }
    if (err.name === "JsonWebTokenError") { return res.status(401).json({...}); }
    next(err);                                   // <- sends error down the chain
    return res.status(401).json({ message: "Invalid token" }); // <- ALSO tries to respond
  }
  ```
- **Issue:** For any error other than the two handled `jwt` error types (e.g. a MongoDB error
  from `User.findById`, or `NotBeforeError`), the code calls `next(err)` **and then** still tries
  to send its own response. Since `errorHandler` middleware will already respond to `next(err)`,
  the second `res.status(401).json(...)` throws `ERR_HTTP_HEADERS_SENT`.
- **Fix:** Pick one path — either handle it locally and `return`, or `next(err)` and stop:
  ```js
  return next(err);
  ```
- [ ] Pending

### 5. CORS trusts *any* `*.vercel.app` / `*.onrender.com` origin, with credentials on
- **File:** `backend/api/server.js`
  ```js
  const isAllowed =
    !origin ||
    allowedOrigins.includes(origin) ||
    origin.endsWith(".vercel.app") ||
    origin.endsWith(".onrender.com") ||
    origin.includes("hoppscotch.io") ||
    origin.includes("localhost");
  // ...
  res.setHeader("Access-Control-Allow-Credentials", "true");
  ```
- **Issue:** `.vercel.app` and `.onrender.com` are shared free-hosting domains — anyone can spin
  up `random-attacker-app.vercel.app` in minutes and it will pass this check, with credentials
  allowed. Low risk today since the JWT is sent via `Authorization: Bearer` (not cookies), so a
  third-party origin can't silently ride on the victim's session — but it unnecessarily widens
  the trusted-origin surface and becomes a real cookie-based CSRF/credential-leak risk if
  cookie-based auth is ever added later.
- **Fix:** Replace the wildcard suffix checks with an explicit allow-list of your actual deployed
  frontend domain(s); drop the blanket `.vercel.app` / `.onrender.com` trust.
- [ ] Pending

---

## 🟢 Minor / Note

### 6. Password-reset request leaks whether an email is registered
- **File:** `backend/controllers/auth.controllers.js` → `forgetPasswordRequest`
- **Issue:** Returns `404 "Invalid email"` when the email isn't found vs. a success message when
  it is — lets an attacker enumerate registered accounts.
- **Fix (optional, low priority):** Always return the same generic "If this email exists, an OTP
  has been sent" message regardless of whether the user was found.
- [ ] Pending

---

## ✅ Reconfirmed From Previous Recheck (`v1_bug_recheck.md`) — all still hold in code
- [x] #1 Question answer-leak (`getQuizQuestions`) — now role + ownership checked, `isCorrect`
      never sent to students in `startQuizAttempt` (verified via `sanitizeQuestionsForStudent`).
- [x] #2 / #3 `updateUser` & avatar IDOR — both now check `role === admin || self`.
- [x] #4 Admin self-protection ObjectId bug — now compares `.toString()` correctly, and frontend
      `AdminUserTable.jsx` disables Delete/Deactivate on the logged-in admin's own row.
- [x] #5 Admin quiz-delete override — controller now allows creator **or** admin.
- [x] #6 / #7 Cascade delete on quiz/user deletion — `QuizAttempt`/`Question` cleaned up on both
      quiz delete and user delete.
- [x] #8 / #9 Stale backlog note + dev-only request logger — confirmed clean.

---

## 📝 Suggested Fix Order (before V2)
1. **#1** — Rate-limit `verify-otp` (Critical, account takeover)
2. **#2** — Remove insecure `JWT_SECRET` fallback (Critical, full auth bypass if misconfigured)
3. **#3** — Rate-limit `/login`
4. **#4** — Fix double-response bug in `auth.middleware.js`
5. **#5** — Tighten CORS origin allow-list
6. **#6** — (optional) Generic message on forgot-password to avoid email enumeration

## Verdict
Core V1 security bugs (answer leak, IDOR, admin self-protection, cascade deletes) are genuinely
fixed — good to trust those. But **#1 and #2 above are real, unpatched security holes** and
should be closed before calling V1 done / starting V2. #3–#6 are good hardening items, not
blockers, but cheap to fix now while you're in this code.
