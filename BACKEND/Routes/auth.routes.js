import express from "express";
import passport from "../Configs/passport.js";

import {
  register,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  googleAuthCallback,
} from "../Controllers/auth.controller.js";

import authMiddleware from "../Middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.get("/me", authMiddleware, getCurrentUser);

router.post("/logout", logout);

router.post("/forgot-password", forgotPassword);

router.post("/verify-reset-otp", verifyResetOTP);

router.post("/reset-password", resetPassword);

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_auth_failed`,
  }),
  googleAuthCallback
);

export default router;