const fs = require("fs");
const content = `import express from "express";

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

router.get("/course/:courseId", authMiddleware, getCourseAssignments);
router.get("/:assignmentId", authMiddleware, getAssignmentById);

router.post(
  "/course/:courseId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  upload.single("questionFile"),
  createAssignment
);

router.put(
  "/:assignmentId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  upload.single("questionFile"),
  updateAssignment
);

router.patch(
  "/:assignmentId/publish",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  publishAssignment
);

router.delete(
  "/:assignmentId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  deleteAssignment
);

router.post(
  "/:assignmentId/submit",
  authMiddleware,
  authorizeRoles("Student"),
  upload.array("answerFiles", 10),
  submitAssignment
);

router.get(
  "/:assignmentId/my-submission",
  authMiddleware,
  authorizeRoles("Student"),
  getMySubmission
);

router.get(
  "/:assignmentId/submissions",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  getAssignmentSubmissions
);

router.patch(
  "/submissions/:submissionId/evaluate",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  evaluateSubmission
);

export default router;
`;
fs.writeFileSync("BACKEND/routes/assignment.route.js", content);
`
node create_route.js

