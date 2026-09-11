# 🎓 Quimora — Modern Quiz & Learning Management Platform

![Quimora Banner](https://img.shields.io/badge/Quimora-Full--Stack%20LMS-6366f1?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20v18%2B-339933?style=for-the-badge&logo=nodedotjs)
![Express.js](https://img.shields.io/badge/Framework-Express%20v5-000000?style=for-the-badge&logo=express)
![React](https://img.shields.io/badge/Frontend-React%20v19-61DAFB?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Bundler-Vite%20v8-646CFF?style=for-the-badge&logo=vite)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?style=for-the-badge&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20v4-06B6D4?style=for-the-badge&logo=tailwindcss)
![License](https://img.shields.io/badge/License-ISC-blue?style=for-the-badge)

**Quimora** is a high-performance, full-stack online quiz management and e-learning platform. Built with modern web technologies, Quimora offers role-based user management (Students, Instructors, Admins), flexible grading engines with negative marking, secure OTP-based password resets, and comprehensive analytics dashboards.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **Role-Based Access Control (RBAC)**: Enforced via modular middleware (`authorizeRoles`) for `student`, `instructor`, and `admin`.
- **JWT Session Tokens**: Secure HTTP header token authentication with configurable expiry.
- **Bcrypt Password Hashing**: Industry-standard salt rounds for user credentials.
- **Email OTP Password Reset**: Professional HTML email OTPs sent via Nodemailer (10-minute security window).
- **Account Protection**: Admin self-protection and last-admin deactivation prevention guards.

### 📝 Quiz & Grading Engine
- **Flexible Scoring System**: Configurable passing percentage and question-level marks.
- **Negative Marking Penalty**: Granular negative marking per quiz attempt submission.
- **Real-Time Attempt Evaluation**: Automated calculation of score, total marks, percentage, passed/failed status, and time taken.
- **Bulk Question Management**: API endpoints for single or bulk question creation.

### 📊 Role Dashboards & Portals

#### 👑 Admin Panel
- **User Management**: View, search, filter, activate, deactivate, or delete user accounts.
- **System Overview Stats**: Monitor active users, student attempt success rates, completion rates, and instructor quiz metrics.
- **User Modal Inspector**: Detailed view of student attempts and instructor quiz stats.

#### 🎓 Instructor Panel
- **Quiz Creator & Manager**: Full CRUD operations for quizzes (draft vs published status).
- **Question Bank**: Add multiple-choice questions (MCQs), options, correct answers, and explanations.
- **Performance Analytics**: View total attempts, average student scores, and completion metrics per quiz.

#### 👤 Student Portal
- **Interactive Quiz Player**: Clean assessment UI with question navigation, timer, and option selection.
- **Instant Result Screen**: Detailed score report displaying marks, pass/fail badge, breakdown, and correct answers.
- **Attempt History**: Track performance progression over time.

---

## 🏗️ Architecture & Project Structure

Quimora follows a clean monorepo structure separating the React client frontend, Express API backend, AI agent guidelines, and project backlog tracking.

```
quimora/
├── 📁 backend/                # Express 5 REST API & Node.js server
│   ├── 📁 api/                # Application entry point (server.js)
│   ├── 📁 config/             # DB & ImageKit configuration
│   ├── 📁 controllers/        # Route business logic (auth, user, quiz, admin, attempt)
│   ├── 📁 helpers/            # Modular helper functions
│   ├── 📁 middleware/         # Auth, RBAC, error handling guards
│   ├── 📁 models/             # Mongoose schemas (User, Quiz, Question, QuizAttempt)
│   ├── 📁 routes/             # API endpoint routing declarations
│   ├── 📁 services/           # Business logic & attempt grading engines
│   └── 📁 utils/              # Email transporter, JWT, grading utilities
│
├── 📁 frontend/               # React 19 + Vite + Tailwind v4 Web Application
│   ├── 📁 src/
│   │   ├── 📁 api/            # Axios API client & interceptors
│   │   ├── 📁 components/     # Reusable UI components & modals
│   │   ├── 📁 features/       # Feature-driven modules (admin, quiz, auth, student)
│   │   ├── 📁 layouts/        # App navbar, footer & sidebar layouts
│   │   ├── 📁 pages/          # Page routes (Admin Dashboard, Quiz List, Result)
│   │   ├── 📁 routes/         # React Router configuration & RBAC route guards
│   │   └── 📁 store/          # Zustand global state management
│   └── index.html
│
├── 📁 agent/                  # AI coding assistant guidelines (agent.md)
├── 📁 docs/                   # Organized project documentation & logs
│   ├── 📁 bugs/               # Security audit recheck reports (v1_bug_recheck.md, round2.md)
│   └── 📁 implementation/     # Plans, deployment guide, V2 backlog & completion report
├── 📄 package.json            # Root workspace scripts & concurrent runner
└── 📄 README.md               # Main project documentation
```

---

## 🛠️ Tech Stack

| Domain | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19 | Core UI Library |
| | Vite 8 | Lightning-fast frontend build tool & HMR |
| | Tailwind CSS v4 | Utility-first CSS styling engine |
| | Zustand 5 | Lightweight & fast state management |
| | React Router 7/8 | Client-side routing with role protection |
| | Lucide React & Motion | Modern UI icons & smooth animation engine |
| **Backend** | Node.js & Express 5 | Asynchronous JavaScript runtime & web framework |
| | MongoDB & Mongoose | NoSQL document database & ODM |
| | JWT & Bcrypt | Authentication & hashing |
| | ImageKit | Cloud image asset management |
| | Nodemailer | Transactional OTP email engine |
| **Dev Tools** | Nodemon | Server hot-reloading |
| | Concurrently | Single command multi-process runner |

---

## ⚙️ Installation & Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas connection URI)
- `npm` (v9.0.0 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/quimoraLabs/quimora.git
cd quimora
```

### 2. Install Dependencies
Install dependencies for root, backend, and frontend with one command:
```bash
npm run install:all
```

*Alternatively, install manually:*
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Environment Configuration

Create `.env` files in both `backend` and `frontend` directories using the provided templates:

#### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
API_PREFIX=/api/v1
MONGO_URI=mongodb://localhost:27017/quimora
JWT_SECRET=your_jwt_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint
```

#### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### 4. Run Development Environment
Start both backend (Nodemon on port 5000) and frontend (Vite dev server) concurrently:

```bash
npm run dev
```

The application will be accessible at:
- **Frontend App**: `http://localhost:5173` (or Vite assigned port)
- **Backend REST API**: `http://localhost:5000/api/v1`

---

## 🔑 Key API Endpoints

### 🔐 Authentication (`/api/v1/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register new student or instructor | Public |
| `POST` | `/login` | Authenticate user & receive JWT | Public |
| `POST` | `/forgot-password` | Send OTP email for password reset | Public |
| `POST` | `/verify-otp` | Validate OTP & reset password | Public |

### 👥 User & Admin Management (`/api/v1/users` & `/api/v1/admin`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/users` | Get all users (filterable by role) | Admin |
| `GET` | `/admin/stats` | System overview stats & performance metrics | Admin |
| `PATCH` | `/users/:userId/active` | Toggle user active/deactivated state | Admin |
| `DELETE` | `/users/:userId` | Permanently delete user | Admin |

### 📝 Quizzes & Attempts (`/api/v1/quizzes` & `/api/v1/attempts`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/quizzes` | Fetch all published quizzes | Public / Student |
| `POST` | `/quizzes` | Create a new quiz | Instructor / Admin |
| `POST` | `/quizzes/:quizId/questions` | Add question to quiz | Instructor / Admin |
| `POST` | `/attempts/start` | Initialize quiz attempt | Student |
| `POST` | `/attempts/submit` | Submit answers & trigger grading engine | Student |

---

## 👑 Role Permission Matrix

| Feature | Student | Instructor | Admin |
| :--- | :---: | :---: | :---: |
| Browse & Attempt Quizzes | ✅ | ❌ | ❌ |
| View Personal Scores & Breakdown | ✅ | ❌ | ❌ |
| Create & Manage Quizzes | ❌ | ✅ | ✅ |
| View Quiz Analytics (Submissions) | ❌ | ✅ | ✅ |
| Manage All System Users | ❌ | ❌ | ✅ |
| Activate / Deactivate Accounts | ❌ | ❌ | ✅ |
| System Performance Overview | ❌ | ❌ | ✅ |

---

## 🗺️ Roadmap & Future Enhancements

- [ ] **Question Diagrams**: Support image attachments on questions via ImageKit.
- [ ] **Quiz Cloning**: 1-click quiz duplicate feature for instructors.
- [ ] **Content Moderation**: Flagged quiz review interface for admins.
- [ ] **Granular Role Elevation**: Change user role directly from Admin panel.
- [ ] **Learning Modules**: Course chapters and lessons alongside standalone quizzes.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/quimoraLabs/quimora/issues).

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.
