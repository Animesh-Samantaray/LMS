import mongoose from "mongoose";

import ExamQuestion from "../Models/ExamQuestion.model.js";
import Exam from "../Models/Exam.model.js";
import Course from "../Models/Course.model.js";

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const canManageExam = (exam, course, user) => {
  if (user.role === "Admin") {
    return true;
  }

  if (user.role === "Instructor") {
    return (
      exam.createdBy.toString() === user._id.toString() &&
      course.createdBy.toString() === user._id.toString()
    );
  }

  return false;
};

const validateQuestionData = ({
  question,
  options,
  correctOption,
  marks,
  order,
}) => {
  if (
    typeof question !== "string" ||
    question.trim().length < 2 ||
    question.trim().length > 1000
  ) {
    return "Question must be between 2 and 1000 characters";
  }

  if (!Array.isArray(options) || options.length !== 4) {
    return "Exactly four options are required";
  }

  const expectedKeys = ["A", "B", "C", "D"];

  const optionKeys = options.map((option) => option?.key);

  if (
    new Set(optionKeys).size !== 4 ||
    !expectedKeys.every((key) => optionKeys.includes(key))
  ) {
    return "Options must contain exactly A, B, C, and D";
  }

  for (const option of options) {
    if (
      typeof option?.text !== "string" ||
      !option.text.trim()
    ) {
      return "Every option must have text";
    }
  }

  if (!expectedKeys.includes(correctOption)) {
    return "Correct option must be A, B, C, or D";
  }

  const questionMarks = Number(marks);

  if (
    !Number.isFinite(questionMarks) ||
    questionMarks < 1
  ) {
    return "Marks must be at least 1";
  }

  const questionOrder = Number(order);

  if (
    !Number.isInteger(questionOrder) ||
    questionOrder < 1
  ) {
    return "Order must be a positive integer";
  }

  return null;
};

export const createQuestion = async (req, res) => {
  try {
    const { examId } = req.params;

    const {
      question,
      options,
      correctOption,
      marks,
      order,
    } = req.body;

    if (!isValidObjectId(examId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID",
      });
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const course = await Course.findById(exam.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!canManageExam(exam, course, req.user)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to add questions to this exam",
      });
    }

    if (exam.status !== "draft") {
      return res.status(400).json({
        success: false,
        message:
          "Questions can only be added to a draft exam",
      });
    }

    const validationError = validateQuestionData({
      question,
      options,
      correctOption,
      marks,
      order,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const existingQuestion =
      await ExamQuestion.findOne({
        examId,
        order: Number(order),
      });

    if (existingQuestion) {
      return res.status(409).json({
        success: false,
        message:
          "A question with this order already exists",
      });
    }

    const examQuestion = await ExamQuestion.create({
      examId,
      question: question.trim(),
      options: options.map((option) => ({
        key: option.key,
        text: option.text.trim(),
      })),
      correctOption,
      marks: Number(marks),
      order: Number(order),
    });

    if (
      !exam.questions.some(
        (questionId) =>
          questionId.toString() ===
          examQuestion._id.toString()
      )
    ) {
      exam.questions.push(examQuestion._id);
      await exam.save();
    }

    return res.status(201).json({
      success: true,
      message: "Exam question created successfully",
      question: examQuestion,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A question with this order already exists",
      });
    }

    console.error("Create exam question error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create exam question",
    });
  }
};

