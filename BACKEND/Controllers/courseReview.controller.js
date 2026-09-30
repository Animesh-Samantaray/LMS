import mongoose from "mongoose";
import CourseReview from "../Models/CourseReview.model.js";
import Course from "../Models/Course.model.js";


export const createReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (typeof comment !== "string" || comment.trim().length < 3 || comment.trim().length > 1000) {
      return res.status(400).json({ message: "Comment must be between 3 and 1000 characters" });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const isEnrolled = course.enrolled.some(
  (studentId) => studentId.toString() === userId.toString()
);

if (!isEnrolled) {
  return res.status(403).json({
    message: "You must be enrolled in this course to review it",
  });
}

    const existingReview = await CourseReview.findOne({ courseId, userId });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this course. Please update your existing review.",
        review: existingReview,
      });
    }

    const review = await CourseReview.create({
      courseId,
      userId,
      rating: Number(rating),
      comment: comment.trim(),
    });

    const populatedReview = await CourseReview.findById(review._id)
      .populate("userId", "name profilePicture");

    return res.status(201).json({
      message: "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already reviewed this course",
      });
    }

    return res.status(500).json({
      message: "Failed to submit review",
      error: error.message,
    });
  }
};

export const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const page = Math.max(Number.parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId).select("_id");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const [reviews, totalReviews] = await Promise.all([
      CourseReview.find({ courseId })
        .populate("userId", "name profilePicture")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      CourseReview.countDocuments({ courseId }),
    ]);

    return res.status(200).json({
      reviews,
      pagination: {
        totalReviews,
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        limit,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch course reviews",
      error: error.message,
    });
  }
};

export const getCourseReviewSummary = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId).select("_id");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const summary = await CourseReview.aggregate([
      {
        $match: {
          courseId: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          fiveStars: {
            $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] },
          },
          fourStars: {
            $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] },
          },
          threeStars: {
            $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] },
          },
          twoStars: {
            $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] },
          },
          oneStar: {
            $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] },
          },
        },
      },
    ]);

    const result = summary[0] || {
      averageRating: 0,
      totalReviews: 0,
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0,
    };

    return res.status(200).json({
      averageRating: Number(result.averageRating.toFixed(1)),
      totalReviews: result.totalReviews,
      distribution: {
        5: result.fiveStars,
        4: result.fourStars,
        3: result.threeStars,
        2: result.twoStars,
        1: result.oneStar,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch review summary",
      error: error.message,
    });
  }
};

export const getMyCourseReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "Invalid course ID" });
    }

    const review = await CourseReview.findOne({ courseId, userId });

    return res.status(200).json({
      review: review || null,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch your review",
      error: error.message,
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    if (!Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (typeof comment !== "string" || comment.trim().length < 3 || comment.trim().length > 1000) {
      return res.status(400).json({ message: "Comment must be between 3 and 1000 characters" });
    }

    const review = await CourseReview.findOneAndUpdate(
      { _id: reviewId, userId },
      {
        rating: Number(rating),
        comment: comment.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate("userId", "name profilePicture");

    if (!review) {
      return res.status(404).json({
        message: "Review not found or you are not authorized to update it",
      });
    }

    return res.status(200).json({
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update review",
      error: error.message,
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const review = await CourseReview.findOneAndDelete({
      _id: reviewId,
      userId,
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found or you are not authorized to delete it",
      });
    }

    return res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete review",
      error: error.message,
    });
  }
};