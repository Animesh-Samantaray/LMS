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

// get all published courses
router.get("/", getAllCourses);

// get student enrolled courses
router.get(
  "/enrolled/my",
  authMiddleware,
  authorizeRoles("Student", "Instructor", "Admin"),
  getStudentEnrolledCourses
);

// get my courses
router.get(
  "/instructor/my",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  getMyCourses
);

// get course details by id
router.get("/:id", getCourseById);

// enroll student in course
router.post(
  "/:id/enroll",
  authMiddleware,
  authorizeRoles("Student"),
  enrollInCourse
);

// get course progress
router.get(
  "/:id/progress",
  authMiddleware,
  authorizeRoles("Student"),
  courseAccessMiddleware,
  getCourseProgress
);

// complete lesson
router.post(
  "/:id/lessons/:lessonId/complete",
  authMiddleware,
  authorizeRoles("Student"),
  courseAccessMiddleware,
  completeLesson
);

// create new course
router.post(
  "/",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  createCourse
);

// publish course
router.patch(
  "/:id/publish",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  publishCourse
);

// edit course details
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  updateCourse
);

// delete course
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  deleteCourse
);

export default router;