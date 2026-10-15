import express from "express";
import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";
import profileUpload from "../Middlewares/profileUpload.middleware.js";
import {
  getInstructorProfile, getAllInstructors, getInstructorById,
  updateInstructorProfile, deleteInstructorProfile, uploadInstructorProfileImage,
} from "../Controllers/instructor.controller.js";
import { getMyCourses } from "../Controllers/course.controller.js";

const router = express.Router();

// get instructor's courses
router.get("/courses", authMiddleware, authorizeRoles("Instructor", "Admin"), getMyCourses);
// get instructor profile
router.get("/profile", authMiddleware, authorizeRoles("Instructor", "Admin"), getInstructorProfile);
// update instructor profile
router.put("/profile", authMiddleware, authorizeRoles("Instructor", "Admin"), updateInstructorProfile);
// delete instructor profile
router.delete("/profile", authMiddleware, authorizeRoles("Instructor", "Admin"), deleteInstructorProfile);
// upload instructor profile image
router.post("/profile/image", authMiddleware, authorizeRoles("Instructor", "Admin"), profileUpload.single("profileImage"), uploadInstructorProfileImage);
// get all instructors
router.get("/", authMiddleware, authorizeRoles("Admin"), getAllInstructors);
// get instructor by id
router.get("/:id", authMiddleware, getInstructorById);

export default router;