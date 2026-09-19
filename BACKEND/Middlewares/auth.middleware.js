import { getAuth } from "firebase-admin/auth";
import jwt from "jsonwebtoken";
import User from "../Models/User.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    const idToken = authHeader.substring(7);

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);

    let user = await User.findOne({
      firebaseUid: decodedToken.uid,
    });

    if (!user && decodedToken.email) {
      user = await User.findOne({
        email: decodedToken.email.toLowerCase().trim(),
      });

      if (user) {
        user.firebaseUid = decodedToken.uid;
        await user.save();
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "LMS user profile not found",
      });
    }

    if (user.accountStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active",
      });
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      firebaseUid: user.firebaseUid,
      role: user.role,
      email: user.email,
      twoFactorEnabled: user.twoFactorEnabled,
    };

    req.firebaseAuthTime = decodedToken.auth_time;

    next();
  } catch (error) {
    console.error("Firebase Auth Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

export const requireTwoFactor = async (req, res, next) => {
  try {
    if (!req.user?.twoFactorEnabled) {
      return next();
    }

    const sessionToken = req.cookies?.lms_2fa;

    if (!sessionToken) {
      return res.status(403).json({
        success: false,
        code: "TWO_FACTOR_REQUIRED",
        message: "Two-factor authentication is required",
      });
    }

    const decodedSession = jwt.verify(
      sessionToken,
      process.env.LMS_2FA_SESSION_SECRET
    );

    if (decodedSession.type !== "lms-2fa") {
      return res.status(403).json({
        success: false,
        code: "TWO_FACTOR_REQUIRED",
        message: "Two-factor authentication is required",
      });
    }

    if (
      decodedSession.userId !== req.user.id ||
      decodedSession.firebaseUid !== req.user.firebaseUid
    ) {
      return res.status(403).json({
        success: false,
        code: "TWO_FACTOR_REQUIRED",
        message: "Two-factor authentication is required",
      });
    }

    if (
      Number(decodedSession.authTime) !==
      Number(req.firebaseAuthTime)
    ) {
      return res.status(403).json({
        success: false,
        code: "TWO_FACTOR_REQUIRED",
        message: "Two-factor authentication is required",
      });
    }

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      code: "TWO_FACTOR_REQUIRED",
      message: "Two-factor authentication is required",
    });
  }
};

export const lmsAuthMiddleware = async (req, res, next) => {
  await authMiddleware(req, res, async () => {
    await requireTwoFactor(req, res, next);
  });
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const idToken = authHeader.substring(7);

    const decodedToken = await getAuth().verifyIdToken(idToken);

    let user = await User.findOne({
      firebaseUid: decodedToken.uid,
    });

    if (!user && decodedToken.email) {
      user = await User.findOne({
        email: decodedToken.email.toLowerCase().trim(),
      });

      if (user) {
        user.firebaseUid = decodedToken.uid;
        await user.save();
      }
    }

    if (user && user.accountStatus === "active") {
      req.user = {
        id: user._id.toString(),
        _id: user._id,
        firebaseUid: user.firebaseUid,
        role: user.role,
        email: user.email,
        twoFactorEnabled: user.twoFactorEnabled,
      };

      req.firebaseAuthTime = decodedToken.auth_time;
    }
  } catch (error) {
  }

  next();
};

export const verifyToken = authMiddleware;

export const protect = lmsAuthMiddleware;

export default authMiddleware;