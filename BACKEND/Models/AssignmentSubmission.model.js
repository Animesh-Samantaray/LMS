import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
    },
    mimeType: {
      type: String,
    },
  },
  { _id: true }
);

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answerFiles: {
      type: [fileSchema],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: "At least one answer file is required.",
      },
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["submitted", "marked"],
      default: "submitted",
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    marks: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
    },
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    evaluatedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

assignmentSubmissionSchema.index({ assignmentId: 1, studentId: 1 }, { unique: true });

const AssignmentSubmission = mongoose.models.AssignmentSubmission || mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema
);

export default AssignmentSubmission;
