import express from "express";

import {
  createQuestion,
  getQuizQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  
} from "../Controllers/quizQuestion.controller.js";

import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";

const router = express.Router();

// get quiz questions
router.get(
  "/quiz/:quizId",
  authMiddleware,
  getQuizQuestions
);

// get question by id
router.get(
  "/:questionId",
  authMiddleware,
  getQuestionById
);

// create question
router.post(
  "/quiz/:quizId",
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