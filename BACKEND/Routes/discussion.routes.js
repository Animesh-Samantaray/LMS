
import express from "express";

import {
  getMyDiscussions,
  getCourseDiscussion,
  getDiscussionMembers,
  deleteDiscussion,
} from "../Controllers/discussion.controller.js";
import authorizeRoles from "../Middlewares/role.middleware.js";
import authMiddleware from "../Middlewares/auth.middleware.js";

const router = express.Router();

// get my discussions
router.get("/my", authMiddleware, getMyDiscussions);

// get course discussion
router.get(
  "/course/:courseId",
  authMiddleware,
  getCourseDiscussion
);

// get discussion members
router.get(
  "/:discussionId/members",
  authMiddleware,
  getDiscussionMembers
);

// delete discussion
router.delete(
  "/:discussionId",
  authMiddleware,
  authorizeRoles("Admin", "Instructor"),
  deleteDiscussion
);

export default router;