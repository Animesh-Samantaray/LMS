
import mongoose from "mongoose";

const replySchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fromRole: {
      type: String,
      enum: ["Student", "Instructor", "Admin"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const courseQuerySchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    replies: {
      type: [replySchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "answered", "closed"],
      default: "pending",
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    lastRepliedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

courseQuerySchema.index({ courseId: 1, createdAt: -1 });
courseQuerySchema.index({ studentId: 1, createdAt: -1 });

const CourseQuery =  mongoose.model("CourseQuery", courseQuerySchema);
export default CourseQuery;
