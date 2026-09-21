import crypto from "crypto";
import jwt from "jsonwebtoken";
import { getAuth } from "firebase-admin/auth";

import User from "../Models/User.model.js";
import StudentProfile from "../Models/StudentProfile.model.js";
import InstructorProfile from "../Models/InstructorProfile.model.js";

import generate2FAOTP from "../Helpers/generate2FAOTP.js";
import loginOtpTemplate from "../Utils/loginOtpTemplate.js";
import sendMail from "../Utils/sendMail.js";



const sanitizeUser = (user) => ({
  id: user._id,
  firebaseUid: user.firebaseUid,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
  accountStatus: user.accountStatus,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  twoFactorEnabled: user.twoFactorEnabled,
});



const OTP_EXPIRY_MS = 10 * 60 * 1000; 
const OTP_RESEND_COOLDOWN_MS = 60 * 1000; 
const MAX_OTP_ATTEMPTS = 5;

const hashOtp = (userId, otp) => {
  return crypto
    .createHmac(
      "sha256",
      process.env.TWO_FACTOR_OTP_SECRET
    )
    .update(`${userId}:${otp}`)
    .digest("hex");
};

const createTwoFactorSession = (user, authTime) => {
  return jwt.sign(
    {
      type: "lms-2fa",
      userId: user._id.toString(),
      firebaseUid: user.firebaseUid,
      authTime,
    },
    process.env.LMS_2FA_SESSION_SECRET,
    {
      expiresIn: "12h",
    }
  );
};

const twoFactorCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production"
      ? "none"
      : "lax",
  path: "/",
});

const clearTwoFactorCookie = (res) => {
  res.clearCookie(
    "lms_2fa",
    twoFactorCookieOptions()
  );
};



export const register = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Firebase authentication token is required",
      });
    }

    const idToken = authHeader.substring(7);

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
    }

    const decodedToken =
      await getAuth().verifyIdToken(idToken);

    const firebaseUid = decodedToken.uid;
    const firebaseEmail = decodedToken.email;

    if (!firebaseUid) {
      return res.status(401).json({
        success: false,
        message: "Invalid Firebase user",
      });
    }

    if (!firebaseEmail) {
      return res.status(400).json({
        success: false,
        message:
          "Firebase account does not have an email address",
      });
    }

    const {
      name,
      role,
      adminAccessToken,
    } = req.body;

    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: "Name and role are required",
      });
    }

    const trimmedName = String(name).trim();

    if (
      trimmedName.length < 2 ||
      trimmedName.length > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name must be between 2 and 100 characters",
      });
    }

    const allowedSignupRoles = [
      "Student",
      "Instructor",
      "Admin",
    ];

    if (!allowedSignupRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected",
      });
    }

    if (role === "Admin") {
      if (!adminAccessToken) {
        return res.status(400).json({
          success: false,
          message: "Admin access token is required",
        });
      }

      if (
        String(adminAccessToken) !==
        String(process.env.ADMIN_ACCESS_TOKEN)
      ) {
        return res.status(403).json({
          success: false,
          message: "Invalid admin access token",
        });
      }

      
      const provider =
        decodedToken.firebase?.sign_in_provider;

      if (
        provider === "google.com" ||
        provider === "github.com"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Admin accounts cannot be created using social login",
        });
      }
    }

    const normalizedEmail = String(firebaseEmail)
      .toLowerCase()
      .trim();

    const existingFirebaseUser = await User.findOne({
      firebaseUid,
    });

    if (existingFirebaseUser) {
      return res.status(409).json({
        success: false,
        message:
          "LMS account already exists for this Firebase account",
        user: sanitizeUser(existingFirebaseUser),
      });
    }

    const existingEmailUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingEmailUser) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this email already exists",
      });
    }

    const user = await User.create({
      firebaseUid,
      name: trimmedName,
      email: normalizedEmail,
      role,
      profileImage: "",
      accountStatus: "active",
      twoFactorEnabled: false,
    });

    if (role === "Student") {
      await StudentProfile.create({
        user: user._id,
      });
    }

    if (role === "Instructor") {
      await InstructorProfile.create({
        user: user._id,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Register Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "An account with this information already exists",
      });
    }

    if (
      error.code === "auth/id-token-expired" ||
      error.code === "auth/id-token-revoked" ||
      error.code === "auth/argument-error"
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid or expired Firebase authentication token",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
};



