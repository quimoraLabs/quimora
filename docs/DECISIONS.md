# Quimora — Business Rules & Decisions Log (Layer 5)

> **Document Type:** Layer 5 Immutable Business Logic & Technical Rules  
> **Rule Policy:** AI coding assistants MUST NOT modify or assume these rules without explicit user approval.  
> **Last Updated:** 2026-09-28  

---

## 1. Grading & Scoring Rules

1. **Default Question Marks**: Every standard multiple-choice question defaults to `1` mark unless explicitly overridden by the instructor during creation.
2. **Negative Marking Policy**:
   - Default setting: **No negative marking** ($0$ deduction for incorrect answers).
   - Penalty formula (when enabled): $\text{Score} = \text{Correct Marks} - (\text{Wrong Answers} \times \text{Penalty Factor})$.
3. **Passing Criteria**: Passing percentage defaults to `40%`. If $\text{percentage} \ge 40$, `passed = true`; otherwise `false`.
4. **Partial Credit Policy**: Single-choice questions offer no partial credit. Partial credit for multi-select questions is disabled in V1/V2.

---

## 2. Quiz Attempt, Retake & Timer Policies (V2 Engine)

1. **Retake Allotment Policy (`maxAttempts`)**:
   - Default: `maxAttempts = 0` signifies **unlimited attempts**.
   - When `maxAttempts > 0`, the backend checks the count of existing attempts with status `['completed', 'abandoned']`. If `count >= maxAttempts`, new attempt requests return `403 Forbidden`.
2. **Server-Validated Timer Enforcement**:
   - Attempt `startedAt` is stored on the server upon session creation.
   - `remainingTimeSeconds` is calculated dynamically on the server:
     $$\text{remainingTimeSeconds} = \max\left(0, (\text{timeLimit} \times 60) - \left\lfloor \frac{\text{Now} - \text{startedAt}}{1000} \right\rfloor\right)$$
3. **Server Grace Buffer**:
   - A **15-second grace window** is added on the backend to accommodate network latency before auto-abandoning an expired attempt:
     $$\text{Max Allowed Seconds} = (\text{timeLimit} \times 60) + 15\text{s}$$
4. **Attempt Status Lifecycle**:
   - `in-progress`: Active ongoing quiz attempt.
   - `completed`: Normal student submission graded by server.
   - `abandoned`: Session timed out beyond max allowed seconds without manual submit.

---

## 3. Role & Access Control Rules

1. **Default Registration Role**: New users registering via `/api/auth/register` default to the `user` (Student) role unless explicitly specified as `instructor`.
2. **Protected Admin Role**: Registration endpoints (`/api/v1/auth/register`) strictly forbid `role: 'admin'`. Passing `role: 'admin'` will return `403 Forbidden`. Admin accounts can ONLY be created via CLI seed scripts (`seed_admin.js`) or promoted by existing admins.
3. **Admin Privileges**: Only users with `role: 'admin'` can change user roles or suspend accounts.
4. **Quiz Content Privacy**:
   - Students CANNOT view question answer keys (`isCorrect` flag) before or during an active quiz attempt.
   - Instructors can only edit or delete quizzes created by themselves unless the requester is an Admin.

---

## 4. V3 Business Rules (Adaptive Engine & Instructor Rules)

1. **V3 Fresh Start Decision**:
   - V3 operates on a fresh dataset. V2 data is wiped using `reset_v3_data.js` and seeded using `seed_admin.js`, `seed_v3_levels.js`, and `seed_v3_interests.js`.
   - Legacy V2 migration rules and scripts are deprecated and removed.

2. **Interest-Based Quiz Discovery**:
   - Student selects zero or more interests/topic tags during onboarding or via settings.
   - Quizzes categorized under those interests are presented to the student on their dashboard.
   - The student voluntarily chooses which quiz to attempt (no forced or automatic enrollment).

