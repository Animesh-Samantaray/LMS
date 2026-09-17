import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./Configs/passport.js";
import connectDB from "./Configs/db.js";
import authRoutes from "./Routes/auth.routes.js";
import studentRoutes from "./Routes/student.route.js";
import instructorRoutes from "./Routes/instructor.route.js";
import adminRoutes from "./Routes/admin.route.js";

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
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

app.listen(PORT, () => {
  console.log(`LMS Server running on port ${PORT}`);
});