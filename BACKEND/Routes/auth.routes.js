import express from "express";

import {
  register,
  getCurrentUser,
} from "../Controllers/auth.controller.js";

import authMiddleware from "../Middlewares/auth.middleware.js";

const router = express.Router();

// Firebase  → MongoDB  user
router.post("/register", register);


//  current  user
router.get("/me", authMiddleware, getCurrentUser);

export default router;