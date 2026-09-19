import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

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

    role: {
      type: String,
      enum: ["Student", "Instructor", "Admin"],
      default: "Student",
      index: true,
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

    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorOtp: {
      type: String,
      default: null,
    },

    twoFactorOtpExpiresAt: {
      type: Date,
      default: null,
    },

    twoFactorOtpSentAt: {
      type: Date,
      default: null,
    },

    twoFactorOtpAttempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;