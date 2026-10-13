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

// get course reviews
router.get("/course/:courseId", getCourseReviews);
// get course review summary
router.get("/course/:courseId/summary", getCourseReviewSummary);

// get my course review
router.get(
  "/course/:courseId/mine",
  authMiddleware,
  authorizeRoles("Student"),
  getMyCourseReview
);

// create review
router.post(
  "/course/:courseId",
  authMiddleware,
  authorizeRoles("Student"),
  createReview
);

// update review
router.put(
  "/:reviewId",
  authMiddleware,
  authorizeRoles("Student"),
  updateReview
);

// delete review
router.delete(
  "/:reviewId",
  authMiddleware,
  authorizeRoles("Student"),
  deleteReview
);

export default router;