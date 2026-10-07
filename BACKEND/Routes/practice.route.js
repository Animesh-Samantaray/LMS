import express from "express";
import { getChallenges, getChallengeById, runCode, createChallenge, submitCode, getSavedCode, updateChallenge, deleteChallenge } from "../Controllers/practice.controller.js";
import authMiddleware from "../Middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getChallenges);
router.post("/", authMiddleware, createChallenge);
router.get("/:id", authMiddleware, getChallengeById);
router.get("/:id/code", authMiddleware, getSavedCode);
router.post("/:id/run", authMiddleware, runCode);
router.post("/:id/submit", authMiddleware, submitCode);

export default router;
router.put("/:id", authMiddleware, updateChallenge);
router.delete("/:id", authMiddleware, deleteChallenge);
