import express from "express";

import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../Controllers/category.controller.js";

import authMiddleware from "../Middlewares/auth.middleware.js";
import  authorizeRoles  from "../Middlewares/role.middleware.js";

const router = express.Router();

// all
router.get("/", getAllCategories);
// get category by id
router.get("/:id", getCategoryById);




// admin 
router.post(
  "/",
  authMiddleware,
  authorizeRoles("Admin"),
  createCategory
);

// update category
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("Admin"),
  updateCategory
);

// delete category
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("Admin"),
  deleteCategory
);

export default router;