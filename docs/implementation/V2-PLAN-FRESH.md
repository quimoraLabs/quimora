# Quimora V2 — Fresh Plan (Consolidated)

**Base:** V1 security audit clean hai (dekh lo `v1_bug_recheck_round2.md`) — sab critical bugs
fix ho chuke hain, cascade deletes/IDOR/rate-limiting/CORS sab sorted. Ye file purani
`V2-BACKLOG.md` + `README.md` roadmap + naya analysis, sab merge karke ek jagah laayi hai.
Doosre AI ko bhi yahi file dikha sakte ho — sab context isi me hai.

**Stack recap:** React 19 + Vite + Tailwind v4 + Zustand (frontend), Node/Express 5 + MongoDB/
Mongoose (backend), JWT auth, ImageKit (images), Nodemailer (OTP), Groq SDK already in deps
(AI feature ka scope hai but abhi kahin use nahi ho raha — neeche note kiya hai).

---

## Kaise use karein
Har item `[ ]` se start hai. Complete hone par `[x]` karo aur "Completed Log" me move karo.
Priority: **P0** = V2 shuru karne se pehle / turant zaroori, **P1** = V2 ka core scope, **P2** =
achha-hai-agar-time-mile, **P3** = bada feature, alag planning session chahiye.

---

## P0 — Foundation (V2 code likhna shuru karne se pehle)

- [ ] **Test suite shuru karo (abhi zero automated tests hain)**
  Backend: Jest/Vitest + Supertest se `auth`, `grading.utils.js`, `attemptQuiz` flow ke liye
  integration tests. Ye sabse zaroori hai kyunki grading engine (marks + negative marking)
  jaisa silent-bug-prone logic hai — ek chhoti si regression pichli baar bhi (`negativeMarking`
  vs `negativeMarkingPercentage` key mismatch) production tak pahunch gaya tha. Test hota to
  wahi turant pakड़ा जाता.
- [ ] **Input validation layer (Zod/Joi) — har route pe consistent**
  Abhi validation ad-hoc hai (kahin manual `if`, kahin kuch nahi). Ek schema-validation
  middleware daal do taaki `req.body`/`req.params` har jagah consistently validate ho — ye
  aage naye V2 features (image upload, cloning, moderation) me bugs kam karega.
- [ ] **CI pipeline (GitHub Actions)**
  Lint + test + build har PR pe chale. Isse "fix kiya tha but upload/commit nahi hua" jaisi
  situation (jo humne recheck rounds me dekhi) future me pakड़ में आ जाएगी.
- [ ] **Basic error/monitoring setup (Sentry ya similar, free tier)**
  Abhi production me kuch bhi crash ho to sirf server logs se pata chalega. Ek free Sentry
  project laga do backend + frontend dono me.

---

## P1 — Instructor Side

- [ ] **Question Image / Diagram Attachment**
  ImageKit already configured (`backend/utils/imagekit.utils.js`). `question.model.js` me
  `image: {url, fileId}` add karo, `question.controllers.js` me upload wire karo, question
  form me image picker.
- [ ] **Duplicate / Clone Quiz (1-click)**
  `POST /quizzes/:quizId/duplicate` — Quiz + uske Questions clone karo naye IDs ke saath,
  status `draft` pe reset. Title collision pe auto-suffix. Button `InstructorQuizListPage.jsx`
  me.
- [ ] **Question Bank / Reuse Across Quizzes**
  Abhi har quiz ke questions us quiz se tightly coupled hain. Instructor ko apne purane
  questions dusre quiz me reuse karne dena (search + pick from bank) — bahut time bachega
  unka, especially jab clone feature bhi aa raha hai.
- [ ] **Advanced Permissions** *(README roadmap)*
  Granular resource-level access (Read/Write/Admin) content sharing ke liye instructors ke
  beech.
- [ ] **Multi-role Support** *(README roadmap)*
  Ek user ke paas ek se zyada role ho sakein (e.g. Admin + Instructor), abhi single fixed role
  hai.

---

## P1 — Student Side

- [ ] **Leaderboard / Rank per Quiz**
  Attempt data already stored hai (`quizAttempt.model.js`) — top scorers ki simple ranked list
  dikhana bada engagement booster hoga, aur backend-side extra kaam kam hai.
- [ ] **Quiz Search / Filter (by topic, difficulty)**
  `QuizListPage.jsx` abhi flat list lagta hai — jaise-jaise quizzes badhenge, filter/search
  zaroori ho jayega. (Difficulty-tagging Advanced Quiz Engine item se bhi link hai, neeche.)
- [ ] **Auto-submit reliability check**
  Timed quiz ka auto-submit-on-timeout client-side timer pe depend karta hai kya? Agar haan,
  to ek server-side hard deadline check bhi add karo (`expiresAt` timestamp attempt doc me,
  submit request us time ke baad reject/auto-grade ho) — warna student tab close karke ya
  clock tamper karke extra time le sakta hai.

---

## P1 — Admin Side

