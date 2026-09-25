import express from "express";

import {
  createAssignment,
  getCourseAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  publishAssignment,
} from "../Controllers/assignment.controller.js";
import upload from "../Middlewares/upload.middleware.js";
import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";

const router = express.Router();

// all asgnmts of  course 
router.get("/course/:courseId",authMiddleware, getCourseAssignments);

// assgnmt by its id
router.get("/:assignmentId",authMiddleware, getAssignmentById);

// create
router.post(
  "/course/:courseId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  upload.single("questionFile"),
  createAssignment
);

// updt  assgnmt
router.put(
  "/:assignmentId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  upload.single("questionFile"),
  updateAssignment
);

// publish it 
router.patch(
  "/:assignmentId/publish",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  publishAssignment
);

// deleting  
router.delete(
  "/:assignmentId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  deleteAssignment
);

export default router;