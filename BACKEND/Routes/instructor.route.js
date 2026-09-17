import express from "express";
import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";
import profileUpload from "../Middlewares/profileUpload.middleware.js";
import {
  getInstructorProfile, getAllInstructors, getInstructorById,
  updateInstructorProfile, deleteInstructorProfile, uploadInstructorProfileImage,
} from "../Controllers/instructor.controller.js";

const router = express.Router();

router.get("/profile", authMiddleware, authorizeRoles("Instructor", "Admin"), getInstructorProfile);
router.put("/profile", authMiddleware, authorizeRoles("Instructor", "Admin"), updateInstructorProfile);
router.delete("/profile", authMiddleware, authorizeRoles("Instructor", "Admin"), deleteInstructorProfile);
router.post("/profile/image", authMiddleware, authorizeRoles("Instructor", "Admin"), profileUpload.single("profileImage"), uploadInstructorProfileImage);
router.get("/", authMiddleware, authorizeRoles("Admin"), getAllInstructors);
router.get("/:id", authMiddleware, getInstructorById);

export default router;