import express from "express";

import {
  createReport,
  getMyReports,
  getReportById,
  getAllReports,
  updateReportStatus,
  replyToReport,
} from "../Controllers/report.controller.js";

import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";
import upload from "../Middlewares/upload.middleware.js";
const router = express.Router();

router.post("/", authMiddleware, upload.single("file"), createReport);

router.get(
  "/my",
  authMiddleware,
  getMyReports
);

router.get(
  "/admin/all",
  authMiddleware,
  authorizeRoles("Admin"),
  getAllReports
);

router.get(
  "/:reportId",
  authMiddleware,
  getReportById
);

router.patch(
  "/:reportId/status",
  authMiddleware,
  authorizeRoles("Admin"),
  updateReportStatus
);

router.patch(
  "/:reportId/reply",
  authMiddleware,
  authorizeRoles("Admin"),
  replyToReport
);

export default router;