export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.accountStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active",
      });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Get Current User Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch current user",
    });
  }
};



export const checkTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

   
    if (!user.twoFactorEnabled) {
      clearTwoFactorCookie(res);

      return res.status(200).json({
        success: true,
        twoFactorRequired: false,
      });
    }

    
    const existingSession = req.cookies?.lms_2fa;

    if (existingSession) {
      try {
        const decodedSession = jwt.verify(
          existingSession,
          process.env.LMS_2FA_SESSION_SECRET
        );

        const validSession =
          decodedSession.type === "lms-2fa" &&
          decodedSession.userId ===
            user._id.toString() &&
          decodedSession.firebaseUid ===
            user.firebaseUid &&
          Number(decodedSession.authTime) ===
            Number(req.firebaseAuthTime);

        if (validSession) {
          return res.status(200).json({
            success: true,
            twoFactorRequired: false,
          });
        }
      } catch (error) {
        clearTwoFactorCookie(res);
      }
    }

    
    if (
      user.twoFactorOtpSentAt &&
      Date.now() -
        user.twoFactorOtpSentAt.getTime() <
        OTP_RESEND_COOLDOWN_MS
    ) {
      return res.status(200).json({
        success: true,
        twoFactorRequired: true,
        message:
          "A verification code has already been sent.",
      });
    }

    const otp = generate2FAOTP();
    const hashedOtp = hashOtp(
      user._id.toString(),
      otp
    );

    user.twoFactorOtp = hashedOtp;
    user.twoFactorOtpExpiresAt = new Date(
      Date.now() + OTP_EXPIRY_MS
    );
    user.twoFactorOtpSentAt = new Date();
    user.twoFactorOtpAttempts = 0;

    await user.save();

    await sendMail({
  to: user.email,
  subject: "LMS Platform - Login Verification Code",
  html: loginOtpTemplate(otp),
  text: `Your LMS login verification code is ${otp}. This OTP is valid for 10 minutes.`,
});

    return res.status(200).json({
      success: true,
      twoFactorRequired: true,
      message:
        "A verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Check 2FA Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to process two-factor authentication",
    });
  }
};


export const verifyTwoFactor = async (req, res) => {
  try {
    const { otp } = req.body;

    if (!otp || !/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid 6-digit verification code",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message:
          "Two-factor authentication is not enabled",
      });
    }

    if (
      !user.twoFactorOtp ||
      !user.twoFactorOtpExpiresAt
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No active verification code. Please request a new code.",
      });
    }

    if (
      new Date() > user.twoFactorOtpExpiresAt
    ) {
      user.twoFactorOtp = null;
      user.twoFactorOtpExpiresAt = null;
      user.twoFactorOtpSentAt = null;
      user.twoFactorOtpAttempts = 0;

      await user.save();

      return res.status(410).json({
        success: false,
        message:
          "Verification code has expired. Please request a new code.",
      });
    }

    if (
      user.twoFactorOtpAttempts >=
      MAX_OTP_ATTEMPTS
    ) {
      user.twoFactorOtp = null;
      user.twoFactorOtpExpiresAt = null;
      user.twoFactorOtpSentAt = null;
      user.twoFactorOtpAttempts = 0;

      await user.save();

      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect attempts. Please request a new code.",
      });
    }

    const submittedHash = hashOtp(
      user._id.toString(),
      String(otp)
    );

    const isValid =
      submittedHash === user.twoFactorOtp;

    if (!isValid) {
      user.twoFactorOtpAttempts += 1;

      await user.save();

      const remainingAttempts =
        MAX_OTP_ATTEMPTS -
        user.twoFactorOtpAttempts;

      return res.status(400).json({
        success: false,
        message:
          remainingAttempts > 0
            ? `Invalid verification code. ${remainingAttempts} attempt${
                remainingAttempts === 1
                  ? ""
                  : "s"
              } remaining.`
            : "Too many incorrect attempts. Please request a new code.",
      });
    }

   
    user.twoFactorOtp = null;
    user.twoFactorOtpExpiresAt = null;
    user.twoFactorOtpSentAt = null;
    user.twoFactorOtpAttempts = 0;

    await user.save();

   
    const sessionToken = createTwoFactorSession(
      user,
      req.firebaseAuthTime
    );

    res.cookie(
      "lms_2fa",
      sessionToken,
      twoFactorCookieOptions()
    );

    return res.status(200).json({
      success: true,
      message: "Two-factor authentication successful",
      twoFactorVerified: true,
    });
  } catch (error) {
    console.error("Verify 2FA Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to verify two-factor authentication",
    });
  }
};



