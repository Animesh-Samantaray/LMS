import express from "express";
import {
  createReview,
  getCourseReviews,
  getCourseReviewSummary,
  getMyCourseReview,
  updateReview,
  deleteReview,
} from "../Controllers/courseReview.controller.js";
import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";
const router = express.Router();

router.get("/course/:courseId", getCourseReviews);
router.get("/course/:courseId/summary", getCourseReviewSummary);

router.get(
  "/course/:courseId/mine",
  authMiddleware,
  authorizeRoles("Student"),
  getMyCourseReview
);

router.post(
  "/course/:courseId",
  authMiddleware,
  authorizeRoles("Student"),
  createReview
);

router.put(
  "/:reviewId",
  authMiddleware,
  authorizeRoles("Student"),
  updateReview
);

router.delete(
  "/:reviewId",
  authMiddleware,
  authorizeRoles("Student"),
  deleteReview
);

export default router;