- [ ] **Role Change from Admin Panel**
  Confirm karo `updateUser` role change allow karta hai ya nahi (V1 recheck me hume mila tha
  ki `safeFields` whitelist me `role` intentionally exclude hai — security ke liye sahi hai).
  To iske liye ek **separate explicit endpoint** banao: `PATCH /admin/users/:id/role` with its
  own `authorizeRoles("admin")` guard — general update endpoint ko touch mat karo.
- [ ] **Content Moderation**
  Quiz model me `flagged`/`moderationStatus` field + admin review UI, taaki inappropriate
  content report/remove ho sake.
- [ ] **Recent Activity Feed**
  Admin dashboard pe last N quiz attempts (student, quiz, score, time) — V1 me simplicity ke
  liye skip kiya tha.
- [ ] **Audit Log**
  Admin actions (user delete, role change, quiz moderation) ka ek simple append-only log —
  jab team badhegi to accountability ke liye zaroori hoga.

---

## P2 — UX / Polish

- [ ] **CSV/PDF export of results** (instructor: sab students ka result; student: apna result)
- [ ] **Email notifications** (quiz assigned, result published) — Nodemailer already set up hai
  OTP ke liye, wahi infra reuse ho sakta hai.
- [ ] **Mobile responsiveness pass** — sab exam-taking screens especially (`TakeExamPage.jsx`)
  chhote screens pe test karo, ye sabse critical UX surface hai.
- [ ] **Dark mode** (Tailwind v4 already supports easily via CSS vars)
- [ ] **Accessibility pass** (keyboard nav for quiz-taking, screen-reader labels on options)

---

## P2 — Security / Tech Debt (ongoing hardening, V1 audit ke baad bhi)

- [ ] **Password History System** *(README roadmap)* — reset ke time purana password reuse na
  ho sake, hash history check karo.
- [ ] **Refresh token / token rotation** — abhi sirf ek JWT hai jo expire hone tak valid rehta
  hai. Short-lived access token + refresh token pattern zyada secure hoga, especially jab
  multi-device login support karna ho.
- [ ] **Dependency audit automation** — `npm audit` ya Dependabot CI me wire karo, taaki
  vulnerable packages (jaise recently `express-rate-limit`, `jsonwebtoken` versions) automatically
  flag hon.
- [ ] **Structured logging** — abhi `console.log`/`morgan` hi hai. Production me kam se kam
  JSON-structured logs (pino/winston) taaki Sentry/log-aggregator ke saath acche se integrate
  ho sake.

---

## P2 — Infra / Architecture

- [ ] **Cloud Storage confirm** *(README roadmap)* — confirm karo Cloudinary ka koi leftover
  reference to nahi hai, pura flow ImageKit se hi ja raha hai.
- [ ] **DB indexing review** — jab data badhega, `quizAttempt` aur `question` collections pe
  common query patterns (userId+quizId, quizId) par index confirm/add karo. Abhi V1 scale pe
  shayad matter nahi karta, but V2 shuru karte hi ek baar check kar lena sasta hai.

---

## P3 — Big Features (apni planning session chahiye)

- [ ] **Advanced Quiz Engine** *(README roadmap)*
  Topic/difficulty-based filtering + evaluation. Naye question types (Fill-ups, Reasoning,
  etc. — abhi sirf MCQ hai).
- [ ] **Content-First Course System** *(README roadmap)*
  Chapters/lessons wale lightweight learning modules, quizzes se alag. Bada feature — apna
  data model, apna planning session chahiye, V2 me sirf "design discussion" tak rakho.
- [ ] **AI-assisted features (Groq SDK already in deps, unused)**
  `groq-sdk` package pehle se `package.json` me hai lekin codebase me kahin call nahi ho raha.
  Agar plan me hai to explicit scope karo — e.g. AI-generated question suggestions for
  instructors, ya auto-explanation for wrong answers. Agar plan me nahi hai, to unused dependency
  hata do taaki confusion na ho ki "ye already ban raha hai kya."

---

## Priority Suggestion (mera personal take)
1. P0 sab pehle — bina tests/CI ke V2 me naye features jodna risky hai, especially jab pichle
   round me hi humne dekha ki "fix kiya" aur "actually shipped" alag cheezein ho sakti hain.
2. Fir Instructor side ka **Question Image + Clone Quiz** — dono chhote, high-value, aur
   ImageKit/duplicate-utils already ready hain.
3. Student **auto-submit server-side reliability** — ye ek chhota sa security/fairness gap ho
   sakta hai, jaldi confirm/fix karne layak hai.
4. Baaki P1/P2 items apni team capacity ke hisaab se order karo.

---

## Notes
- Ye file `V2-BACKLOG.md` ko replace nahi karti — jab items start/complete hon to dono jagah
  (ya sirf ek canonical file rakh lo, do parallel backlog files confusing ho sakti hain) update
  rakhna.
- Doosre AI ko dikhane se pehle: unhe ye bhi batana ki V1 security audit (`v1_bug_recheck_round2.md`)
  already clean confirm hai, taaki wo dobara wahi cheezein na suggest karein.
