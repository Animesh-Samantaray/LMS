import express from "express";

import {
  createAssignment,
  getCourseAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  publishAssignment,
} from "../Controllers/assignment.controller.js";

import {
  submitAssignment,
  getMySubmission,
  getAssignmentSubmissions,
  evaluateSubmission,
} from "../Controllers/assignmentSubmission.controller.js";

import upload from "../Middlewares/upload.middleware.js";
import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";

const router = express.Router();

// get assignments for course
router.get("/course/:courseId", authMiddleware, getCourseAssignments);

// get assignment by id
router.get("/:assignmentId", authMiddleware, getAssignmentById);

// assignment creating
router.post(
  "/course/:courseId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  upload.single("questionFile"),
  createAssignment
);

// assignment editing
router.put(
  "/:assignmentId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  upload.single("questionFile"),
  updateAssignment
);

// publish or unpublish assignment
router.patch(
  "/:assignmentId/publish",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  publishAssignment
);

// assignment deleting
router.delete(
  "/:assignmentId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  deleteAssignment
);

// student assignment submission
router.post(
  "/:assignmentId/submit",
  authMiddleware,
  authorizeRoles("Student"),
  upload.array("answerFiles", 10),
  submitAssignment
);

// get my assignment submission
router.get(
  "/:assignmentId/my-submission",
  authMiddleware,
  authorizeRoles("Student"),
  getMySubmission
);

// get all submissions for assignment
router.get(
  "/:assignmentId/submissions",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  getAssignmentSubmissions
);

// grade and review submission
router.patch(
  "/submissions/:submissionId/evaluate",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  evaluateSubmission
);

export default router;
