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
  verifyTwoFactor,
  getTwoFactorStatus,
  enableTwoFactor,
  disableTwoFactor,
} from "../Controllers/auth.controller.js";

import authMiddleware from "../Middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-2fa", verifyTwoFactor);
router.get("/2fa/status", authMiddleware, getTwoFactorStatus);
router.post("/2fa/enable", authMiddleware, enableTwoFactor);
router.post("/2fa/disable", authMiddleware, disableTwoFactor);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

router.get(
  "/google",
  (req, res, next) => {
    const role = req.query.role;

    if (!["Student", "Instructor"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid role",
      });
    }

    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: role,
    })(req, res, next);
  }
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