import express from "express";

import {
  register,
  getCurrentUser,
  checkTwoFactor,
  verifyTwoFactor,
  resendTwoFactor,
  enableTwoFactor,
  disableTwoFactor,
  logout,
} from "../Controllers/auth.controller.js";

import authMiddleware, {
  lmsAuthMiddleware,
} from "../Middlewares/auth.middleware.js";

const router = express.Router();

// user registration
router.post("/register", register);

// get logged in user profile
router.get(
  "/me",
  lmsAuthMiddleware,
  getCurrentUser
);

// check 2fa requirement
router.post(
  "/2fa/check",
  authMiddleware,
  checkTwoFactor
);

// verify 2fa otp code
router.post(
  "/2fa/verify",
  authMiddleware,
  verifyTwoFactor
);

// resend 2fa otp code
router.post(
  "/2fa/resend",
  authMiddleware,
  resendTwoFactor
);

// enable 2fa
router.post(
  "/2fa/enable",
  authMiddleware,
  enableTwoFactor
);

// disable 2fa
router.post(
  "/2fa/disable",
  authMiddleware,
  disableTwoFactor
);

// logout user
router.post("/logout", logout);

export default router;