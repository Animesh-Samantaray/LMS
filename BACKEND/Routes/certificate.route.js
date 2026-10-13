import express from "express";
import { checkEligibility, generateCertificate, getMyCertificates, getCertificateById, getAllCertificates } from "../Controllers/certificate.controller.js";
import { protect } from "../Middlewares/auth.middleware.js";

const router = express.Router();

// get my certificates
router.get("/my-certificates", protect, getMyCertificates);
// check eligibility
router.get("/eligibility/:courseId", protect, checkEligibility);
// generate course completion certificate
router.post("/generate", protect, generateCertificate);
// get all certificates
router.get("/admin/all", protect, getAllCertificates);
// get certificate by id
router.get("/:certificateId", getCertificateById);

export default router;
