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

router.post("/register", register);

router.get(
  "/me",
  lmsAuthMiddleware,
  getCurrentUser
);

router.post(
  "/2fa/check",
  authMiddleware,
  checkTwoFactor
);

router.post(
  "/2fa/verify",
  authMiddleware,
  verifyTwoFactor
);

router.post(
  "/2fa/resend",
  authMiddleware,
  resendTwoFactor
);

router.post(
  "/2fa/enable",
  lmsAuthMiddleware,
  enableTwoFactor
);

router.post(
  "/2fa/disable",
  lmsAuthMiddleware,
  disableTwoFactor
);

router.post("/logout", logout);

export default router;