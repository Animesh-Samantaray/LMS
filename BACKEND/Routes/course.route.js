import express from "express";

import {
  createCourse,
  getAllCourses,
  getCourseById,
  getMyCourses,
  updateCourse,
  deleteCourse,
  publishCourse
} from "../Controllers/course.controller.js";

import authMiddleware from "../Middlewares/auth.middleware.js";
import  authorizeRoles  from "../Middlewares/role.middleware.js";

const router = express.Router();


router.get("/", getAllCourses);

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


router.get(
  "/instructor/my",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  getMyCourses
);

router.get("/:id", getCourseById);

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