import express from "express";
import multer from "multer";

import {
  sendMessage,
  getDiscussionMessages,
  uploadDiscussionFile,
  clearDiscussionMessages,
  toggleReaction,
  deleteMessage,
} from "../Controllers/message.controller.js";

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

router.post("/discussion/:discussionId", authMiddleware, sendMessage);

router.post(
  "/discussion/:discussionId/upload",
  authMiddleware,
  handleUpload,
  uploadDiscussionFile
);

router.delete(
  "/discussion/:discussionId/clear",
  authMiddleware,
  clearDiscussionMessages
);

router.get("/discussion/:discussionId", authMiddleware, getDiscussionMessages);

export default router;
router.post('/discussion/:discussionId/message/:messageId/react', authMiddleware, toggleReaction);

router.delete('/discussion/:discussionId/message/:messageId', authMiddleware, deleteMessage);
