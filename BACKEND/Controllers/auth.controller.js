import User from "../Models/User.model.js";
import StudentProfile from "../Models/StudentProfile.model.js";
import InstructorProfile from "../Models/InstructorProfile.model.js";
import { hashPassword, comparePassword } from "../Helpers/hashPassword.js";
import generateToken from "../Helpers/generateToken.js";
import generate2FAOTP from "../Helpers/generate2FAOTP.js";

import sendMail from "../Utils/sendMail.js";
import resetPasswordTemplate from "../Utils/resetPasswordOtpTemplete.js";
import loginOtpTemplate from "../Utils/loginOtpTemplate.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage,
  accountStatus: user.accountStatus,
  authProvider: user.authProvider,
  createdAt: user.createdAt,
});

const setAuthCookie = (res, userId) => {
  const token = generateToken(userId);
  res.cookie("token", token, cookieOptions);
  return token;
};

const sendLoginOtp = async (user) => {
  const otp = generate2FAOTP();
  const hashedOTP = await hashPassword(otp);
  const otpExpireTime = new Date(Date.now() + 10 * 60 * 1000);

  user.loginOTP = hashedOTP;
  user.loginOTPExpire = otpExpireTime;
  await user.save();

  await sendMail({
    to: user.email,
    subject: "Login Verification OTP",
    html: loginOtpTemplate(otp),
    text: `Your LMS login verification code is ${otp}. It expires in 10 minutes.`,
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, adminAccessToken } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required",
      });
    }

    const trimmedName = String(name).trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const allowedSignupRoles = ["Student", "Instructor", "Admin"];

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

      if (String(adminAccessToken) !== String(process.env.ADMIN_ACCESS_TOKEN)) {
        return res.status(403).json({
          success: false,
          message: "Invalid admin access token",
        });
      }
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      role,
      authProvider: "local",
      accountStatus: "active",
    });

    if (role === "Student") {
      const existingProfile = await StudentProfile.findOne({ user: user._id });
      if (!existingProfile) {
        await StudentProfile.create({ user: user._id });
      }
    }

    if (role === "Instructor") {
      const existingProfile = await InstructorProfile.findOne({ user: user._id });
      if (!existingProfile) {
        await InstructorProfile.create({ user: user._id });
      }
    }

    setAuthCookie(res, user._id);

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
        message: "An account with this email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to create account",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password +loginOTP +loginOTPExpire"
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.accountStatus !== "active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active",
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google login. Please continue with Google.",
      });
    }

    const passwordMatched = await comparePassword(password, user.password);

    if (!passwordMatched) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.twoFactorEnabled) {
      await sendLoginOtp(user);
      return res.status(200).json({
        success: true,
        requiresTwoFactor: true,
        message: "OTP sent to your email",
      });
    }

    setAuthCookie(res, user._id);

    return res.status(200).json({
      success: true,
      requiresTwoFactor: false,
      message: "Login successful",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
};

export const verifyTwoFactor = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+loginOTP +loginOTPExpire +password"
    );

    if (!user || !user.loginOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (!user.loginOTPExpire || user.loginOTPExpire < new Date()) {
      user.loginOTP = null;
      user.loginOTPExpire = null;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please login again.",
      });
    }

    const otpMatched = await comparePassword(String(otp), user.loginOTP);

    if (!otpMatched) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.loginOTP = null;
    user.loginOTPExpire = null;
    await user.save();

    setAuthCookie(res, user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error("Verify Two-Factor Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP",
    });
  }
};

export const getTwoFactorStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      twoFactorEnabled: Boolean(user?.twoFactorEnabled),
    });
  } catch (error) {
    console.error("Get Two-Factor Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch 2FA status",
    });
  }
};

export const enableTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.twoFactorEnabled = true;
    user.loginOTP = null;
    user.loginOTPExpire = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Two-factor authentication enabled",
    });
  } catch (error) {
    console.error("Enable Two-Factor Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to enable two-factor authentication",
    });
  }
};

export const disableTwoFactor = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.twoFactorEnabled = false;
    user.loginOTP = null;
    user.loginOTPExpire = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Two-factor authentication disabled",
    });
  } catch (error) {
    console.error("Disable Two-Factor Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to disable two-factor authentication",
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

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to logout",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+resetPasswordOTP +resetPasswordOTPExpire +password"
    );

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a password reset OTP has been sent.",
      });
    }

    if (!user.password && user.googleId) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google login. Please continue with Google.",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await hashPassword(otp);
    const otpExpireTime = new Date(Date.now() + 10 * 60 * 1000);

    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordOTPExpire = otpExpireTime;
    await user.save();

    await sendMail({
      to: user.email,
      subject: "Password Reset OTP",
      html: resetPasswordTemplate(otp),
    });

    return res.status(200).json({
      success: true,
      message: "Password reset OTP has been sent to your email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to send password reset OTP",
    });
  }
};

export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+resetPasswordOTP +resetPasswordOTPExpire"
    );

    if (!user || !user.resetPasswordOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    if (!user.resetPasswordOTPExpire || user.resetPasswordOTPExpire < new Date()) {
      user.resetPasswordOTP = null;
      user.resetPasswordOTPExpire = null;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    const otpMatched = await comparePassword(String(otp), user.resetPasswordOTP);

    if (!otpMatched) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to verify OTP",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password +resetPasswordOTP +resetPasswordOTPExpire"
    );

    if (!user || !user.resetPasswordOTP) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired password reset request",
      });
    }

    if (!user.resetPasswordOTPExpire || user.resetPasswordOTPExpire < new Date()) {
      user.resetPasswordOTP = null;
      user.resetPasswordOTPExpire = null;
      await user.save();

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    const otpMatched = await comparePassword(String(otp), user.resetPasswordOTP);

    if (!otpMatched) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpire = null;

    if (user.authProvider === "google") {
      user.authProvider = "local_google";
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
  }
};

export const googleAuthCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
    }

    if (user.accountStatus !== "active") {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=account_inactive`);
    }

    if (user.twoFactorEnabled) {
      await sendLoginOtp(user);
      return res.redirect(
        `${process.env.CLIENT_URL}/login?twoFactor=true&email=${encodeURIComponent(user.email)}`
      );
    }

    setAuthCookie(res, user._id);
    return res.redirect(process.env.CLIENT_URL);
  } catch (error) {
    console.error("Google Callback Error:", error);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
  }
};