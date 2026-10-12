import express from "express";
import authMiddleware from "../Middlewares/auth.middleware.js";
import authorizeRoles from "../Middlewares/role.middleware.js";
import {
  handleChatMessage,
  getChatbotLogs,
  deleteChatbotLog,
  clearAllChatbotLogs,
} from "../Controllers/chatbot.controller.js";

const router = express.Router();

router.post("/chat", authMiddleware, handleChatMessage);
router.get("/logs", authMiddleware, authorizeRoles("Admin"), getChatbotLogs);
router.delete("/logs/:id", authMiddleware, authorizeRoles("Admin"), deleteChatbotLog);
router.delete("/logs", authMiddleware, authorizeRoles("Admin"), clearAllChatbotLogs);

export default router;
