import express from "express";
import authMiddleware from "../Middlewares/auth.middleware.js";
import { handleChatMessage } from "../Controllers/chatbot.controller.js";

const router = express.Router();

router.post("/chat", authMiddleware, handleChatMessage);

export default router;
