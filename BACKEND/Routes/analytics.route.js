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

router.get(
  "/student/dashboard",
  authMiddleware,
  authorizeRoles("Student"),
  getStudentDashboardAnalytics
);

router.get(
  "/instructor/dashboard",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  getInstructorDashboardAnalytics
);

router.get(
  "/course/:courseId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  getCourseDetailedAnalytics
);

router.get(
  "/student/:studentId",
  authMiddleware,
  authorizeRoles("Student", "Instructor", "Admin"),
  getStudentDetailedAnalytics
);

export default router;


router.get(
  "/admin",
  authMiddleware,
  authorizeRoles("Admin"),
  getAdminDashboardAnalytics
);
