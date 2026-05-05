# 🛡️ Quimora - Quiz Management System

**Quimora** is a robust backend application built for managing online quizzes. It features a secure authentication system and role-based access control (RBAC) to ensure a seamless experience for different user types.

## 🚀 Key Features

- **Role-Based Access Control (RBAC):** Distinct permissions for three different roles:
  - **User:** Can browse and attempt quizzes, and view their own results.

  - **Instructor:** Can create, update, and manage their own quizzes.

  - **Admin:** Full system access, including user management and content moderation.

- **Secure Authentication:** Integrated JWT (JSON Web Tokens) for secure session handling.

- **Password Protection:** Industry-standard password hashing using Bcrypt.

- **Scalable Architecture:** Built with Express.js and Mongoose for high performance and scalability.

## 🛠️ Tech Stack

- **Runtime:** Node.js

- **Framework:** Express.js

- **Database:** MongoDB (via Mongoose ODM)

- **Security:** JWT, Bcrypt ,cors

## ⚙️ Installation & Setup

- Clone the repository:

```
https://github.com/quimoraLabs/quimora.git
```

- Install dependencies:

```
npm install
```

- Configure Environment Variables:
  Create a **.env** file in the root directory and add the following:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

- Start the server:

```
npm run dev
```

## 📂 Project Structure

```hash
├── config/         # Database and environment configurations
├── controllers/    # Route logic and controllers
├── middleware/     # Authentication and Authorization guards
├── models/         # Mongoose Schemas (User, Quiz, Result)
├── routes/         # API Route definitions
├── utils/          # Helper functions (JWT gen, Error handlers, Validators)
└── server.js       # Application entry point
```

## 🔑 API Endpoints

The API is structured into the following modules:

- 🔐 **Auth:** `/api/auth` — Handling user registration, login, and password resets.
- 👤 **Users:** `/api/users` — Profile management and Administrative user controls.
- 📝 **Quizzes:** `/api/quizzes` — Core CRUD operations for quiz management (Admin/Instructor).
- ❓ **Questions:** `/api/quizzes/:quizId/questions` — Managing questions within specific quizzes.
- 📊 **Attempts:** `/api/attempts` — Handling quiz submissions, scoring, and results.


## 🖥️ Management Panels

### 👑 Admin Dashboard
* **User Management:** View, suspend, or delete users/instructors.
* **System Overview:** Monitor total quizzes created and global attempt statistics.
* **Content Moderation:** Ability to flag or remove inappropriate quiz content.

### 🎓 Instructor Panel
* **Quiz Builder:** Interface to add/edit questions, set difficulty, and define topics.
* **Student Analytics:** Detailed reports of how students performed on their specific quizzes.
* **Question Bank:** Manage a personal library of questions.

### 👤 User Portal
* **Personal Dashboard:** View active quizzes, completed attempts, and score history.
* **Leaderboard:** See global ranking based on quiz performance (Optional).

## 🔐 Forgot Password Flow

We use **Email OTP** for password resets to ensure security, reliability, and accessibility across all devices.

### Why Email?
*   **Accessible:** Works even if the user's phone is lost or stolen.
*   **Secure:** Protects against SIM-swapping attacks.
*   **Scalable:** More cost-effective and reliable than SMS.

### Logic
1.  **Request:** User submits email.
2.  **Generate:** A secure 6-digit OTP is created (10-minute expiry).
3.  **Send:** OTP is sent via `Nodemailer` using a professional HTML template.
4.  **Verify:** User enters OTP and new password; backend validates by email.




## 🗺️ Roadmap & Future Enhancements
Quimora is constantly evolving. Here are the planned features and architectural upgrades:

* **Advanced Permissions:** Granular resource-level access (Read/Write/Admin) for content sharing.

* **Security Upgrades:** Implementation of a Password History System to prevent credential reuse.

* **Multi-role Support:** Flexible user architecture allowing individuals to hold multiple roles (e.g., Admin + Instructor).

* **Cloud Storage Migration:** Transitioning from Cloudinary to AWS S3 + CDN for enterprise-grade image handling.

* **Advanced Quiz Engine:** - Topic and Difficulty-based (Easy, Medium, Hard) evaluation.

    * Support for multiple question types (MCQ, Fill-ups, Reasoning, etc.).

* **Content-First Course System:** Lightweight learning modules with structured chapters and lessons.