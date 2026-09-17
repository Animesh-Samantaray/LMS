import express from "express";
import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";
import profileUpload from "../Middlewares/profileUpload.middleware.js";
import {
  getAdminProfile, updateAdminProfile, getAllUsers, getUserById,
  updateUser, deleteUser, uploadAdminProfileImage,
} from "../Controllers/admin.controller.js";

const router = express.Router();

router.get("/profile", authMiddleware, authorizeRoles("Admin"), getAdminProfile);
router.put("/profile", authMiddleware, authorizeRoles("Admin"), updateAdminProfile);
router.post("/profile/image", authMiddleware, authorizeRoles("Admin"), profileUpload.single("profileImage"), uploadAdminProfileImage);
router.get("/users", authMiddleware, authorizeRoles("Admin"), getAllUsers);
router.get("/users/:id", authMiddleware, authorizeRoles("Admin"), getUserById);
router.put("/users/:id", authMiddleware, authorizeRoles("Admin"), updateUser);
router.delete("/users/:id", authMiddleware, authorizeRoles("Admin"), deleteUser);

export default router;