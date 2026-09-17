import express from "express";
import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";
import profileUpload from "../Middlewares/profileUpload.middleware.js";
import {
  getStudentProfile, getAllStudents, getStudentById,
  updateStudentProfile, deleteStudentProfile, uploadStudentProfileImage,
} from "../Controllers/student.controller.js";

const router = express.Router();

router.get("/profile", authMiddleware, authorizeRoles("Student", "Admin"), getStudentProfile);
router.put("/profile", authMiddleware, authorizeRoles("Student", "Admin"), updateStudentProfile);
router.delete("/profile", authMiddleware, authorizeRoles("Student", "Admin"), deleteStudentProfile);
router.post("/profile/image", authMiddleware, authorizeRoles("Student", "Admin"), profileUpload.single("profileImage"), uploadStudentProfileImage);
router.get("/", authMiddleware, authorizeRoles("Admin"), getAllStudents);
router.get("/:id", authMiddleware, authorizeRoles("Admin"), getStudentById);

export default router;