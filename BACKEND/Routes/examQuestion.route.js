import express from "express";

import {
  createQuestion,
  getExamQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from "../Controllers/examQuestion.controller.js";

import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/exam/:examId",
  authMiddleware,
  getExamQuestions
);

router.get(
  "/:questionId",
  authMiddleware,
  getQuestionById
);

router.post(
  "/exam/:examId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  createQuestion
);

router.put(
  "/:questionId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  updateQuestion
);

router.delete(
  "/:questionId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  deleteQuestion
);

export default router;