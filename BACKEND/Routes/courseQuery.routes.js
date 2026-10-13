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

// create query
router.post(
  "/",
  authMiddleware,
  authorizeRoles("Student"),
  createQuery
);

// get my queries
router.get(
  "/my-queries",
  authMiddleware,
  authorizeRoles("Student"),
  getMyQueries
);

// get course queries
router.get(
  "/course/:courseId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  getCourseQueries
);

// get all queries
router.get(
  "/admin/all",
  authMiddleware,
  authorizeRoles("Admin"),
  getAllQueries
);

// get query stats
router.get(
  "/admin/stats",
  authMiddleware,
  authorizeRoles("Admin"),
  getQueryStats
);

// get query by id
router.get(
  "/:queryId",
  authMiddleware,
  authorizeRoles("Student", "Instructor", "Admin"),
  getQueryById
);

// reply to query
router.post(
  "/:queryId/replies",
  authMiddleware,
  authorizeRoles("Student", "Instructor", "Admin"),
  replyToQuery
);

// update query status
router.patch(
  "/:queryId/status",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  updateQueryStatus
);

export default router;