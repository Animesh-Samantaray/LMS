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

router.get(
  "/quiz/:quizId",
  authMiddleware,
  getQuizQuestions
);

router.get(
  "/:questionId",
  authMiddleware,
  getQuestionById
);

router.post(
  "/quiz/:quizId",
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