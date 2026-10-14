import express from "express";
import multer from "multer";
import {
  getOrCreateDirectConversation,
  getDirectMessages,
  sendDirectMessage,
  uploadDirectFile,
  getMyDirectConversations,
  toggleDirectReaction,
  deleteDirectMessage,
} from "../Controllers/directChat.controller.js";
import authMiddleware from "../Middlewares/auth.middleware.js";
import upload from "../Middlewares/upload.middleware.js";

const router = express.Router();

const handleUpload = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size must not exceed 100 MB",
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error",
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || "Unsupported file type",
      });
    }
    next();
  });
};

// Get or create one-to-one conversation
router.post("/get-or-create", authMiddleware, getOrCreateDirectConversation);

// Get my direct conversations
router.get("/my-conversations", authMiddleware, getMyDirectConversations);

// Get direct messages
router.get("/:conversationId/messages", authMiddleware, getDirectMessages);

// Send direct message
router.post("/:conversationId/messages", authMiddleware, sendDirectMessage);

// Upload file for direct chat
router.post("/:conversationId/upload", authMiddleware, handleUpload, uploadDirectFile);

// Toggle reaction
router.post("/:conversationId/message/:messageId/react", authMiddleware, toggleDirectReaction);

// Delete direct message (Delete for Me or Delete for Everyone)
router.delete("/:conversationId/message/:messageId", authMiddleware, deleteDirectMessage);

export default router;
