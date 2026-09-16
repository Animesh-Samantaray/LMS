import jwt from "jsonwebtoken";
import User from "../Models/User.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please Login First",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      const user = await User.findById(decoded.id);
      if (user) {
        req.user = {
          id: user._id.toString(),
          _id: user._id,
          role: user.role,
          email: user.email,
        };
      }
    }
  } catch (error) {
    
  }
  next();
};

export const verifyToken = authMiddleware;
export const protect = authMiddleware;
export default authMiddleware;
