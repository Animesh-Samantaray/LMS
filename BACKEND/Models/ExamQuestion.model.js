import mongoose from "mongoose";

const examQuestionSchema = new mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 1000,
    },
    options: [
      {
        key: {
          type: String,
          enum: ["A", "B", "C", "D"],
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    correctOption: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

examQuestionSchema.index(
  { examId: 1, order: 1 },
  { unique: true }
);

const ExamQuestion =
  mongoose.models.ExamQuestion ||
  mongoose.model("ExamQuestion", examQuestionSchema);

export default ExamQuestion;