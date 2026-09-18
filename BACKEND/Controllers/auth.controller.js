import { getAuth } from "firebase-admin/auth";

import User from "../Models/User.model.js";
import StudentProfile from "../Models/StudentProfile.model.js";
import InstructorProfile from "../Models/InstructorProfile.model.js";




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
});




export const register = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Firebase authentication token is required",
      });
    }

    const idToken = authHeader.split("Bearer ")[1];

    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is missing",
      });
    }



    const decodedToken = await getAuth().verifyIdToken(idToken);

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
        message: "Firebase account does not have an email address",
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

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must be between 2 and 100 characters",
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
        message: "LMS account already exists for this Firebase account",
        user: sanitizeUser(existingFirebaseUser),
      });
    }

    

    const existingEmailUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingEmailUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    

    const user = await User.create({
      firebaseUid,
      name: trimmedName,
      email: normalizedEmail,
      role,
      profileImage: "",
      accountStatus: "active",
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
        message: "An account with this information already exists",
      });
    }

    

    if (
      error.code === "auth/id-token-expired" ||
      error.code === "auth/id-token-revoked" ||
      error.code === "auth/argument-error"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired Firebase authentication token",
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