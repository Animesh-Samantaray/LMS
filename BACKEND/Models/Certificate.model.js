import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    studentName: {
      type: String,
      required: true,
    },
    studentEmail: {
      type: String,
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    completionDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    learningCompletion: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    assignmentAverage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    quizAverage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    overallAssessmentAverage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    pdfUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["generated", "email_sent", "email_failed"],
      default: "generated",
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index(
  { studentId: 1, courseId: 1 },
  { unique: true }
);

const Certificate = mongoose.models.Certificate || mongoose.model("Certificate", certificateSchema);

export default Certificate;
