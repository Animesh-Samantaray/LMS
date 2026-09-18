import { getAuth } from "firebase-admin/auth";
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

    const idToken = authHeader.split("Bearer ")[1];

    const decodedToken = await getAuth().verifyIdToken(idToken);

    const user = await User.findOne({
      firebaseUid: decodedToken.uid,
    });

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
    };

    next();
  } catch (error) {
    console.error("Firebase Auth Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const idToken = authHeader.split("Bearer ")[1];

    const decodedToken = await getAuth().verifyIdToken(idToken);

    const user = await User.findOne({
      firebaseUid: decodedToken.uid,
    });

    if (user && user.accountStatus === "active") {
      req.user = {
        id: user._id.toString(),
        _id: user._id,
        firebaseUid: user.firebaseUid,
        role: user.role,
        email: user.email,
      };
    }
  } catch (error) {
    
  }

  next();
};

export const verifyToken = authMiddleware;
export const protect = authMiddleware;

export default authMiddleware;