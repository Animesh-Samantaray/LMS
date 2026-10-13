import express from "express";

import {
  createQuiz,
  getCourseQuizzes,
  getQuizById,
  updateQuiz,
  publishQuiz,
  deleteQuiz,
  evaluateQuiz,
  getMyQuizzes,
  generateQuizQuestions
} from "../Controllers/quiz.controller.js";

import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";
import documentUpload from "../Middlewares/documentUpload.middleware.js";
import multer from "multer";

const router = express.Router();

const uploadDocument = (req, res, next) => {
  documentUpload.single("document")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      const message = error.code === "LIMIT_FILE_SIZE"
        ? "Document must be 10 MB or smaller"
        : "Only PDF, DOCX, and TXT documents are supported";
      return res.status(400).json({ success: false, message });
    }
    if (error) return res.status(400).json({ success: false, message: "Invalid document upload" });
    return next();
  });
};

// get course quizzes
router.get(
  "/course/:courseId",
  authMiddleware,
  getCourseQuizzes
);

// get my quizzes
router.get(
  "/student/my-quizzes",
  authMiddleware,
  getMyQuizzes
);

// get quiz details by id
router.get(
  "/:quizId",
  authMiddleware,
  getQuizById
);

// create new quiz
router.post(
  "/course/:courseId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  createQuiz
);

// edit quiz details
router.put(
  "/:quizId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  updateQuiz
);

// generate quiz questions
router.post(
  "/:quizId/ai-generate-questions",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  uploadDocument,
  generateQuizQuestions
);

// publish quiz
router.patch(
  "/:quizId/publish",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  publishQuiz
);

// delete quiz
router.delete(
  "/:quizId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  deleteQuiz
);

// evaluate quiz
router.post(
  "/:quizId/evaluate",
  authMiddleware,
  authorizeRoles("Student"),
  evaluateQuiz
);

export default router;