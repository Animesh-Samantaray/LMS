import mongoose from "mongoose";

const quizSubmissionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalScore: {
      type: Number,
      required: true,
    },
    maxScore: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

quizSubmissionSchema.index({ quizId: 1, studentId: 1 });

const QuizSubmission = mongoose.models.QuizSubmission || mongoose.model("QuizSubmission", quizSubmissionSchema);

export default QuizSubmission;
