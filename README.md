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
## 🔌 API Endpoints Overview

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/register` | Register new user profile in MongoDB | Public (Firebase Bearer) |
| `GET` | `/me` | Get current authenticated user profile & role | Authenticated (2FA verified) |
| `POST` | `/2fa/check` | Check 2FA requirement and send OTP | Authenticated (Bearer) |
| `POST` | `/2fa/verify` | Verify 6-digit 2FA OTP and issue session cookie | Authenticated (Bearer) |
| `POST` | `/2fa/resend` | Resend new 2FA OTP code | Authenticated (Bearer) |
| `POST` | `/2fa/enable` | Enable two-factor authentication on account | Authenticated (Bearer) |
| `POST` | `/2fa/disable` | Disable two-factor authentication | Authenticated (Bearer) |
| `POST` | `/logout` | Invalidate user session & clear cookies | Authenticated |

### Courses (`/api/courses`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/` | Get all published courses | Public |
| `GET` | `/:id` | Get single course details by ID | Public / Enrolled |
| `POST` | `/` | Create new course | Instructor, Admin |
| `PUT` | `/:id` | Edit course information & thumbnail | Instructor, Admin |
| `DELETE` | `/:id` | Delete course | Instructor, Admin |
| `POST` | `/:id/enroll` | Enroll student in course | Student |

### Assignments (`/api/assignment`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/course/:courseId` | Get assignments for course | Authenticated |
| `POST` | `/course/:courseId` | Create new assignment | Instructor, Admin |
| `PUT` | `/:assignmentId` | Edit assignment details | Instructor, Admin |
| `DELETE` | `/:assignmentId` | Delete assignment | Instructor, Admin |
| `POST` | `/:assignmentId/submit` | Student file submission | Student |
| `GET` | `/:assignmentId/submissions` | View all submissions | Instructor, Admin |
| `PATCH` | `/submissions/:submissionId/evaluate` | Grade & evaluate submission | Instructor, Admin |

### Quizzes & Exams (`/api/quizzes`, `/api/exams`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/quizzes/course/:courseId` | Get quizzes for course | Authenticated |
| `POST` | `/api/quizzes` | Create new quiz | Instructor, Admin |
| `POST` | `/api/quizzes/:id/submit` | Submit quiz attempt & score | Student |
| `GET` | `/api/exams` | Get available exams | Authenticated |
| `POST` | `/api/exams/:id/start` | Start timed exam attempt | Student |
| `POST` | `/api/exams/:id/submit` | Submit exam answers | Student |
| `GET` | `/api/exams/:id/leaderboard` | View exam leaderboard | Authenticated |

### Certificates (`/api/certificates`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/my-certificates` | Get all earned certificates | Student |
| `POST` | `/generate/:courseId` | Generate course completion certificate | Student |
| `GET` | `/verify/:code` | Public certificate verification | Public |

### AI Assistant & Chatbot (`/api/chatbot`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/ask` | Ask AI chatbot tutor for help | Authenticated |
| `GET` | `/logs` | View chatbot usage logs and analytics | Admin |

---

## ⚙️ Environment Configuration

### Backend (`BACKEND/.env`)
Create a `.env` file in the `BACKEND/` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/lms?retryWrites=true&w=majority

# Security & Secrets
JWT_SECRET=your_super_secret_jwt_key
SESSION_SECRET=your_session_secret_key
TWO_FACTOR_OTP_SECRET=your_hmac_sha256_otp_secret_key
LMS_2FA_SESSION_SECRET=your_2fa_session_jwt_secret_key
ADMIN_ACCESS_TOKEN=your_admin_registration_passcode

# Cloudinary (Media & Files)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email Service (Nodemailer Gmail SMTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# AI Integrations
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=openai/gpt-oss-120b
GEMINI_API_KEY=your_gemini_api_key

# Payment Gateway (Optional / Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Frontend (`FRONTEND/.env`)
Create a `.env` file in the `FRONTEND/` directory with the following variables:

```env
# Backend API Base URL
VITE_API_BASE_URL=http://localhost:5000

# Firebase Client SDK Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=1:your_app_id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXX
```

---

## 🚀 Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance or free MongoDB Atlas cluster
- **Firebase Account**: Free Firebase project with Authentication (Email/Password & Google providers enabled)

### Step 1: Clone Repository
```bash
git clone https://github.com/Animesh-Samantaray/LMS.git
cd LMS
```

### Step 2: Install Backend Dependencies
```bash
cd BACKEND
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ../FRONTEND
npm install
```

### Step 4: Configure Environment Files
Set up both `BACKEND/.env` and `FRONTEND/.env` as detailed in the [Environment Configuration](#-environment-configuration) section.

### Step 5: Start Development Servers

**Terminal 1 — Backend:**
```bash
cd BACKEND
npm run dev
# Server starts on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd FRONTEND
npm run dev
# Vite dev server starts on http://localhost:5173
```

Open your browser and navigate to `http://localhost:5173`.

---

## 📦 Production Build

To build the frontend for production:
```bash
cd FRONTEND
npm run build
```
The optimized bundle will be created in `FRONTEND/dist`.

To test the production build locally:
```bash
npm run preview
```

---

## 🔒 Security & Best Practices

1. **Token Authentication**: All protected API endpoints verify Firebase ID tokens via the server-side Firebase Admin SDK. Token spoofing is impossible.
2. **Two-Factor Authentication (2FA)**: High-security accounts can toggle 2FA. The backend generates HMAC-SHA256 hashed OTP codes valid for 10 minutes with strict cooldown and attempt thresholds.
3. **CORS & Cookies**: Credentials (`withCredentials: true`) are enforced with `httpOnly` secure cookies to prevent XSS session theft.
4. **Input Sanitization**: Request bodies, names, and emails are normalized, trimmed, and validated before database persistence.

---

## 📄 License
This project is proprietary and developed for LMS educational platform delivery. All rights reserved.