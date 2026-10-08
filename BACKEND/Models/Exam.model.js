import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    maxAttempts: {
      type: Number,
      default: 1,
      min: 1,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ExamQuestion",
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "completed", "archived"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

const Exam =
  mongoose.models.Exam || mongoose.model("Exam", examSchema);

export default Exam;