import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      select: false,
    },

    role: {
      type: String,
      enum: ["Student", "Instructor", "Admin"],
      default: "Student",
      index: true,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    authProvider: {
      type: String,
      enum: ["local", "google", "local_google"],
      default: "local",
    },

    profileImage: {
      type: String,
      default: "",
    },

    accountStatus: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
      index: true,
    },

    
    resetPasswordOTP: {
      type: String,
      default: null,
      select: false,
    },

    resetPasswordOTPExpire: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;