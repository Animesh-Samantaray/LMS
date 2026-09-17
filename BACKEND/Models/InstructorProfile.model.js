import mongoose from "mongoose";

const instructorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    bio: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    expertise: {
      type: [String],
      default: [],
    },

    qualification: {
      type: String,
      default: "",
    },

    experience: {
      type: String,
      default: "",
    },

    designation: {
      type: String,
      default: "",
    },

    socialLinks: {
      linkedin: {
        type: String,
        default: "",
      },
      website: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

const InstructorProfile = mongoose.model(
  "InstructorProfile",
  instructorProfileSchema
);

export default InstructorProfile;