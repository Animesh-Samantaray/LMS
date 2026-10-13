import express from "express";

import {
  createUnit,
  getCourseUnits,
  updateUnit,
  deleteUnit,
  reorderUnits,
  createLesson,
  getUnitLessons,
  updateLesson,
  deleteLesson,
  reorderLessons,
} from "../Controllers/content.controller.js";

import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";
import courseAccessMiddleware from "../Middlewares/courseAccess.middleware.js";

const router = express.Router();

// get course units
router.get(
  "/courses/:courseId/units",
  authMiddleware,
  courseAccessMiddleware,
  getCourseUnits
);

// get unit lessons
router.get(
  "/courses/:courseId/units/:unitId/lessons",
  authMiddleware,
  courseAccessMiddleware,
  getUnitLessons
);

// create unit
router.post(
  "/courses/:courseId/units",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  createUnit
);

// reorder units
router.patch(
  "/courses/:courseId/units/reorder",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  reorderUnits
);

// update unit
router.put(
  "/units/:unitId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  updateUnit
);

// delete unit
router.delete(
  "/units/:unitId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  deleteUnit
);

// create lesson
router.post(
  "/units/:unitId/lessons",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  createLesson
);

// reorder lessons
router.patch(
  "/units/:unitId/lessons/reorder",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  reorderLessons
);

// update lesson
router.put(
  "/lessons/:lessonId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  updateLesson
);

// delete lesson
router.delete(
  "/lessons/:lessonId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  deleteLesson
);

export default router;