export const resendTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message:
          "Two-factor authentication is not enabled",
      });
    }

    if (
      user.twoFactorOtpSentAt &&
      Date.now() -
        user.twoFactorOtpSentAt.getTime() <
        OTP_RESEND_COOLDOWN_MS
    ) {
      const remaining = Math.ceil(
        (OTP_RESEND_COOLDOWN_MS -
          (Date.now() -
            user.twoFactorOtpSentAt.getTime())) /
          1000
      );

      return res.status(429).json({
        success: false,
        retryAfter: remaining,
        message: `Please wait ${remaining} seconds before requesting another code.`,
      });
    }

    const otp = generate2FAOTP();

    user.twoFactorOtp = hashOtp(
      user._id.toString(),
      otp
    );

    user.twoFactorOtpExpiresAt = new Date(
      Date.now() + OTP_EXPIRY_MS
    );

    user.twoFactorOtpSentAt = new Date();
    user.twoFactorOtpAttempts = 0;

    await user.save();

    await sendMail({
  to: user.email,
  subject: "LMS Platform - Login Verification Code",
  html: loginOtpTemplate(otp),
  text: `Your LMS login verification code is ${otp}. This OTP is valid for 10 minutes.`,
});

    return res.status(200).json({
      success: true,
      message:
        "A new verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Resend 2FA Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to resend verification code",
    });
  }
};



export const enableTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message:
          "Two-factor authentication is already enabled",
      });
    }

    user.twoFactorEnabled = true;

    await user.save();

    const sessionToken = createTwoFactorSession(
      user,
      req.firebaseAuthTime
    );

    res.cookie(
      "lms_2fa",
      sessionToken,
      twoFactorCookieOptions()
    );

    return res.status(200).json({
      success: true,
      message:
        "Two-factor authentication enabled successfully",
      twoFactorEnabled: true,
    });
  } catch (error) {
    console.error("Enable 2FA Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to enable two-factor authentication",
    });
  }
};



export const disableTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message:
          "Two-factor authentication is already disabled",
      });
    }

    user.twoFactorEnabled = false;
    user.twoFactorOtp = null;
    user.twoFactorOtpExpiresAt = null;
    user.twoFactorOtpSentAt = null;
    user.twoFactorOtpAttempts = 0;

    await user.save();

    clearTwoFactorCookie(res);

    return res.status(200).json({
      success: true,
      message:
        "Two-factor authentication disabled successfully",
      twoFactorEnabled: false,
    });
  } catch (error) {
    console.error("Disable 2FA Error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to disable two-factor authentication",
    });
  }
};



export const logout = async (req, res) => {
  try {
    clearTwoFactorCookie(res);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to logout",
    });
  }
};