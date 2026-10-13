# LMS Platform - Next-Generation Learning Management System

A full-stack, enterprise-grade Learning Management System (LMS) built with **React 18**, **Vite**, **Node.js**, **Express**, **MongoDB**, and **Firebase Authentication**. Features role-based workspaces for Students, Instructors, and Administrators, real-time Socket.io communication, AI-assisted learning (Groq & Gemini), anti-cheat exam engine, 2FA security, and automated verified certificate generation.

---

## 📑 Table of Contents

- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [User Roles & Portals](#-user-roles--portals)
- [Directory Structure](#-directory-structure)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Environment Configuration](#-environment-configuration)
- [Setup & Installation](#-setup--installation)
- [Development & Scripts](#-development--scripts)
- [Security & Authentication](#-security--authentication)

---

## 🏛 System Architecture

```mermaid
graph TD
    Client["Frontend (React 18 + Vite + Tailwind CSS)"]
    FirebaseAuth["Firebase Authentication"]
    Backend["Backend API (Node.js + Express 5)"]
    Database[("MongoDB Atlas")]
    SocketServer["Socket.io Real-Time Server"]
    Cloudinary["Cloudinary (Media & Documents)"]
    MailService["Nodemailer (Gmail SMTP 2FA)"]
    AIService["Groq SDK & Gemini API"]
    PaymentGateway["Razorpay"]

    Client -->|Social Login / Email Auth| FirebaseAuth
    Client -->|Bearer ID Token + REST Requests| Backend
    Client <-->|WebSockets (Live Chat & Alerts)| SocketServer
    Backend -->|Verify Token & Sync Users| FirebaseAuth
    Backend -->|CRUD Operations| Database
    Backend -->|Asset Storage| Cloudinary
    Backend -->|Send 2FA OTP Codes| MailService
    Backend -->|Chatbot & Question Generation| AIService
    Backend -->|Course Purchase & Webhooks| PaymentGateway
```

---

## ✨ Key Features

### 🔐 1. Authentication & Security
- **Firebase Auth Integration**: Email/Password, Google OAuth popup, and GitHub OAuth sign-in.
- **Auto-Provisioning**: Google sign-in on login automatically provisions a default `Student` profile if new, or navigates straight to role-based dashboard.
- **Two-Factor Authentication (2FA)**: Time-limited 6-digit email OTP with rate-limiting, resend cooldown, and secure `httpOnly` JWT session cookies (`lms_2fa`).
- **Role-Based Access Control (RBAC)**: Strict route and controller protections for `Student`, `Instructor`, and `Admin`.

### 📚 2. Course Management & Delivery
- **Modular Curriculum**: Course creation with chapters, video lessons, downloadable resources, and assignment attachments.
- **Student Learning View**: Smooth video playback, completion tracking, downloadable files, and lecture notes.
- **Reviews & Ratings**: Students rate and review courses with aggregated stars and feedback.

### 📝 3. Assessment, Quiz & Anti-Cheat Exam Engine
- **Quizzes**: Timed interactive quizzes with immediate feedback, explanations, and attempts tracking.
- **AI-Powered Question Generator**: Instructors can auto-generate multiple-choice and conceptual questions using Groq/Gemini.
- **Anti-Cheat Examinations**: Proctored active exam interface with camera preview permission, tab-switch event tracking, countdown timer, auto-submission on expiration, and dynamic leaderboard rankings.
- **Assignments**: File attachments (PDF/ZIP/docs), deadline validation, student submissions, and instructor grading with marks and feedback.

### 💬 4. Real-Time Collaboration & Discussion
- **Socket.io Direct Messaging**: Live 1-on-1 conversations between students and instructors with unread counts and typing status.
- **Discussion Forums**: Course-level public discussion threads and replies.
- **Course Queries**: Dedicated student-to-instructor Q&A ticket desk with status updates (`Pending`, `Answered`, `Resolved`).
- **Live Notifications**: Real-time push alerts for assignment grading, quiz releases, query answers, and course announcements.

### 🎓 5. Verified Digital Certificates
- **Automated Generation**: Instant digital certificate creation upon 100% course completion.
- **Public Verification**: Unique certificate codes with public verification endpoint (`/api/certificates/verify/:id`).
- **PDF Export**: Download high-resolution verified PDF certificates powered by HTML2Canvas & jsPDF.

### 🤖 6. AI Learning Assistant & Chatbot
- **Interactive Tutor**: AI Chatbot available across the app powered by Groq LLaMA models and Google Gemini.
- **Admin Chatbot Logs**: Full administrative audit trail of chatbot inquiries and performance metrics.

### 📊 7. Analytics & Export Engine
- **Visual Analytics**: Interactive KPI charts for enrollment metrics, revenue, completion rates, and cohort benchmarks.
- **Report Exports**: Export platform metrics, user logs, and course performance to CSV and PDF.

---

## 🛠 Tech Stack

### Frontend
| Technology | Description |
|---|---|
| **React 18** | UI framework with Hooks and Context API |
| **Vite** | Next-generation build tool & dev server |
| **Tailwind CSS** | Utility-first styling with modern dark glass design tokens |
| **React Router DOM v6** | Client-side routing with protected role gates |
| **Lucide React** | Modern icon set |
| **Axios** | HTTP client with automatic Firebase token injection |
| **Firebase Web SDK** | Client-side authentication |
| **Socket.io Client** | Real-time WebSocket connection |
| **HTML2Canvas & jsPDF** | Client-side PDF generation for certificates |

### Backend
| Technology | Description |
|---|---|
| **Node.js (v20+)** | Runtime environment |
| **Express 5** | REST API framework |
| **MongoDB & Mongoose 9** | NoSQL database & ODM |
| **Firebase Admin SDK** | Server-side token verification & user management |
| **Socket.io** | WebSocket server for real-time messaging & alerts |
| **Cloudinary** | Cloud storage for course assets, videos, avatars & attachments |
| **Nodemailer** | Gmail SMTP transport for 2FA OTP codes and email alerts |
| **Groq SDK & Gemini API** | AI LLM integration for chatbot and test question creation |
| **Razorpay** | Payment processing for premium courses |
| **JWT & Cookie-Parser** | Secure cookie session management for 2FA |
| **Multer** | Multipart form-data file uploads |

---

## 👥 User Roles & Portals

### 🎓 Student Workspace
- **Personalized Learner Portal**: Enrolled courses overview, progress trackers, and recent activity timeline.
- **My Courses & Learn**: Chapter-by-chapter curriculum, video lectures, and lecture notes.
- **Quiz & Exam Center**: Take timed quizzes, view anti-cheat exam instructions, take active exams, and view leaderboards.
- **Practice Zone**: Interactive coding challenges and problem-solving exercises.
- **Certificates**: View, share, and download verified certificates for completed courses.
- **Student Queries**: Submit questions directly to instructors for enrolled courses.

### 👨‍🏫 Instructor Workspace
- **Instructor Cohort Hub**: Real-time cohort health metrics, learners requiring attention, and active courses.
- **Course Studio**: Create, edit, and organize courses with rich descriptions, pricing, and curriculum modules.
- **Quiz & Exam Studio**: Create quizzes manually or auto-generate questions with AI.
- **Assignment Evaluation**: View submissions, preview answer files, assign grades, and leave feedback.
- **Instructor Queries & Discussions**: Answer student questions and participate in community threads.

### ⚙️ Administrator Workspace
- **Command Center**: Platform-wide operational health, revenue figures, draft courses, and user metrics.
- **User Management**: View all users, search, filter by role, activate/suspend accounts, or update permissions.
- **Course Oversight**: Review draft courses, publish/unpublish, approve instructor content, and manage categories.
- **Chatbot & Audit Logs**: Review AI chatbot logs, system inquiries, and error traces.
- **Exports & Analytics**: Export detailed platform reports to CSV and PDF.

---

## 📂 Directory Structure

```text
SHNOOR/LMS/
├── BACKEND/
│   ├── Configs/                # Database, Firebase Admin, Passport, Socket setups
│   │   ├── db.js
│   │   ├── firebaseAdmin.js
│   │   ├── passport.js
│   │   └── socket.js
│   ├── Controllers/            # Route handler business logic
│   │   ├── admin.controller.js
│   │   ├── analytics.controller.js
│   │   ├── assignment.controller.js
│   │   ├── assignmentSubmission.controller.js
│   │   ├── auth.controller.js
│   │   ├── category.controller.js
│   │   ├── certificate.controller.js
│   │   ├── chatbot.controller.js
│   │   ├── content.controller.js
│   │   ├── course.controller.js
│   │   ├── courseQuery.controller.js
│   │   ├── courseReview.controller.js
│   │   ├── discussion.controller.js
│   │   ├── exam.controller.js
│   │   ├── examAttempt.controller.js
│   │   ├── examQuestion.controller.js
│   │   ├── export.controller.js
│   │   ├── instructor.controller.js
│   │   ├── message.controller.js
│   │   ├── notification.controller.js
│   │   ├── practice.controller.js
│   │   ├── progress.controller.js
│   │   ├── quiz.controller.js
│   │   ├── quizQuestion.controller.js
│   │   ├── report.controller.js
│   │   ├── resource.controller.js
│   │   └── student.controller.js
│   ├── Helpers/                # OTP generators, calculation helpers
│   ├── Middlewares/            # Authentication, role verification, uploads
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── upload.middleware.js
│   │   └── profileUpload.middleware.js
│   ├── Models/                 # Mongoose schemas
│   │   ├── User.model.js
│   │   ├── StudentProfile.model.js
│   │   ├── InstructorProfile.model.js
│   │   ├── Course.model.js
│   │   ├── Content.model.js
│   │   ├── Assignment.model.js
│   │   ├── AssignmentSubmission.model.js
│   │   ├── Quiz.model.js
│   │   ├── Exam.model.js
│   │   ├── Certificate.model.js
│   │   └── ...
│   ├── Routes/                 # Express router definitions
│   │   ├── auth.routes.js
│   │   ├── course.route.js
│   │   ├── student.route.js
│   │   ├── instructor.route.js
│   │   ├── admin.route.js
│   │   └── ...
│   ├── Utils/                  # Nodemailer, Cloudinary uploaders, mail templates
│   ├── .env                    # Backend environment config
│   ├── package.json
│   └── server.js               # Entry point, Express app & Socket.io server
│
├── FRONTEND/
│   ├── src/
│   │   ├── components/         # Reusable UI components & modals
│   │   │   ├── LoadingScreen.jsx      # Interactive orbital pulse loader
│   │   │   ├── Navbar.jsx             # Top navigation with role links
│   │   │   ├── DashboardLayout.jsx    # Sidebar and dashboard wrapper
│   │   │   ├── GoogleAuthButton.jsx   # Social login button
│   │   │   ├── SessionTimeoutModal.jsx# Session inactivity warning
│   │   │   └── ...
│   │   ├── context/            # React context providers
│   │   │   ├── AuthContext.jsx        # Auth state, fast /me sync, 2FA
│   │   │   ├── NotificationContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── pages/              # Route views
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── VerifyTwoFactor.jsx
│   │   │   ├── CourseDetails.jsx
│   │   │   ├── dashboards/
│   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   ├── InstructorDashboard.jsx
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   └── ...
│   │   ├── routes/             # AppRoutes with role-based ProtectedRoute
│   │   │   └── AppRoutes.jsx
│   │   ├── services/           # Axios API service, Firebase auth service
│   │   │   ├── api.service.js
│   │   │   └── firebaseAuth.service.js
│   │   ├── styles/             # Tailwind & theme variables
│   │   │   ├── theme.css       # Obsidian & midnight glass color tokens
│   │   │   └── index.css       # Global styles, smooth scroll & scrollbars
│   │   └── utils/              # Helper functions & route paths
│   ├── .env                    # Frontend environment config
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md                   # Project documentation
```

---
