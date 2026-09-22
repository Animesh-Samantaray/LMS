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
  reorderLessons
} from "../Controllers/content.controller.js";
import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";

const router = express.Router();

// Units
router.post("/courses/:courseId/units", authMiddleware, authorizeRoles("Instructor", "Admin"), createUnit);
router.get("/courses/:courseId/units", getCourseUnits);
router.patch("/courses/:courseId/units/reorder", authMiddleware, authorizeRoles("Instructor", "Admin"), reorderUnits);
router.put("/units/:unitId", authMiddleware, authorizeRoles("Instructor", "Admin"), updateUnit);
router.delete("/units/:unitId", authMiddleware, authorizeRoles("Instructor", "Admin"), deleteUnit);

// Lessons
router.post("/units/:unitId/lessons", authMiddleware, authorizeRoles("Instructor", "Admin"), createLesson);
router.get("/units/:unitId/lessons", getUnitLessons);
router.patch("/units/:unitId/lessons/reorder", authMiddleware, authorizeRoles("Instructor", "Admin"), reorderLessons);
router.put("/lessons/:lessonId", authMiddleware, authorizeRoles("Instructor", "Admin"), updateLesson);
router.delete("/lessons/:lessonId", authMiddleware, authorizeRoles("Instructor", "Admin"), deleteLesson);

export default router;
