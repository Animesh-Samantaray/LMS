import express from "express";
import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";
import profileUpload from "../Middlewares/profileUpload.middleware.js";
import {
  getStudentProfile, getAllStudents, getStudentById,
  updateStudentProfile, deleteStudentProfile, uploadStudentProfileImage,
} from "../Controllers/student.controller.js";

const router = express.Router();

// get student profile
router.get("/profile", authMiddleware, authorizeRoles("Student", "Admin"), getStudentProfile);
// update student profile
router.put("/profile", authMiddleware, authorizeRoles("Student", "Admin"), updateStudentProfile);
// delete student profile
router.delete("/profile", authMiddleware, authorizeRoles("Student", "Admin"), deleteStudentProfile);
// upload student profile avatar
router.post("/profile/image", authMiddleware, authorizeRoles("Student", "Admin"), profileUpload.single("profileImage"), uploadStudentProfileImage);
// get all students
router.get("/", authMiddleware, authorizeRoles("Admin"), getAllStudents);
// get student by id
router.get("/:id", authMiddleware, authorizeRoles("Admin"), getStudentById);

export default router;