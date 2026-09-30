import mongoose from "mongoose";

const courseReviewSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number between 1 and 5",
      },
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

courseReviewSchema.index(
  { courseId: 1, userId: 1 },
  { unique: true }
);

courseReviewSchema.index({ courseId: 1, createdAt: -1 });

const CourseReview = mongoose.model("CourseReview", courseReviewSchema);

export default CourseReview;