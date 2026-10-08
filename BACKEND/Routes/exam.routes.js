import express from "express";

import {
  createExam,
  getCourseExams,
  getExamById,
  getMyExams,
  updateExam,
  publishExam,
  deleteExam,generateExamQuestions
} from "../Controllers/exam.controller.js";
import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";
import upload from "../Middlewares/upload.middleware.js";

const router = express.Router();

router.get(
  "/course/:courseId",
  authMiddleware,
  getCourseExams
);

router.get(
  "/student/my-exams",
  authMiddleware,
  getMyExams
);

router.get(
  "/:examId",
  authMiddleware,
  getExamById
);

router.post(
  "/course/:courseId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  createExam
);

router.put(
  "/:examId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  updateExam
);

router.patch(
  "/:examId/publish",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  publishExam
);

router.delete(
  "/:examId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  deleteExam
);
router.post(
  "/:examId/ai-generate-questions",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  upload.single("document"),
  generateExamQuestions
);
export default router;