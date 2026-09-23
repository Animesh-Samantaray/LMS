import express from "express";
import multer from "multer";

import {
  createResource,
  getLessonResources,
  getResourceById,
  updateResource,
  deleteResource,
  reorderResources,
} from "../Controllers/resource.controller.js";

import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";
import upload from "../Middlewares/upload.middleware.js";

const router = express.Router();

const handleUpload = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size must not exceed 100 MB",
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Unsupported file type",
      });
    }
    next();
  });
};

router.get(
  "/lesson/:lessonId",
  getLessonResources
);

router.post(
  "/lesson/:lessonId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  handleUpload,
  createResource
);

router.patch(
  "/lesson/:lessonId/reorder",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  reorderResources
);

router.get(
  "/:resourceId",
  getResourceById
);

router.put(
  "/:resourceId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  handleUpload,
  updateResource
);

router.delete(
  "/:resourceId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  deleteResource
);

export default router;