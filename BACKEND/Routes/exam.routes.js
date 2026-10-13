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

// get course exams
router.get(
  "/course/:courseId",
  authMiddleware,
  getCourseExams
);

// get my exams
router.get(
  "/student/my-exams",
  authMiddleware,
  getMyExams
);

// get exam by id
router.get(
  "/:examId",
  authMiddleware,
  getExamById
);

// create new exam
router.post(
  "/course/:courseId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  createExam
);

// edit exam details
router.put(
  "/:examId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  updateExam
);

// publish exam
router.patch(
  "/:examId/publish",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  publishExam
);

// delete exam
router.delete(
  "/:examId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  deleteExam
);
// generate exam questions
router.post(
  "/:examId/ai-generate-questions",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  upload.single("document"),
  generateExamQuestions
);
export default router;