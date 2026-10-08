import express from "express";
import {
  startExamAttempt,
  getActiveAttempt,
  saveExamAnswers,
  submitExam,
  getExamResult,
  getExamLeaderboard,
} from "../Controllers/examAttempt.controller.js";
import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/exam/:examId/start",
  authMiddleware,
  authorizeRoles("Student"),
  startExamAttempt
);

router.get(
  "/exam/:examId/active",
  authMiddleware,
  authorizeRoles("Student"),
  getActiveAttempt
);

router.put(
  "/:attemptId/answers",
  authMiddleware,
  authorizeRoles("Student"),
  saveExamAnswers
);

router.post(
  "/:attemptId/submit",
  authMiddleware,
  authorizeRoles("Student"),
  submitExam
);

router.get(
  "/:attemptId/result",
  authMiddleware,
  getExamResult
);

router.get(
  "/exam/:examId/leaderboard",
  authMiddleware,
  getExamLeaderboard
);

export default router;
