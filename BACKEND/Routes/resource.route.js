import express from "express";

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

const router = express.Router();


router.get(
  "/lesson/:lessonId",
  getLessonResources
);


router.post(
  "/lesson/:lessonId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
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
  updateResource
);


router.delete(
  "/:resourceId",
  authMiddleware,
  authorizeRoles("Instructor", "Admin"),
  deleteResource
);

export default router;