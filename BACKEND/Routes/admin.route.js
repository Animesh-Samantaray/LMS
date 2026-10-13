import express from "express";
import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";
import profileUpload from "../Middlewares/profileUpload.middleware.js";
import {
  getAdminProfile, updateAdminProfile, getAllUsers, getUserById,
  updateUser, deleteUser, uploadAdminProfileImage,
} from "../Controllers/admin.controller.js";

const router = express.Router();

// get admin profile
router.get("/profile", authMiddleware, authorizeRoles("Admin"), getAdminProfile);
// update admin profile
router.put("/profile", authMiddleware, authorizeRoles("Admin"), updateAdminProfile);
// upload admin profile image
router.post("/profile/image", authMiddleware, authorizeRoles("Admin"), profileUpload.single("profileImage"), uploadAdminProfileImage);
// get all users
router.get("/users", authMiddleware, authorizeRoles("Admin"), getAllUsers);
// get user by id
router.get("/users/:id", authMiddleware, authorizeRoles("Admin"), getUserById);
// update user
router.put("/users/:id", authMiddleware, authorizeRoles("Admin"), updateUser);
// delete user
router.delete("/users/:id", authMiddleware, authorizeRoles("Admin"), deleteUser);

export default router;