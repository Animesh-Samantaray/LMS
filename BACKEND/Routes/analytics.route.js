import express from "express";
import {
  getStudentDashboardAnalytics,
  getInstructorDashboardAnalytics,
  getCourseDetailedAnalytics,
  getStudentDetailedAnalytics,
  getAdminDashboardAnalytics,
} from "../Controllers/analytics.controller.js";

import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";

const router = express.Router();

// get student dashboard analytics
router.get(
  "/student/dashboard",
  authMiddleware,
  authorizeRoles("Student"),
  getStudentDashboardAnalytics
);

// get instructor dashboard analytics
router.get(
  "/instructor/dashboard",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  getInstructorDashboardAnalytics
);

// get course detailed analytics
router.get(
  "/course/:courseId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  getCourseDetailedAnalytics
);

// get student detailed analytics
router.get(
  "/student/:studentId",
  authMiddleware,
  authorizeRoles("Student", "Instructor", "Admin"),
  getStudentDetailedAnalytics
);

export default router;


// get admin dashboard analytics
router.get(
  "/admin",
  authMiddleware,
  authorizeRoles("Admin"),
  getAdminDashboardAnalytics
);
