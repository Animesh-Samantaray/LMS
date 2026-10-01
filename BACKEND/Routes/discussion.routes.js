
import express from "express";

import {
  getCourseDiscussion,
  deleteDiscussion,
} from "../Controllers/discussion.controller.js";
import authorizeRoles from "../Middlewares/role.middleware.js";
import authMiddleware from "../Middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/course/:courseId",
  authMiddleware,
  getCourseDiscussion
);

router.delete(
  "/:discussionId",
  authMiddleware,
  authorizeRoles("Admin","Instructor"),
  deleteDiscussion
);

export default router;