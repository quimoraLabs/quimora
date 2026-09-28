# Quimora — API Reference Guide (Layer 2)

> **Document Type:** Layer 2 Authoritative API Contract  
> **Base URL:** `http://localhost:5000/api/v1` (Development)  
> **Last Updated:** 2026-09-28  

---

## 0. Health & System Monitoring (`/health` & `/api/v1/health`)

### `GET /health` & `GET /api/v1/health`
* **Access:** Public (Load Balancer & Monitoring Agents)
* **Success Response (200 OK):**
  ```json
  {
    "status": "ok",
    "message": "Quimora Server is healthy and operational",
    "uptimeSeconds": 1420,
    "timestamp": "2026-09-28T19:54:00.000Z",
    "environment": "development",
    "redis": "connected"
  }
  ```

---

## 1. Authentication Endpoints (`/api/v1/auth`)

### `POST /api/v1/auth/register`
* **Access:** Public
* **Request Body:** `{ "name": "...", "email": "...", "password": "...", "role": "user" }`
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

## 2. V3 Interest & Discovery Endpoints (`/api/v1/interests` & `/api/v1/student/interests`)

### `GET /api/v1/interests`
* **Access:** Public
* **Description:** Fetch all active interest topics and category tags.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      { "_id": "65a...", "name": "Web Development", "slug": "web-dev", "topicTags": ["React", "Node.js"] }
    ]
  }
  ```

### `POST /api/v1/student/interests`
* **Access:** Student (`user`)
* **Request Body:** `{ "interestIds": ["65a...", "65b..."] }`
* **Success Response (200 OK):** Selected interests saved to student profile.

### `GET /api/v1/student/quizzes`
* **Access:** Student (`user`)
* **Query Params:** `interestId` (optional), `level` (optional)
* **Description:** List published quizzes matching student selected interests and Elo level.

---

## 3. V3 Elo, Level & Student Profile Endpoints (`/api/v1/student`)

### `GET /api/v1/student/elo`
* **Access:** Student (`user`)
* **Description:** Fetch current Elo ratings across all interest categories.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      { "interestId": "65a...", "interestName": "Web Development", "rating": 1250, "quizzesAttempted": 5 }
    ]
  }
  ```

### `GET /api/v1/student/level`
* **Access:** Student (`user`)
* **Description:** Fetch mapped student level tier, badge, and progress to next level.
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "levelName": "Intermediate",
      "minElo": 1200,
      "maxElo": 1400,
      "currentElo": 1250,
      "badge": "intermediate-shield.png"
    }
  }
  ```

---

## 4. V3 Instructor Assignment & Student Consent Endpoints

### `GET /api/v1/student/quiz/:quizId/instructor`
* **Access:** Student (`user`)
* **Description:** Fetch assigned primary instructor profile (name, bio, expertise, overall rating) before attempt start.

### `POST /api/v1/student/quiz/:quizId/consent`
* **Access:** Student (`user`)
* **Description:** Record explicit student consent to attempt quiz under assigned instructor.
* **Request Body:** `{ "consented": true }`
* **Success Response (200 OK):** Consent recorded token returned.

---

## 5. Core Quiz & Attempt Endpoints (`/api/v1/quizzes` & `/api/v1/student/quiz`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/quizzes` | Instructor, Admin | Create a new quiz. |
| `GET` | `/api/v1/quizzes/:id` | Private | Fetch detailed quiz info and questions. |
| `PUT` | `/api/v1/quizzes/:id` | Creator, Admin | Update quiz title, description, timeLimit, passingScore. |
| `POST` | `/api/v1/quizzes/:quizId/clone` | Instructor, Admin | 1-Click clone quiz and duplicate all associated questions. |
| `GET` | `/api/v1/student/quiz/:quizId/eligibility` | Student | Verify attempt eligibility, active sessions, and remaining attempts. |
| `POST` | `/api/v1/student/quiz/start` | Student | Start session (Requires pre-quiz consent verification). |
| `POST` | `/api/v1/student/quiz/submit` | Student | Submit answers; triggers Elo score computation & updates. |

---

## 6. Groq AI Integration Endpoints (`/api/v1/instructor/ai`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/instructor/ai/generate-questions` | Instructor, Admin | Generate standard MCQs via Groq AI SDK (`topic`, `count`, `difficulty`). |
| `POST` | `/api/v1/instructor/ai/generate-questions/elo` | Instructor, Admin | Generate MCQs calibrated to target Elo rating range ($K = 32$). |
| `POST` | `/api/v1/instructor/ai/generate-description` | Instructor, Admin | Auto-generate quiz description via Groq AI SDK. |

---

## 7. Admin & Analytics Control Endpoints (`/api/v1/admin` & `/api/v1/users`)

| Method | Endpoint | Access Role | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/stats` | Admin | Platform-wide stats (total users, quizzes, attempts). |
| `GET` | `/api/v1/instructor/analytics/:quizId` | Primary Inst, Admin | Detailed analytics (student names, scores, submission timestamps). |
| `GET` | `/api/v1/instructor/analytics/:quizId/aggregate` | External Inst | Anonymized aggregate analytics (pass rate, average, score histogram). |
| `GET` | `/api/v1/users` | Admin | List registered users with role filter & pagination. |
| `PATCH` | `/api/v1/users/:userId/active` | Admin | Toggle user active/suspended state. |
| `PATCH` | `/api/v1/users/:userId/role` | Admin | Role elevation (`user` <-> `instructor` <-> `admin`). |
