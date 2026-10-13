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

// create report
router.post("/", authMiddleware, upload.single("file"), createReport);

// get my reports
router.get(
  "/my",
  authMiddleware,
  getMyReports
);

// get all reports
router.get(
  "/admin/all",
  authMiddleware,
  authorizeRoles("Admin"),
  getAllReports
);

// get report by id
router.get(
  "/:reportId",
  authMiddleware,
  getReportById
);

// update report status
router.patch(
  "/:reportId/status",
  authMiddleware,
  authorizeRoles("Admin"),
  updateReportStatus
);

// reply to report
router.patch(
  "/:reportId/reply",
  authMiddleware,
  authorizeRoles("Admin"),
  replyToReport
);

export default router;