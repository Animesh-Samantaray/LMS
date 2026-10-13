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

// handle chat message
router.post("/chat", authMiddleware, handleChatMessage);
// get chatbot logs
router.get("/logs", authMiddleware, authorizeRoles("Admin"), getChatbotLogs);
// delete chatbot log
router.delete("/logs/:id", authMiddleware, authorizeRoles("Admin"), deleteChatbotLog);
// clear all chatbot logs
router.delete("/logs", authMiddleware, authorizeRoles("Admin"), clearAllChatbotLogs);

export default router;
