import express from "express";

import {
  createQuiz,
  getCourseQuizzes,
  getQuizById,
  updateQuiz,
  publishQuiz,
  deleteQuiz,
} from "../Controllers/quiz.controller.js";

import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/course/:courseId",
  authMiddleware,
  getCourseQuizzes
);

router.get(
  "/:quizId",
  authMiddleware,
  getQuizById
);

router.post(
  "/course/:courseId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  createQuiz
);

router.put(
  "/:quizId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  updateQuiz
);

router.patch(
  "/:quizId/publish",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  publishQuiz
);

router.delete(
  "/:quizId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  deleteQuiz
);

export default router;