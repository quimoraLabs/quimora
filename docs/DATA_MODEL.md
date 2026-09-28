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
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  eloRating: { type: Number, default: 1200 } // V3 adaptive difficulty rating
}, { timestamps: true });
```
* **Indexes:** `{ quizId: 1 }`, `{ eloRating: 1 }`.

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
  interestIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }], // V3 interest tag links
  isPublished: { type: Boolean, default: false },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
}, { timestamps: true });
```
* **Indexes:** `{ instructor: 1 }`, `{ isPublished: 1 }`, `{ interestIds: 1 }`.

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

## 3. V3 Mongoose Schemas (Design Specification)

### 3.1 Interest Schema (`backend/models/interest.model.js`)

```javascript
const interestSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: '' },
  topicTags: [{ type: String, trim: true }],
  icon: { type: String, default: '' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```
* **Indexes:** `{ slug: 1 }` (Unique), `{ topicTags: 1 }`.

---

### 3.2 EloRating Schema (`backend/models/eloRating.model.js`)

```javascript
const eloRatingSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  interestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interest', required: true },
  rating: { type: Number, default: 1000, min: 0 },
  highestRating: { type: Number, default: 1000 },
  quizzesAttempted: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });
```
* **Indexes:** `{ studentId: 1, interestId: 1 }` (Compound Unique).

---

### 3.3 Level Schema (`backend/models/level.model.js`)

```javascript
const levelSchema = new mongoose.Schema({
  levelName: { 
    type: String, 
    required: true, 
    enum: ['Beginner', 'Learner', 'Intermediate', 'Advanced', 'Master', 'Expert'] 
  },
  minElo: { type: Number, required: true },
  maxElo: { type: Number, required: true },
  badge: { type: String, default: '' }, // URL or icon identifier
  description: { type: String, default: '' }
}, { timestamps: true });
```
* **Indexes:** `{ minElo: 1, maxElo: 1 }`.

---

### 3.4 InstructorProfile Schema (`backend/models/instructorProfile.model.js`)

```javascript
const instructorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  expertise: [{ type: String, required: true }],
  bio: { type: String, default: '' },
  rating: { type: Number, default: 5.0, min: 1.0, max: 5.0 },
  totalStudents: { type: Number, default: 0 },
  assignedQuizCount: { type: Number, default: 0 }
}, { timestamps: true });
```
* **Indexes:** `{ userId: 1 }` (Unique).

---

### 3.5 QuizAssignment Schema (`backend/models/quizAssignment.model.js`)

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
