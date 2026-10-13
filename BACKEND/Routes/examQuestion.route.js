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

// get exam questions
router.get(
  "/exam/:examId",
  authMiddleware,
  getExamQuestions
);

// get question by id
router.get(
  "/:questionId",
  authMiddleware,
  getQuestionById
);

// create question
router.post(
  "/exam/:examId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  createQuestion
);

// update question
router.put(
  "/:questionId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  updateQuestion
);

// delete question
router.delete(
  "/:questionId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  deleteQuestion
);

export default router;