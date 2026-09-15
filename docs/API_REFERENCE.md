# Quimora — API Reference Guide (Layer 2)

> **Document Type:** Layer 2 Authoritative API Contract  
> **Base URL:** `http://localhost:5000/api/v1` (Development)  
> **Last Updated:** 2026-09-15  

---

## 1. Authentication Endpoints (`/api/v1/auth`)

### `POST /api/v1/auth/register`
* **Access:** Public
* **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "instructor" // "user" | "instructor" | "admin"
  }
  ```
* **Success Response (201 Created):** Returns JWT token and user profile object.

### `POST /api/v1/auth/login`
* **Access:** Public
* **Request Body:** `{ "email": "...", "password": "..." }`
* **Success Response (200 OK):** Returns JWT token and user profile object.

### `GET /api/v1/auth/me`
* **Access:** Private (Authenticated User)
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):** Returns current user profile details.

### `PATCH /api/v1/auth/request-otp`
* **Access:** Public
* **Request Body:** `{ "email": "user@example.com" }`
* **Action:** Sends 6-digit OTP to user email for password reset.

---

## 2. Quiz Management Endpoints (`/api/v1/quizzes`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/quizzes` | Instructor, Admin | Create a new quiz. |
| `GET` | `/api/v1/quizzes/student` | Student | List all active & published quizzes available to students. |
| `GET` | `/api/v1/quizzes/instructor` | Instructor, Admin | Fetch quizzes created by the logged-in instructor. |
| `GET` | `/api/v1/quizzes/:id` | Private | Fetch detailed quiz info and questions. |
| `PUT` | `/api/v1/quizzes/:id` | Creator, Admin | Update quiz title, description, timeLimit, passingScore. |
| `POST` | `/api/v1/quizzes/:quizId/clone` | Instructor, Admin | 1-Click clone quiz and duplicate all associated questions. |
| `DELETE` | `/api/v1/quizzes/:id` | Creator, Admin | Delete a quiz and dependent questions. |

---

## 3. Student Attempt Engine (`/api/v1/student`)

### `GET /api/v1/student/quiz/:quizId/eligibility`
* **Access:** Student (`user`)
* **URL Params:** `quizId` (MongoDB ObjectId)
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "isEligible": true,
      "hasActiveSession": false,
      "activeAttemptId": null,
      "attemptsRemaining": 2,
      "remainingTimeSeconds": 1800
    }
  }
  ```

### `POST /api/v1/student/quiz/start`
* **Access:** Student (`user`)
* **Request Body:** `{ "quizId": "..." }`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Quiz session initialized successfully",
    "data": {
      "attemptId": "65b...",
      "startedAt": "2026-09-15T16:00:00.000Z",
      "remainingTimeSeconds": 1800,
      "quiz": {
        "_id": "...",
        "title": "Node.js Fundamentals",
        "timeLimit": 30,
        "totalQuestions": 10,
        "questions": [ /* sanitized options (no isCorrect) */ ]
      }
    }
  }
  ```

### `PATCH /api/v1/student/quiz/save-draft`
* **Access:** Student (`user`)
* **Request Body:**
  ```json
  {
    "attemptId": "65b...",
    "userAnswers": [
      { "questionId": "...", "selectedOption": 1 }
    ]
  }
  ```
* **Success Response (200 OK):** Draft state saved.

### `POST /api/v1/student/quiz/submit`
* **Access:** Student (`user`)
* **Request Body:**
  ```json
  {
    "attemptId": "65b...",
    "answers": [
      { "questionId": "...", "selectedOption": 0 }
    ]
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Quiz submitted successfully",
    "data": {
      "attemptId": "...",
      "score": 8,
      "totalMarks": 10,
      "percentage": 80,
      "passed": true,
      "timeSpentSeconds": 420
    }
  }
  ```

---

## 4. Groq AI Integration Endpoints (`/api/v1/instructor/ai`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/instructor/ai/generate-questions` | Instructor, Admin | Generate MCQs via Groq AI SDK (`topic`, `count`, `difficulty`). |
| `POST` | `/api/v1/instructor/ai/generate-description` | Instructor, Admin | Auto-generate quiz description via Groq AI SDK. |

---

## 5. Admin Control Endpoints (`/api/v1/admin` & `/api/v1/users`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/stats` | Admin | Platform-wide stats (total users, quizzes, attempts). |
| `GET` | `/api/v1/users` | Admin | List registered users with role filter & pagination. |
| `PATCH` | `/api/v1/users/:userId/active` | Admin | Toggle user active/suspended state. |
| `PATCH` | `/api/v1/users/:userId/role` | Admin | Role elevation (`user` ↔ `instructor` ↔ `admin`) with last-admin protection. |

