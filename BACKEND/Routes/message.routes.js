import express from "express";

import {
  sendMessage,
  getDiscussionMessages,
} from "../Controllers/message.controller.js";

import authMiddleware from "../Middlewares/auth.middleware.js";

const router = express.Router();

router.post("/discussion/:discussionId", authMiddleware, sendMessage);

router.get("/discussion/:discussionId", authMiddleware, getDiscussionMessages);

export default router;