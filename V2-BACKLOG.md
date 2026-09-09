# Quimora — V2 Backlog

Is file ko project root mein rakh do (`quimora/V2-BACKLOG.md`). Jab bhi koi naya idea aaye ya koi cheez "abhi nahi, baad mein" decide ho, yahi update karte jaana. Isse kabhi bhi context khona nahi padega — chahe Gemini ho, Claude ho, ya khud tum 2 mahine baad wapas aao.

**Kaise use karein:** Har item ke aage `[ ]` hai — jab complete ho jaye to `[x]` kar dena aur niche "Completed Log" mein date ke saath move kar dena.

---

## 🎯 Status Legend
- `[ ]` — Pending
- `[~]` — In Progress
- `[x]` — Done (move to Completed Log)

---

## 🛠️ Instructor Side

- [ ] **Question Image / Diagram Attachment**
  Backend: ImageKit already configured (`backend/utils/imagekit.utils.js`). Add `image: {url, fileId}` to `question.model.js`, wire upload in `question.controllers.js`, add image picker in question form.

- [ ] **Duplicate / Clone Quiz (1-click)**
  New route `POST /quizzes/:quizId/duplicate`. Clone quiz doc + all its Question docs with new IDs, status reset to `draft`. Auto-suffix title on collision (reuse `duplicate.utils.js` pattern). Add "Duplicate" button in `InstructorQuizListPage.jsx`.

- [ ] **Advanced Permissions (README roadmap item)**
  Granular resource-level access (Read/Write/Admin) for content sharing between instructors.

- [ ] **Multi-role Support (README roadmap item)**
  Allow a single user to hold multiple roles (e.g. Admin + Instructor) instead of one fixed role.

---

## 🎓 Student Side

- [ ] *(Add items here as they come up — nothing pending right now beyond V1 scope)*

---

## 👑 Admin Side

- [ ] **Content Moderation**
  Flag or remove inappropriate quiz content. Needs a `flagged`/`moderationStatus` field on Quiz model + admin review UI.

- [ ] **Recent Activity Feed**
  Last N quiz attempts (student, quiz, score, time) shown on admin dashboard — nice-to-have, skipped in V1 stats to keep it simple.

- [ ] **Role Change from Admin Panel**
  Confirm whether `updateUser` allows changing a user's `role`, and if not, add an explicit "change role" action for admins (e.g. promote user → instructor).

---

## 🔐 Security / Tech Debt

- [x] **Remove debug `console.log` in `user.model.js`** (Verified: pre-hooks in user.model.js clean, no debug logs remaining)

- [ ] **Password History System (README roadmap item)**
  Prevent credential reuse on password reset — store hash history, check against it in `verifyOTP`/reset flow.

---

## ☁️ Infra / Architecture

- [ ] **Cloud Storage Migration (README roadmap item)**
  Move from Cloudinary references (if any still exist) fully to ImageKit / evaluate AWS S3 + CDN as per original roadmap note.

---

## 📚 Advanced Quiz Engine (README roadmap item)

- [ ] Topic and Difficulty-based (Easy/Medium/Hard) evaluation and filtering.
- [ ] Support for multiple question types (MCQ is done; Fill-ups, Reasoning, etc. pending).

---

## 🎒 Content-First Course System (README roadmap item — big, long-term)

- [ ] Lightweight learning modules with structured chapters and lessons (separate from quizzes). This is a large feature — needs its own planning session when picked up, not a quick add-on.

---

## ✅ Completed Log (V1)

- [x] **Passing Score % + Negative Marking** — full backend grading engine (marks-weighted scoring, negative marking penalty, `passed` boolean) + instructor form fields + student result screen showing Passed/Failed and marks breakdown.
- [x] **Admin — User Management, Suspend/Ban, System Overview stats** *(update this line once actually built — currently in progress)*

---

## 📝 Notes for future sessions
- When resuming work with any AI, share this file + the relevant feature section's file list (ask Claude/Gemini to point out exact files again if forgotten).
- Keep adding new ideas directly under the right section as they come up mid-conversation — don't wait to "remember later."