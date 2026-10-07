import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./Configs/passport.js";
import connectDB from "./Configs/db.js";
import authRoutes from "./Routes/auth.routes.js";
import studentRoutes from "./Routes/student.route.js";
import instructorRoutes from "./Routes/instructor.route.js";
import adminRoutes from "./Routes/admin.route.js";
import categoryRoutes from "./Routes/category.route.js";
import courseRoutes from "./Routes/course.route.js";
import contentRoutes from "./Routes/content.route.js";
import resourceRoutes from "./Routes/resource.route.js";
import assignmentRoutes from "./Routes/assignment.route.js";
import quizQuestionRoutes from "./Routes/quizQuestion.route.js";
import quizRoutes from "./Routes/quiz.route.js";
import analyticsRoutes from "./Routes/analytics.route.js";
import courseReviewRoutes from "./Routes/courseReview.route.js";
import certificateRoutes from "./Routes/certificate.route.js";
import notificationRoutes from "./Routes/notification.route.js";
import discussionRoutes from "./Routes/discussion.routes.js";
import messageRoutes from "./Routes/message.routes.js";
import reportRoutes from "./Routes/report.routes.js";
import practiceRoutes from "./Routes/practice.route.js";
import chatbotRoutes from "./Routes/chatbot.route.js";
import { setSocketIo } from "./Configs/socket.js";
import "./Configs/firebaseAdmin.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.static(path.join(__dirname, 'public')));

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://localhost:5000",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "LMS Backend API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api", contentRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/assignment", assignmentRoutes);
app.use("/api/quiz-questions", quizQuestionRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/reviews", courseReviewRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/chatbot", chatbotRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  },
});

setSocketIo(io);

server.listen(PORT, () => {
  console.log(`LMS Server running on port ${PORT}`);
});