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

// start exam attempt
router.post(
  "/exam/:examId/start",
  authMiddleware,
  authorizeRoles("Student"),
  startExamAttempt
);

// get active attempt
router.get(
  "/exam/:examId/active",
  authMiddleware,
  authorizeRoles("Student"),
  getActiveAttempt
);

// save exam answers
router.put(
  "/:attemptId/answers",
  authMiddleware,
  authorizeRoles("Student"),
  saveExamAnswers
);

// submit exam attempt
router.post(
  "/:attemptId/submit",
  authMiddleware,
  authorizeRoles("Student"),
  submitExam
);

// get exam result
router.get(
  "/:attemptId/result",
  authMiddleware,
  getExamResult
);

// get exam leaderboard ranking
router.get(
  "/exam/:examId/leaderboard",
  authMiddleware,
  getExamLeaderboard
);

export default router;
