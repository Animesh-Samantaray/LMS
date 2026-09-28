import mongoose from "mongoose";

import QuizQuestion from "../Models/QuizQuestion.model.js";
import Quiz from "../Models/Quiz.model.js";
import Course from "../Models/Course.model.js";

export const createQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { question, options, correctOption, marks, order } = req.body;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz ID",
      });
    }

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({
        success: false,
        message: "Exactly four options are required",
      });
    }

    const expectedKeys = ["A", "B", "C", "D"];

    const optionKeys = options.map((option) => option?.key);

    const hasValidKeys =
      new Set(optionKeys).size === 4 &&
      expectedKeys.every((key) => optionKeys.includes(key));

    if (!hasValidKeys) {
      return res.status(400).json({
        success: false,
        message: "Options must contain unique A, B, C and D keys",
      });
    }

    const hasEmptyOption = options.some(
      (option) =>
        !option ||
        typeof option.text !== "string" ||
        !option.text.trim()
    );

    if (hasEmptyOption) {
      return res.status(400).json({
        success: false,
        message: "All four options must contain text",
      });
    }

    if (!["A", "B", "C", "D"].includes(correctOption)) {
      return res.status(400).json({
        success: false,
        message: "Invalid correct option",
      });
    }

    const questionMarks = Number(marks);

    if (!Number.isFinite(questionMarks) || questionMarks < 1) {
      return res.status(400).json({
        success: false,
        message: "Question marks must be at least 1",
      });
    }

    const questionOrder = Number(order);

    if (!Number.isInteger(questionOrder) || questionOrder < 1) {
      return res.status(400).json({
        success: false,
        message: "Question order must be a positive integer",
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
        message: "Course associated with this quiz was not found",
      });
    }

    if (
      req.user.role === "Instructor" &&
      course.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only manage questions for your own courses",
      });
    }

    if (quiz.status === "published") {
      return res.status(400).json({
        success: false,
        message: "Questions cannot be added to a published quiz",
      });
    }

    const existingQuestion = await QuizQuestion.findOne({
      quizId,
      order: questionOrder,
    });

    if (existingQuestion) {
      return res.status(409).json({
        success: false,
        message: `Question order ${questionOrder} already exists in this quiz`,
      });
    }

    const newQuestion = await QuizQuestion.create({
      quizId,
      question: question.trim(),
      options: options.map((option) => ({
        key: option.key,
        text: option.text.trim(),
      })),
      correctOption,
      marks: questionMarks,
      order: questionOrder,
    });

    return res.status(201).json({
      success: true,
      message: "Question created successfully",
      question: newQuestion,
    });
  } catch (error) {
    console.error("Create quiz question error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A question with this order already exists in this quiz",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create quiz question",
    });
  }
};


export const getQuizQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(quizId)) {
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
        message: "Course associated with this quiz was not found",
      });
    }

    const userId = req.user._id.toString();

    if (req.user.role === "Student") {
      const isEnrolled = course.enrolled.some(
        (studentId) => studentId.toString() === userId
      );

      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          message: "You must be enrolled in this course",
        });
      }

      if (quiz.status !== "published") {
        return res.status(404).json({
          success: false,
          message: "Quiz not found",
        });
      }

      if (quiz.deadline <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "This quiz is no longer available",
        });
      }
    }

    if (
      req.user.role === "Instructor" &&
      course.createdBy.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only access quizzes from your own courses",
      });
    }

    const questions = await QuizQuestion.find({ quizId })
      .select("-correctOption")
      .sort({ order: 1 });

    return res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error("Get quiz questions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch quiz questions",
    });
  }
};


export const getQuestionById = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const question = await QuizQuestion.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Quiz question not found",
      });
    }

    const quiz = await Quiz.findById(question.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz associated with this question was not found",
      });
    }

    const course = await Course.findById(quiz.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course associated with this quiz was not found",
      });
    }

    const userId = req.user._id.toString();

    if (req.user.role === "Student") {
      const isEnrolled = course.enrolled.some(
        (studentId) => studentId.toString() === userId
      );

      if (!isEnrolled || quiz.status !== "published") {
        return res.status(404).json({
          success: false,
          message: "Quiz question not found",
        });
      }

      if (quiz.deadline <= new Date()) {
        return res.status(400).json({
          success: false,
          message: "This quiz is no longer available",
        });
      }

      question.correctOption = undefined;
    }

    if (
      req.user.role === "Instructor" &&
      course.createdBy.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only access questions from your own courses",
      });
    }

    const responseQuestion = question.toObject();

    if (req.user.role === "Student") {
      delete responseQuestion.correctOption;
    }

    return res.status(200).json({
      success: true,
      question: responseQuestion,
    });
  } catch (error) {
    console.error("Get quiz question error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch quiz question",
    });
  }
};


