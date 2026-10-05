import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      unique: true,
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "Course",
        "Content",
        "Message",
        "Discussion",
        "User",
        "Quiz",
        "Assignment",
        "Technical",
        "Other",
      ],
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    attachment: {
  url: {
    type: String,
    default: "",
  },
  publicId: {
    type: String,
    default: "",
  },
  resourceType: {
    type: String,
    default: "",
  },
  name: {
    type: String,
    default: "",
  },
  size: {
    type: Number,
    default: 0,
  },
  mimeType: {
    type: String,
    default: "",
  },
},

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    status: {
      type: String,
      enum: ["Open", "In Review", "Resolved", "Rejected"],
      default: "Open",
    },

    reply: {
      type: String,
      default: "",
      trim: true,
      maxlength: 5000,
    },
  },
  {
    timestamps: true,
  }
);

const Report =
  mongoose.models.Report || mongoose.model("Report", reportSchema);

export default Report;