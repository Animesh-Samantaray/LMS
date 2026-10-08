import mongoose from "mongoose";

const examAttemptSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ExamQuestion",
          required: true,
        },
        selectedOption: {
          type: String,
          enum: ["A", "B", "C", "D"],
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["active", "submitted", "expired"],
      default: "active",
      index: true,
    },
    marksObtained: {
      type: Number,
      default: 0,
    },
    maxMarks: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    resultEmailSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

examAttemptSchema.index(
  { examId: 1, studentId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" },
  }
);

examAttemptSchema.index({ examId: 1, marksObtained: -1, submittedAt: 1 });

const ExamAttempt =
  mongoose.models.ExamAttempt ||
  mongoose.model("ExamAttempt", examAttemptSchema);

export default ExamAttempt;