export const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { question, options, correctOption, marks, order } = req.body;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const existingQuestion = await QuizQuestion.findById(questionId);

    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: "Quiz question not found",
      });
    }

    const quiz = await Quiz.findById(existingQuestion.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz associated with this question was not found",
      });
    }

    const course = await Course.findById(quiz.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course associated with this quiz was not found",
      });
    }

    if (
      req.user.role === "Instructor" &&
      course.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only update questions from your own courses",
      });
    }

    if (quiz.status === "published") {
      return res.status(400).json({
        success: false,
        message: "Questions cannot be modified after the quiz is published",
      });
    }

    if (question !== undefined) {
      if (
        typeof question !== "string" ||
        !question.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Question cannot be empty",
        });
      }

      if (question.trim().length < 2 || question.trim().length > 1000) {
        return res.status(400).json({
          success: false,
          message: "Question must be between 2 and 1000 characters",
        });
      }

      existingQuestion.question = question.trim();
    }

    if (options !== undefined) {
      if (!Array.isArray(options) || options.length !== 4) {
        return res.status(400).json({
          success: false,
          message: "Exactly four options are required",
        });
      }

      const expectedKeys = ["A", "B", "C", "D"];
      const optionKeys = options.map((option) => option?.key);

      const hasValidKeys =
        new Set(optionKeys).size === 4 &&
        expectedKeys.every((key) => optionKeys.includes(key));

      if (!hasValidKeys) {
        return res.status(400).json({
          success: false,
          message: "Options must contain unique A, B, C and D keys",
        });
      }

      const hasEmptyOption = options.some(
        (option) =>
          !option ||
          typeof option.text !== "string" ||
          !option.text.trim()
      );

      if (hasEmptyOption) {
        return res.status(400).json({
          success: false,
          message: "All four options must contain text",
        });
      }

      existingQuestion.options = options.map((option) => ({
        key: option.key,
        text: option.text.trim(),
      }));
    }

    if (correctOption !== undefined) {
      if (!["A", "B", "C", "D"].includes(correctOption)) {
        return res.status(400).json({
          success: false,
          message: "Invalid correct option",
        });
      }

      existingQuestion.correctOption = correctOption;
    }

    if (marks !== undefined) {
      const questionMarks = Number(marks);

      if (!Number.isFinite(questionMarks) || questionMarks < 1) {
        return res.status(400).json({
          success: false,
          message: "Question marks must be at least 1",
        });
      }

      existingQuestion.marks = questionMarks;
    }

    if (order !== undefined) {
      const questionOrder = Number(order);

      if (!Number.isInteger(questionOrder) || questionOrder < 1) {
        return res.status(400).json({
          success: false,
          message: "Question order must be a positive integer",
        });
      }

      if (questionOrder !== existingQuestion.order) {
        const duplicateOrder = await QuizQuestion.findOne({
          quizId: existingQuestion.quizId,
          order: questionOrder,
          _id: { $ne: questionId },
        });

        if (duplicateOrder) {
          return res.status(409).json({
            success: false,
            message: `Question order ${questionOrder} already exists in this quiz`,
          });
        }
      }

      existingQuestion.order = questionOrder;
    }

    await existingQuestion.save();

    return res.status(200).json({
      success: true,
      message: "Quiz question updated successfully",
      question: existingQuestion,
    });
  } catch (error) {
    console.error("Update quiz question error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A question with this order already exists in this quiz",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update quiz question",
    });
  }
};


export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const question = await QuizQuestion.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Quiz question not found",
      });
    }

    const quiz = await Quiz.findById(question.quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz associated with this question was not found",
      });
    }

    const course = await Course.findById(quiz.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course associated with this quiz was not found",
      });
    }

    if (
      req.user.role === "Instructor" &&
      course.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete questions from your own courses",
      });
    }

    if (quiz.status === "published") {
      return res.status(400).json({
        success: false,
        message: "Questions cannot be deleted after the quiz is published",
      });
    }

    await QuizQuestion.findByIdAndDelete(questionId);

    return res.status(200).json({
      success: true,
      message: "Quiz question deleted successfully",
    });
  } catch (error) {
    console.error("Delete quiz question error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete quiz question",
    });
  }
};