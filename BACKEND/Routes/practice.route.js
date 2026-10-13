import express from "express";
import { getChallenges, getChallengeById, runCode, createChallenge, submitCode, getSavedCode, updateChallenge, deleteChallenge } from "../Controllers/practice.controller.js";
import authMiddleware from "../Middlewares/auth.middleware.js";

const router = express.Router();

// get challenges
router.get("/", authMiddleware, getChallenges);
// create challenge
router.post("/", authMiddleware, createChallenge);
// get challenge by id
router.get("/:id", authMiddleware, getChallengeById);
// get saved code
router.get("/:id/code", authMiddleware, getSavedCode);
// run code
router.post("/:id/run", authMiddleware, runCode);
// submit code
router.post("/:id/submit", authMiddleware, submitCode);

export default router;
// update challenge
router.put("/:id", authMiddleware, updateChallenge);
// delete challenge
router.delete("/:id", authMiddleware, deleteChallenge);