3. **Mathematical Elo Rating & Question Difficulty Formula**:
   - Standard Elo rating algorithm with Development Factor ($K = 32$).
   - **Expected Student Score Calculation** ($E_S$) given student Elo rating ($R_S$) and question difficulty rating ($R_Q$):
     $$E_S = \frac{1}{1 + 10^{(R_Q - R_S)/400}}$$
   - **Updated Student Elo Rating** post-response:
     $$R_{S, \text{new}} = \max\left(0, R_{S, \text{old}} + K \times (S - E_S)\right)$$
     where $S = 1$ for a correct answer, and $S = 0$ for an incorrect answer.
   - **Updated Question Difficulty Rating** post-response (Simplified):
     $$R_{Q, \text{new}} = \max\left(100, R_{Q, \text{old}} + K \times (E_S - S)\right)$$
     *(Correct answer $S=1$: student rating increases, question rating decreases; Wrong answer $S=0$: student rating decreases, question rating increases).*

4. **Level Mapping Matrix & Threshold Rules**:
   - Tier thresholds are **fixed platform-wide constants** stored in the database (`Level` collection) to ensure uniform badge criteria across all interest domains:
     - **Beginner**: $0 - 1000$ Elo
     - **Learner**: $1000 - 1200$ Elo
     - **Intermediate**: $1200 - 1400$ Elo
     - **Advanced**: $1400 - 1600$ Elo
     - **Master**: $1600 - 1800$ Elo
     - **Expert**: $1800+$ Elo

5. **Instructor Assignment Rule**:
   - Each quiz is assigned to **one primary instructor** via `QuizAssignment`.
   - An instructor can create and manage multiple quizzes.
   - Students see primary instructor details (name, bio, expertise, overall rating) on the pre-quiz preview screen.

6. **Student Consent Rule**:
   - Student MUST view instructor credentials and explicitly confirm consent via modal before initiating a quiz attempt (`POST /api/v1/student/quiz/:quizId/consent`).
   - Sessions initialized without recorded student consent will return `403 Forbidden`.

7. **Instructor Data Visibility & "Enrolled Student" Definition**:
   - **Enrolled Student Definition**: A student who has explicitly completed the consent flow AND submitted at least one quiz attempt for a quiz owned by that primary instructor.
   - **Data Access Scope**:
     - **Primary Instructor**: Receives detailed student analytics (student names, emails, exact selected options, submission timestamps, and individual score reports).
     - **Non-Primary / External Instructors**: View **anonymized aggregate data ONLY** (total attempt count, global pass rate, score distribution histograms, average completion time) with zero student names, emails, or individual user IDs.

---

## 5. V3 User Architecture & Profile Rules

1. **Student Interest Onboarding & Limits**:
   - **Initial Onboarding**: Students must select 5–6 interests to flip `onboardingCompleted` to `true`. Once set, `onboardingCompleted` stays `true` permanently.
   - **Mandatory Guard**: Students with `onboardingCompleted === false` receive `403 Forbidden` (`code: ONBOARDING_REQUIRED`) on dashboard/quiz APIs until onboarding is complete.
   - **Hard Cap**: Maximum 10 interests per student, enforced via Mongoose schema validator.

2. **Elo Archiving & Re-addition**:
   - Removing an interest sets `isArchived: true` immediately on `EloRating`.
   - Re-adding the interest toggles `isArchived: false` and preserves previous Elo score and `highestRating`.
   - Peak tracking: `highestRating` updates whenever `newRating > highestRating`. Initial rating defaults to 1000.

3. **Username Limits & Modification**:
   - `username` can be changed once every 30 days (`lastUsernameChangedAt`). Attempting to change before 30 days returns `400 Bad Request`.

4. **Account Suspension Coupling**:
   - Admin account suspension sets `active: false`, `suspendedAt: new Date()`, and `suspendedReason`.
   - Auth middleware blocks suspended accounts with `403 Forbidden`.

5. **Interest Creation & Provenance Rules**:
   - **Admin-created platform core interests**: `isCore: true`, `createdBy: adminId`.
   - **System-seeded core interests**: `isCore: true`, `createdBy: null`.
   - **Instructor-created custom interests**: `isCore: false`, `createdBy: instructorId`.
   - **Student Access Scope**: Students can select and unselect active interests for personalized quiz discovery, but cannot create new interest entries.

---

## 6. Soft Delete & Data Retention Rules

1. **User Account Deletion**: Soft deletion flags (`active: false`) are preferred over hard deletion to maintain historical integrity of `QuizAttempt` analytics.
2. **Quiz Deletion Impact**: Soft-deleting a quiz removes all attached `Question` entities, decrements `InstructorProfile.totalQuizzes`, and marks associated `QuizAttempt` records as archived.
