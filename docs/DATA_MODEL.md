# Quimora — Data Model Specification (Layer 3)

> **Document Type:** Layer 3 Mongoose Schema & Entity Specification  
> **Database Engine:** MongoDB + Mongoose 9.x ODM  
> **Last Updated:** 2026-09-28  

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

                       [ V3 EXTENSIONS ]
┌─────────────────┐   1:N   ┌─────────────────┐   1:N   ┌─────────────────┐
│    Interest     │ ◄───────│    EloRating    │ ───────►│      Level      │
│  (Topic tags)   │         │ (Student Elo)   │         │ (Rank badges)   │
└─────────────────┘         └─────────────────┘         └─────────────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐  1:1   ┌──────────────────┐
│InstructorProfile │ ◄─────►│  QuizAssignment  │
│  (Bio & Rating)  │        │ (1 Quiz = 1 Inst)│
└──────────────────┘        └──────────────────┘
```

---

## 2. Core Mongoose Schemas (V1 / V2 Implemented)

### 2.1 User Schema (`backend/models/user.model.js`)

```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true },
  avatar: { url: { type: String }, fileId: { type: String } },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['user', 'instructor', 'admin'], default: 'user' },
  active: { type: Boolean, default: true },
  suspendedAt: { type: Date, default: null },
  suspendedReason: { type: String, default: null },
  lastLoginAt: { type: Date, default: null },
  lastUsernameChangedAt: { type: Date, default: null },
  otp: {
    code: { type: String, select: false },
    expiresAt: { type: Date },
    purpose: { type: String, enum: ['reset', 'verify', 'login'] }
  }
}, { timestamps: true, versionKey: false });
```
* **Indexes:** `{ email: 1 }` (Unique), `{ username: 1 }` (Unique), `{ role: 1, active: 1 }`.

---

### 2.2 StudentProfile Schema (`backend/models/studentProfile.model.js`)

```javascript
const studentProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  interests: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }],
    validate: [
      function (val) { return val.length <= 10; },
      'Student cannot select more than 10 interests'
    ]
  },
  onboardingCompleted: { type: Boolean, default: false },
  totalAttempts: { type: Number, default: 0 },
  totalQuizzesAttempted: { type: Number, default: 0 },
  lastAttemptAt: { type: Date, default: null }
}, { timestamps: true, versionKey: false });
```
* **Indexes:** `{ userId: 1 }` (Unique).

---

### 2.3 InstructorProfile Schema (`backend/models/instructorProfile.model.js`)

```javascript
const instructorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  expertise: {
    type: [{ type: String, trim: true }],
    validate: [
      function (val) { return val.length >= 1; },
      'Instructor must specify at least 1 area of expertise'
    ]
  },
  bio: { type: String, default: '' },
  rating: { type: Number, default: 5.0, min: 1.0, max: 5.0 },
  totalStudents: { type: Number, default: 0 },
  totalQuizzes: { type: Number, default: 0 }
}, { timestamps: true, versionKey: false });
```
* **Indexes:** `{ userId: 1 }` (Unique).

---

### 2.4 EloRating Schema (`backend/models/eloRating.model.js`)

```javascript
const eloRatingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  interestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interest', required: true },
  rating: { type: Number, default: 1000, min: 0 },
  highestRating: { type: Number, default: 1000 },
  quizzesAttempted: { type: Number, default: 0 },
  isArchived: { type: Boolean, default: false },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true, versionKey: false });
```
* **Indexes:** `{ studentId: 1, interestId: 1 }` (Compound Unique).

---

### 2.5 Interest Schema (`backend/models/interest.model.js`)

```javascript
const interestSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String, default: '', trim: true },
  topicTags: [{ type: String, trim: true }],
  icon: { type: String, default: '' },
  isCore: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isActive: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });
```
* **Indexes:** `{ slug: 1 }` (Unique), `{ topicTags: 1 }`, `{ isCore: 1 }`, `{ createdBy: 1 }`.

---

### 2.6 QuizAssignment Schema (`backend/models/quizAssignment.model.js`)

```javascript
const quizAssignmentSchema = new mongoose.Schema({
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true, unique: true },
  instructorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['primary', 'backup'], default: 'primary' },
  assignedAt: { type: Date, default: Date.now }
}, { timestamps: true });
```
* **Indexes:** `{ quizId: 1 }` (Unique - One quiz = one primary instructor assignment), `{ instructorId: 1 }`.

---

## 4. Data Integrity & Cascade Deletion Rules

* **Quiz Deletion**: When a `Quiz` is deleted by an instructor, all associated `Question` records referencing that `quizId` and corresponding `QuizAssignment` records must be deleted in transactional middleware.
* **Response Sanitization**: On student fetch endpoints (`GET /api/v1/student/quiz/:quizId`), the `isCorrect` flag inside `options` is stripped to prevent client-side answer key leaks in browser dev tools.
* **Instructor Data Scope Isolation**: Endpoints for instructor analytics enforce checks to return detailed student responses only when `req.user.id === quizAssignment.instructorId`.
