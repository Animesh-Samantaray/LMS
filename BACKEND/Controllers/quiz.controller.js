import mongoose from "mongoose";

import Quiz from "../Models/Quiz.model.js";
import Course from "../Models/Course.model.js";
import QuizQuestion from "../Models/QuizQuestion.model.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const canManageCourse = (course, user) => {
  if (user.role === "Admin") return true;

  return (
    user.role === "Instructor" &&
    course.createdBy.toString() === user._id.toString()
  );
};

const canManageQuiz = (quiz, course, user) => {
  if (user.role === "Admin") return true;

  return (
    user.role === "Instructor" &&
    course.createdBy.toString() === user._id.toString() &&
    quiz.createdBy.toString() === user._id.toString()
  );
};

const isEnrolled = (course, userId) => {
  return course.enrolled.some(
    (studentId) => studentId.toString() === userId.toString()
  );
};

const validateQuizData = ({ title, duration, deadline }) => {
  if (typeof title !== "string" || title.trim().length < 2) {
    return "Quiz title must contain at least 2 characters";
  }

  if (title.trim().length > 200) {
    return "Quiz title cannot exceed 200 characters";
  }

  if (!Number.isInteger(Number(duration)) || Number(duration) < 1) {
    return "Duration must be a positive whole number of minutes";
  }

  const parsedDeadline = new Date(deadline);

  if (!deadline || Number.isNaN(parsedDeadline.getTime())) {
    return "A valid deadline is required";
  }

  if (parsedDeadline <= new Date()) {
    return "Deadline must be in the future";
  }

  return null;
};

const handleDuplicateTitle = (res, error) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A quiz with this title already exists in this course",
    });
  }

  return null;
};

export const createQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description = "", duration, deadline } = req.body;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const validationError = validateQuizData({
      title,
      duration,
      deadline,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    if (
      typeof description !== "string" ||
      description.trim().length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "Description must be a string of at most 2000 characters",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!canManageCourse(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to create quizzes for this course",
      });
    }

    const quiz = await Quiz.create({
      courseId,
      title: title.trim(),
      description: description.trim(),
      duration: Number(duration),
      deadline: new Date(deadline),
      status: "draft",
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    const duplicateResponse = handleDuplicateTitle(res, error);
    if (duplicateResponse) return duplicateResponse;

    console.error("Create quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create quiz",
    });
  }
};

export const getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid course ID",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    let filter = { courseId };

    if (req.user.role === "Student") {
      if (!isEnrolled(course, req.user._id)) {
        return res.status(403).json({
          success: false,
          message: "You must be enrolled in this course to view its quizzes",
        });
      }

      filter.status = "published";
    } else if (req.user.role === "Instructor") {
      if (!canManageCourse(course, req.user)) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to view quizzes for this course",
        });
      }
    } else if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view these quizzes",
      });
    }

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 }).lean();

    const quizzesWithStats = await Promise.all(
      quizzes.map(async (quiz) => {
        const questionStats = await QuizQuestion.aggregate([
          { $match: { quizId: new mongoose.Types.ObjectId(quiz._id) } },
          {
            $group: {
              _id: null,
              questionCount: { $sum: 1 },
              totalMarks: { $sum: "$marks" },
            },
          },
        ]);

        return {
          ...quiz,
          questionCount: questionStats[0]?.questionCount || 0,
          totalMarks: questionStats[0]?.totalMarks || 0,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: quizzesWithStats.length,
      quizzes: quizzesWithStats,
    });
  } catch (error) {
    console.error("Get course quizzes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes",
    });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!isValidObjectId(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const quiz = await Quiz.findById(quizId).lean();

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const course = await Course.findById(quiz.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (req.user.role === "Student") {
      if (!isEnrolled(course, req.user._id)) {
        return res.status(403).json({
          success: false,
          message: "You must be enrolled in this course to view this quiz",
        });
      }

      if (quiz.status !== "published") {
        return res.status(404).json({
          success: false,
          message: "Quiz not found",
        });
      }
    } else if (!canManageQuiz(quiz, course, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this quiz",
      });
    }

    const questionStats = await QuizQuestion.aggregate([
      { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },
      {
        $group: {
          _id: null,
          questionCount: { $sum: 1 },
          totalMarks: { $sum: "$marks" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      quiz: {
        ...quiz,
        questionCount: questionStats[0]?.questionCount || 0,
        totalMarks: questionStats[0]?.totalMarks || 0,
      },
    });
  } catch (error) {
    console.error("Get quiz by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch quiz",
    });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { title, description, duration, deadline } = req.body;

    if (!isValidObjectId(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const course = await Course.findById(quiz.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!canManageQuiz(quiz, course, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this quiz",
      });
    }

    if (quiz.status === "published") {
      return res.status(400).json({
        success: false,
        message: "Published quizzes cannot be modified",
      });
    }

    const updatedData = {
      title: title === undefined ? quiz.title : title,
      duration: duration === undefined ? quiz.duration : duration,
      deadline: deadline === undefined ? quiz.deadline : deadline,
    };

    const validationError = validateQuizData(updatedData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    if (description !== undefined) {
      if (
        typeof description !== "string" ||
        description.trim().length > 2000
      ) {
        return res.status(400).json({
          success: false,
          message: "Description must be a string of at most 2000 characters",
        });
      }

      quiz.description = description.trim();
    }

    quiz.title = updatedData.title.trim();
    quiz.duration = Number(updatedData.duration);
    quiz.deadline = new Date(updatedData.deadline);

    await quiz.save();

    return res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      quiz,
    });
  } catch (error) {
    const duplicateResponse = handleDuplicateTitle(res, error);
    if (duplicateResponse) return duplicateResponse;

    console.error("Update quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update quiz",
    });
  }
};

export const publishQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!isValidObjectId(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const course = await Course.findById(quiz.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!canManageQuiz(quiz, course, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to publish this quiz",
      });
    }

    if (quiz.status === "published") {
      return res.status(400).json({
        success: false,
        message: "Quiz is already published",
      });
    }

    if (quiz.deadline <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Quiz deadline must be in the future",
      });
    }

    const questionCount = await QuizQuestion.countDocuments({
      quizId: quiz._id,
    });

    if (questionCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Add at least one question before publishing the quiz",
      });
    }

    quiz.status = "published";
    await quiz.save();

    return res.status(200).json({
      success: true,
      message: "Quiz published successfully",
      quiz,
    });
  } catch (error) {
    console.error("Publish quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to publish quiz",
    });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!isValidObjectId(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const course = await Course.findById(quiz.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!canManageQuiz(quiz, course, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this quiz",
      });
    }

    if (quiz.status === "published") {
      return res.status(400).json({
        success: false,
        message: "Published quizzes cannot be deleted",
      });
    }

    await QuizQuestion.deleteMany({ quizId: quiz._id });
    await quiz.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error("Delete quiz error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete quiz",
    });
  }
};