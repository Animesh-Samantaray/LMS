import express from "express";

import {
  createCourse,
  getAllCourses,
  getCourseById,
  getMyCourses,
  updateCourse,
  deleteCourse,
  publishCourse,
  enrollInCourse,
  getStudentEnrolledCourses,
} from "../Controllers/course.controller.js";

import {
  getCourseProgress,
  completeLesson,
} from "../Controllers/progress.controller.js";

import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";
import courseAccessMiddleware from "../Middlewares/courseAccess.middleware.js";

const router = express.Router();

router.get("/", getAllCourses);

router.get(
  "/enrolled/my",
  authMiddleware,
  authorizeRoles("Student", "Instructor", "Admin"),
  getStudentEnrolledCourses
);

router.get(
  "/instructor/my",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  getMyCourses
);

router.get("/:id", getCourseById);

router.post(
  "/:id/enroll",
  authMiddleware,
  authorizeRoles("Student"),
  enrollInCourse
);

router.get(
  "/:id/progress",
  authMiddleware,
  authorizeRoles("Student"),
  courseAccessMiddleware,
  getCourseProgress
);

router.post(
  "/:id/lessons/:lessonId/complete",
  authMiddleware,
  authorizeRoles("Student"),
  courseAccessMiddleware,
  completeLesson
);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  createCourse
);

router.patch(
  "/:id/publish",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  publishCourse
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  updateCourse
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  deleteCourse
);

export default router;