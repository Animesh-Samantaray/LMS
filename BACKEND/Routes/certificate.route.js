import express from "express";
import { checkEligibility, generateCertificate, getMyCertificates, getCertificateById, getAllCertificates } from "../Controllers/certificate.controller.js";
import { protect } from "../Middlewares/auth.middleware.js";

const router = express.Router();

router.get("/my-certificates", protect, getMyCertificates);
router.get("/eligibility/:courseId", protect, checkEligibility);
router.post("/generate", protect, generateCertificate);
router.get("/admin/all", protect, getAllCertificates);
router.get("/:certificateId", getCertificateById);

export default router;
