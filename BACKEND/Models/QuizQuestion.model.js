import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 1000,
    },

    options: {
      type: [
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
            maxlength: 500,
          },
        },
      ],
      required: true,
      validate: {
        validator: (options) => {
          if (!Array.isArray(options) || options.length !== 4) {
            return false;
          }

          const keys = options.map((option) => option.key);

          return (
            new Set(keys).size === 4 &&
            ["A", "B", "C", "D"].every((key) => keys.includes(key))
          );
        },
        message: "A question must contain exactly four unique options: A, B, C and D",
      },
    },

    correctOption: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
    },

    marks: {
      type: Number,
      required: true,
      min: 1,
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

quizQuestionSchema.index(
  { quizId: 1, order: 1 },
  { unique: true }
);

const QuizQuestion = mongoose.model(
  "QuizQuestion",
  quizQuestionSchema
);

export default QuizQuestion;