export const getExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;

    if (!isValidObjectId(examId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID",
      });
    }

    const exam = await Exam.findById(examId).lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const course = await Course.findById(
      exam.courseId
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (req.user.role === "Student") {
      if (!course.enrolled.some(
        (studentId) =>
          studentId.toString() ===
          req.user._id.toString()
      )) {
        return res.status(403).json({
          success: false,
          message:
            "You must be enrolled in this course",
        });
      }

      if (exam.status !== "published") {
        return res.status(404).json({
          success: false,
          message: "Exam not found",
        });
      }

      const questions = await ExamQuestion.find({
        examId,
      })
        .select(
          "_id examId question options marks order createdAt updatedAt"
        )
        .sort({ order: 1 })
        .lean();

      return res.status(200).json({
        success: true,
        count: questions.length,
        questions,
      });
    }

    if (!canManageExam(exam, course, req.user)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to view these exam questions",
      });
    }

    const questions = await ExamQuestion.find({
      examId,
    })
      .sort({ order: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error("Get exam questions error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch exam questions",
    });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!isValidObjectId(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const question = await ExamQuestion.findById(
      questionId
    ).lean();

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Exam question not found",
      });
    }

    const exam = await Exam.findById(
      question.examId
    ).lean();

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const course = await Course.findById(
      exam.courseId
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (req.user.role === "Student") {
      const enrolled = course.enrolled.some(
        (studentId) =>
          studentId.toString() ===
          req.user._id.toString()
      );

      if (!enrolled) {
        return res.status(403).json({
          success: false,
          message:
            "You must be enrolled in this course",
        });
      }

      if (exam.status !== "published") {
        return res.status(404).json({
          success: false,
          message: "Exam question not found",
        });
      }

      const studentQuestion = {
        _id: question._id,
        examId: question.examId,
        question: question.question,
        options: question.options,
        marks: question.marks,
        order: question.order,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      };

      return res.status(200).json({
        success: true,
        question: studentQuestion,
      });
    }

    if (!canManageExam(exam, course, req.user)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to view this question",
      });
    }

    return res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    console.error(
      "Get exam question by ID error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch exam question",
    });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const {
      question,
      options,
      correctOption,
      marks,
      order,
    } = req.body;

    if (!isValidObjectId(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const examQuestion =
      await ExamQuestion.findById(questionId);

    if (!examQuestion) {
      return res.status(404).json({
        success: false,
        message: "Exam question not found",
      });
    }

    const exam = await Exam.findById(
      examQuestion.examId
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const course = await Course.findById(
      exam.courseId
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!canManageExam(exam, course, req.user)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to update this question",
      });
    }

    if (exam.status !== "draft") {
      return res.status(400).json({
        success: false,
        message:
          "Questions can only be updated in a draft exam",
      });
    }

    const updatedData = {
      question:
        question === undefined
          ? examQuestion.question
          : question,
      options:
        options === undefined
          ? examQuestion.options
          : options,
      correctOption:
        correctOption === undefined
          ? examQuestion.correctOption
          : correctOption,
      marks:
        marks === undefined
          ? examQuestion.marks
          : marks,
      order:
        order === undefined
          ? examQuestion.order
          : order,
    };

    const validationError =
      validateQuestionData(updatedData);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    if (
      Number(updatedData.order) !==
      examQuestion.order
    ) {
      const existingQuestion =
        await ExamQuestion.findOne({
          examId: exam._id,
          order: Number(updatedData.order),
          _id: {
            $ne: examQuestion._id,
          },
        });

      if (existingQuestion) {
        return res.status(409).json({
          success: false,
          message:
            "A question with this order already exists",
        });
      }
    }

    examQuestion.question =
      updatedData.question.trim();

    examQuestion.options =
      updatedData.options.map((option) => ({
        key: option.key,
        text: option.text.trim(),
      }));

    examQuestion.correctOption =
      updatedData.correctOption;

    examQuestion.marks =
      Number(updatedData.marks);

    examQuestion.order =
      Number(updatedData.order);

    await examQuestion.save();

    return res.status(200).json({
      success: true,
      message: "Exam question updated successfully",
      question: examQuestion,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "A question with this order already exists",
      });
    }

    console.error("Update exam question error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update exam question",
    });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!isValidObjectId(questionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    const examQuestion =
      await ExamQuestion.findById(questionId);

    if (!examQuestion) {
      return res.status(404).json({
        success: false,
        message: "Exam question not found",
      });
    }

    const exam = await Exam.findById(
      examQuestion.examId
    );

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    const course = await Course.findById(
      exam.courseId
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!canManageExam(exam, course, req.user)) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to delete this question",
      });
    }

    if (exam.status !== "draft") {
      return res.status(400).json({
        success: false,
        message:
          "Questions can only be deleted from a draft exam",
      });
    }

    await examQuestion.deleteOne();

    exam.questions =
      exam.questions.filter(
        (questionId) =>
          questionId.toString() !==
          examQuestion._id.toString()
      );

    await exam.save();

    return res.status(200).json({
      success: true,
      message: "Exam question deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete exam question error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete exam question",
    });
  }
};