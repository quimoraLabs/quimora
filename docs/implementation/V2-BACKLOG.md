# Quimora — V2 Backlog & Roadmap

This file maintains the active backlog for Quimora V2 additions, upcoming features, and future enhancements.

## 🎯 Status Legend
- `[ ]` Pending
- `[~]` In Progress
- `[x]` Done

---

## 🛠️ Instructor Capabilities

- [ ] **Question Image / Diagram Attachment**
  - **Backend:** Utilize ImageKit utility (`backend/utils/imagekit.utils.js`). Extend `question.model.js` schema with `image: { url, fileId }`, wire image upload in `question.controllers.js`, and add an image attachment picker to the question editor form.

- [ ] **One-Click Quiz Duplication / Cloning**
  - **Endpoint:** `POST /quizzes/:quizId/duplicate`
  - **Logic:** Clone target `Quiz` document along with all associated `Question` documents under new ObjectIDs, reset status to `draft`, and append `" (Copy)"` to the title. Add "Duplicate" action in `InstructorQuizListPage.jsx`.

- [ ] **Granular Resource Permissions**
  - Granular resource-level access (Read / Write / Admin) for shared question banks and collaborative quiz editing.

- [ ] **Multi-Role Support**
  - Support multiple simultaneous roles per user account (e.g. Admin + Instructor) instead of a single static role enum.

---

## 📊 Analytics & Reporting

- [ ] **Advanced Student Performance Export**
  - Export student attempt metrics, question breakdown, and score distributions as CSV / PDF.

- [ ] **Live Quiz Analytics Dashboard**
  - Real-time websocket or polling updates for live attempt completion rates and time spent per question.

---

## 📝 Completed V1 Features & Fixes Log

- [x] **V1 Security Audit & IDOR Fixes** — Resolved answer leak, IDOR access controls, admin self-deactivation bugs, and rate-limiting.
- [x] **Cascading Data Cleanup** — Automatic cascading deletion for attempts, questions, and quizzes on user or quiz removal.
- [x] **Admin Panel V1** — User table, search/filter, activate/deactivate toggle, system stats dashboard, user creation modal.
