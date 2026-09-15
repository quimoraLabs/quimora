# Quimora — Data Model Specification (Layer 3)

> **Document Type:** Layer 3 Mongoose Schema & Entity Specification  
> **Database Engine:** MongoDB + Mongoose 9.x ODM  
> **Last Updated:** 2026-09-15  

---

## 1. Entity-Relationship Schema Map

```
┌─────────────────┐       1:N       ┌─────────────────┐
│      User       │ ───────────────►│      Quiz       │
│ (Student/Inst)  │                 │  (Created By)   │
└────────┬────────┘                 └────────┬────────┘
         │                                   │
         │ 1:N                               │ 1:N
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│   QuizAttempt   │ ───────────────►│    Question     │
│ (Student score) │       N:1       │ (Quiz item)     │
└─────────────────┘                 └─────────────────┘
```

---

## 2. Core Mongoose Schemas

### 2.1 User Schema (`backend/models/user.model.js`)

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'instructor', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  resetPasswordOTP: { type: String, default: null },
  resetPasswordOTPExpires: { type: Date, default: null }
}, { timestamps: true });
```
* **Indexes:** `{ email: 1 }` (Unique).

---

### 2.2 Question Schema (`backend/models/question.model.js`)

```javascript
const questionSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  questionText: { type: String, required: true },
  options: [{
    optionText: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  marks: { type: Number, default: 1 },
  explanation: { type: String, default: '' },
  category: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
}, { timestamps: true });
```
* **Indexes:** `{ quizId: 1 }`.

---

### 2.3 Quiz Schema (`backend/models/quiz.model.js`)

```javascript
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duration: { type: Number, required: true }, // duration in minutes
  passingScore: { type: Number, default: 40 }, // percentage
  totalMarks: { type: Number, default: 0 },
  categories: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
}, { timestamps: true });
```
* **Indexes:** `{ instructor: 1 }`, `{ isPublished: 1 }`.

---

### 2.4 QuizAttempt Schema (`backend/models/quizAttempt.model.js`)

```javascript
const quizAttemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  responses: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: { type: Number, default: null }, // option index (0-based)
    isCorrect: { type: Boolean, default: false },
    marksObtained: { type: Number, default: 0 }
  }],
  score: { type: Number, default: 0 },
  percentage: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  timeSpentSeconds: { type: Number, default: 0 },
  status: { type: String, enum: ['in-progress', 'completed', 'abandoned'], default: 'in-progress' },
  startedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null }, // Server-side hard deadline
  completedAt: { type: Date, default: null }
}, { timestamps: true });
```
* **Indexes:** `{ student: 1, quiz: 1 }`, `{ quiz: 1, score: -1 }` (Leaderboard indexing).

---

## 3. Data Integrity & Cascade Deletion Rules

* **Quiz Deletion**: When a `Quiz` is deleted by an instructor, all associated `Question` records referencing that `quizId` must be deleted in a transactional middleware pre-hook or explicit deletion logic.
* **Response Sanitization**: On student fetch endpoints (`GET /api/questions/quiz/:quizId`), the `isCorrect` flag inside `options` is stripped to prevent client-side answer key leaks in browser dev tools.
