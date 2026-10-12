import express from "express";
import {
  createQuery,
  getMyQueries,
  getCourseQueries,
  getQueryById,
  replyToQuery,
  updateQueryStatus,
  getAllQueries,
  getQueryStats,
} from "../Controllers/courseQuery.controller.js";
import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  authorizeRoles("Student"),
  createQuery
);

router.get(
  "/my-queries",
  authMiddleware,
  authorizeRoles("Student"),
  getMyQueries
);

router.get(
  "/course/:courseId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  getCourseQueries
);

router.get(
  "/admin/all",
  authMiddleware,
  authorizeRoles("Admin"),
  getAllQueries
);

router.get(
  "/admin/stats",
  authMiddleware,
  authorizeRoles("Admin"),
  getQueryStats
);

router.get(
  "/:queryId",
  authMiddleware,
  authorizeRoles("Student", "Instructor", "Admin"),
  getQueryById
);

router.post(
  "/:queryId/replies",
  authMiddleware,
  authorizeRoles("Student", "Instructor", "Admin"),
  replyToQuery
);

router.patch(
  "/:queryId/status",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  updateQueryStatus
);

export default router;