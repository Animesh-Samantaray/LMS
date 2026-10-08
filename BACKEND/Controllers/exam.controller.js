import mongoose from "mongoose";
import axios from "axios";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

import Exam from "../Models/Exam.Model.js";
import Course from "../Models/Course.model.js";
import ExamQuestion from "../Models/ExamQuestion.model.js";

const AI_MAX_QUESTIONS = 30;
const AI_MAX_DOCUMENT_CHARS = 120000;
const AI_DIFFICULTIES = new Set(["Easy", "Medium", "Hard"]);
const AI_OPTION_KEYS = ["A", "B", "C", "D"];

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const isEnrolled = (course, userId) => {
  return course.enrolled.some(
    (studentId) => studentId.toString() === userId.toString()
  );
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

const validateExamData = ({
  title,
  duration,
  startTime,
  endTime,
  maxAttempts,
}) => {
  if (
    typeof title !== "string" ||
    title.trim().length < 3 ||
    title.trim().length > 200
  ) {
    return "Title must be between 3 and 200 characters";
  }

  const examDuration = Number(duration);

  if (
    !Number.isFinite(examDuration) ||
    examDuration < 1
  ) {
    return "Duration must be at least 1 minute";
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return "Invalid start or end time";
  }

  if (end <= start) {
    return "End time must be after start time";
  }

  const attempts = Number(maxAttempts);

  if (
    !Number.isInteger(attempts) ||
    attempts < 1
  ) {
    return "Maximum attempts must be at least 1";
  }

  return null;
};

const extractDocumentText = async (file) => {
  if (!file?.buffer?.length) {
    throw new Error("A document is required");
  }

  let text;

  if (file.mimetype === "text/plain") {
    text = file.buffer.toString("utf8");
  } else if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    text = result.value;
  } else if (file.mimetype === "application/pdf") {
    const parser = new PDFParse({
      data: file.buffer,
    });

    try {
      const result = await parser.getText();
      text = result.text;
    } finally {
      await parser.destroy();
    }
  } else {
    throw new Error(
      "Only PDF, DOCX, and TXT documents are supported"
    );
  }

  const normalizedText = text?.replace(/\s+/g, " ").trim();

  if (!normalizedText) {
    throw new Error(
      "The document does not contain readable text"
    );
  }

  if (
    normalizedText.length > AI_MAX_DOCUMENT_CHARS
  ) {
    throw new Error(
      "The document contains too much text to process"
    );
  }

  return normalizedText;
};

const validateGeneratedQuestions = (
  payload,
  expectedCount,
  expectedMarks
) => {
  if (
    !payload ||
    !Array.isArray(payload.questions) ||
    payload.questions.length !== expectedCount
  ) {
    throw new Error(
      `The AI returned an invalid question count. Expected ${expectedCount} questions.`
    );
  }

  return payload.questions.map((item, index) => {
    if (
      !item ||
      typeof item.question !== "string" ||
      !item.question.trim()
    ) {
      throw new Error(
        `Generated question ${index + 1} has no question text`
      );
    }

    if (
      !Array.isArray(item.options) ||
      item.options.length !== 4
    ) {
      throw new Error(
        `Generated question ${index + 1} must have exactly four options`
      );
    }

    const optionKeys = item.options.map(
      (option) => option?.key
    );

    if (
      new Set(optionKeys).size !== 4 ||
      !AI_OPTION_KEYS.every((key) =>
        optionKeys.includes(key)
      )
    ) {
      throw new Error(
        `Generated question ${index + 1} has invalid option keys`
      );
    }

    if (
      item.options.some(
        (option) =>
          typeof option?.text !== "string" ||
          !option.text.trim()
      )
    ) {
      throw new Error(
        `Generated question ${index + 1} has an empty option`
      );
    }

    if (
      !AI_OPTION_KEYS.includes(item.correctOption)
    ) {
      throw new Error(
        `Generated question ${index + 1} has an invalid correct option`
      );
    }

    const marks = Number(item.marks);

    if (
      !Number.isFinite(marks) ||
      marks < 1 ||
      marks !== expectedMarks
    ) {
      throw new Error(
        `Generated question ${index + 1} has invalid marks`
      );
    }

    if (Number(item.order) !== index + 1) {
      throw new Error(
        "Generated question order is invalid"
      );
    }

    return {
      question: item.question.trim(),
      options: AI_OPTION_KEYS.map((key) => ({
        key,
        text: item.options
          .find((option) => option.key === key)
          .text.trim(),
      })),
      correctOption: item.correctOption,
      marks,
      order: index + 1,
    };
  });
};

export const createExam = async (req, res) => {
  try {
    const { courseId } = req.params;

    const {
      title,
      description,
      duration,
      startTime,
      endTime,
      maxAttempts,
    } = req.body;

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

    if (
      req.user.role === "Instructor" &&
      course.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You can only create exams for your own courses",
      });
    }

    if (typeof description !== "string") {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    if (description.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message:
          "Description must be at most 2000 characters",
      });
    }

    const validationError = validateExamData({
      title,
      duration,
      startTime,
      endTime,
      maxAttempts:
        maxAttempts === undefined ? 1 : maxAttempts,
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const exam = await Exam.create({
      courseId,
      title: title.trim(),
      description: description.trim(),
      duration: Number(duration),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      maxAttempts:
        maxAttempts === undefined
          ? 1
          : Number(maxAttempts),
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Exam created successfully",
      exam,
    });
  } catch (error) {
    console.error("Create exam error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create exam",
    });
  }
};

export const getCourseExams = async (req, res) => {
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

    const filter = {
      courseId,
    };

    if (req.user.role === "Student") {
      if (!isEnrolled(course, req.user._id)) {
        return res.status(403).json({
          success: false,
          message:
            "You must be enrolled in this course",
        });
      }

      filter.status = "published";
    } else if (req.user.role === "Instructor") {
      if (
        course.createdBy.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not allowed to view exams for this course",
        });
      }
    } else if (req.user.role !== "Admin") {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to view these exams",
      });
    }

    const exams = await Exam.find(filter)
      .sort({ createdAt: -1 })
      .lean();

    const examsWithStats = await Promise.all(
      exams.map(async (exam) => {
        const questionStats =
          await ExamQuestion.aggregate([
            {
              $match: {
                examId: new mongoose.Types.ObjectId(
                  exam._id
                ),
              },
            },
            {
              $group: {
                _id: null,
                questionCount: {
                  $sum: 1,
                },
                totalMarks: {
                  $sum: "$marks",
                },
              },
            },
          ]);

        return {
          ...exam,
          questionCount:
            questionStats[0]?.questionCount || 0,
          totalMarks:
            questionStats[0]?.totalMarks || 0,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: examsWithStats.length,
      exams: examsWithStats,
    });
  } catch (error) {
    console.error("Get course exams error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch exams",
    });
  }
};

export const getExamById = async (req, res) => {
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
      if (!isEnrolled(course, req.user._id)) {
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
    } else if (
      !canManageExam(exam, course, req.user)
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not allowed to view this exam",
      });
    }

    const questionStats =
      await ExamQuestion.aggregate([
        {
          $match: {
            examId: new mongoose.Types.ObjectId(
              exam._id
            ),
          },
        },
        {
          $group: {
            _id: null,
            questionCount: {
              $sum: 1,
            },
            totalMarks: {
              $sum: "$marks",
            },
          },
        },
      ]);

    return res.status(200).json({
      success: true,
      exam: {
        ...exam,
        questionCount:
          questionStats[0]?.questionCount || 0,
        totalMarks:
          questionStats[0]?.totalMarks || 0,
      },
    });
  } catch (error) {
    console.error("Get exam by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch exam",
    });
  }
};

export const getMyExams = async (req, res) => {
  try {
    const enrolledCourses = await Course.find({
      enrolled: req.user._id,
    }).select("_id title");

    const courseIds = enrolledCourses.map(
      (course) => course._id
    );

    const exams = await Exam.find({
      courseId: {
        $in: courseIds,
      },
      status: "published",
    })
      .populate("courseId", "title")
      .sort({ startTime: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: exams.length,
      exams,
    });
  } catch (error) {
    console.error("Get my exams error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your exams",
    });
  }
};

export const updateExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const {
      title,
      description,
      duration,
      startTime,
      endTime,
      maxAttempts,
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
          "You are not allowed to update this exam",
      });
    }

    if (exam.status === "published") {
      return res.status(400).json({
        success: false,
        message:
          "Published exams cannot be modified",
      });
    }

    const updatedData = {
      title:
        title === undefined ? exam.title : title,
      duration:
        duration === undefined
          ? exam.duration
          : duration,
      startTime:
        startTime === undefined
          ? exam.startTime
          : startTime,
      endTime:
        endTime === undefined
          ? exam.endTime
          : endTime,
      maxAttempts:
        maxAttempts === undefined
          ? exam.maxAttempts
          : maxAttempts,
    };

    const validationError =
      validateExamData(updatedData);

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
          message:
            "Description must be a string of at most 2000 characters",
        });
      }

      exam.description = description.trim();
    }

    exam.title = updatedData.title.trim();
    exam.duration = Number(
      updatedData.duration
    );
    exam.startTime = new Date(
      updatedData.startTime
    );
    exam.endTime = new Date(
      updatedData.endTime
    );
    exam.maxAttempts = Number(
      updatedData.maxAttempts
    );

    await exam.save();

    return res.status(200).json({
      success: true,
      message: "Exam updated successfully",
      exam,
    });
  } catch (error) {
    console.error("Update exam error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update exam",
    });
  }
};

export const publishExam = async (req, res) => {
  try {
    const { examId } = req.params;

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
          "You are not allowed to publish this exam",
      });
    }

    if (exam.status === "published") {
      return res.status(400).json({
        success: false,
        message: "Exam is already published",
      });
    }

    const now = new Date();

    if (exam.endTime <= exam.startTime) {
      return res.status(400).json({
        success: false,
        message:
          "Exam end time must be after start time",
      });
    }

    if (exam.endTime <= now) {
      return res.status(400).json({
        success: false,
        message:
          "Exam end time must be in the future",
      });
    }

    const questionCount =
      await ExamQuestion.countDocuments({
        examId: exam._id,
      });

    if (questionCount === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Add at least one question before publishing the exam",
      });
    }

    exam.status = "published";

    await exam.save();

    return res.status(200).json({
      success: true,
      message: "Exam published successfully",
      exam,
    });
  } catch (error) {
    console.error("Publish exam error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to publish exam",
    });
  }
};

export const deleteExam = async (req, res) => {
  try {
    const { examId } = req.params;

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
          "You are not allowed to delete this exam",
      });
    }

    await ExamQuestion.deleteMany({
      examId: exam._id,
    });

    await exam.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Exam deleted successfully",
    });
  } catch (error) {
    console.error("Delete exam error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete exam",
    });
  }
};

export const generateExamQuestions = async (
  req,
  res
) => {
  try {
    const { examId } = req.params;

    const {
      topic,
      numberOfQuestions,
      difficulty,
      marksPerQuestion,
      instructions = "",
    } = req.body;

    if (!isValidObjectId(examId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid exam ID",
      });
    }

    if (!req.file && !topic) {
      return res.status(400).json({
        success: false,
        message: "A document or a topic is required",
      });
    }

    const questionCount = Number(
      numberOfQuestions
    );
    const marks = Number(marksPerQuestion);

    if (
      !Number.isInteger(questionCount) ||
      questionCount < 1 ||
      questionCount > AI_MAX_QUESTIONS
    ) {
      return res.status(400).json({
        success: false,
        message: `Number of questions must be a whole number from 1 to ${AI_MAX_QUESTIONS}`,
      });
    }

    if (!AI_DIFFICULTIES.has(difficulty)) {
      return res.status(400).json({
        success: false,
        message:
          "Difficulty must be Easy, Medium, or Hard",
      });
    }

    if (
      !Number.isFinite(marks) ||
      marks < 1 ||
      marks > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Marks per question must be between 1 and 100",
      });
    }

    if (
      typeof instructions !== "string" ||
      instructions.length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Instructions must be at most 2000 characters",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({
        success: false,
        message:
          "AI question generation is not configured",
      });
    }

    const exam = await Exam.findById(examId);

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
          "You are not allowed to generate questions for this exam",
      });
    }

    if (exam.status !== "draft") {
      return res.status(400).json({
        success: false,
        message:
          "Questions can only be generated for a draft exam",
      });
    }

    let documentText = "";

    try {
      if (req.file) {
        documentText = await extractDocumentText(req.file);

        if (documentText.length > 20000) {
          documentText =
            documentText.substring(0, 20000) +
            "... [TRUNCATED DUE TO SIZE LIMIT]";
        }
      } else if (topic) {
        documentText = "Topic: " + topic;
      }
    } catch (documentError) {
      return res.status(400).json({
        success: false,
        message: documentError.message || "The document could not be read",
      });
    }

    const additionalInstructions =
      instructions.trim()
        ? `Additional instructions: ${instructions.trim()}`
        : "";

    const prompt = `Create exactly ${questionCount} multiple-choice questions from the document content below. Difficulty: ${difficulty}. Marks per question: ${marks}. ${additionalInstructions}
Use only facts supported by the document. Do not ask unrelated general-knowledge questions. Make every question clear and unambiguous, with exactly four options and one correct answer. Use plausible but incorrect distractors and avoid duplicate or near-duplicate questions. Return only valid JSON, with no Markdown fences or explanatory text, in this exact shape:
{"questions":[{"question":"Question text","options":[{"key":"A","text":"Option A"},{"key":"B","text":"Option B"},{"key":"C","text":"Option C"},{"key":"D","text":"Option D"}],"correctOption":"A","marks":${marks},"order":1}]}

Document content:
${documentText}`;

    let providerResponse;

    try {
      providerResponse = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model:
            process.env.GROQ_MODEL ||
            "openai/gpt-oss-20b",
          temperature: 0.2,
          max_tokens: Math.min(
            7000,
            Math.max(1500, questionCount * 350)
          ),
          response_format: {
            type: "json_object",
          },
          messages: [
            {
              role: "system",
              content:
                "You generate grounded educational multiple-choice questions.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          },
          timeout: 60000,
        }
      );
    } catch (providerError) {
      console.error(
        "Groq exam question generation failed:",
        providerError.response?.data ||
          providerError.message
      );

      const errorMessage =
        providerError.response?.data?.error?.message ||
        "The AI question service is currently unavailable";

      return res.status(502).json({
        success: false,
        message: errorMessage,
      });
    }

    const content =
      providerResponse.data?.choices?.[0]?.message
        ?.content;

    if (
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(502).json({
        success: false,
        message: "The AI returned an empty response",
      });
    }

    let parsedResponse;

    try {
      parsedResponse = JSON.parse(
        content
          .replace(
            /^```(?:json)?\s*|\s*```$/gi,
            ""
          )
          .trim()
      );
    } catch {
      return res.status(502).json({
        success: false,
        message: "The AI returned invalid JSON",
      });
    }

    const questions =
      validateGeneratedQuestions(
        parsedResponse,
        questionCount,
        marks
      );

    return res.status(200).json({
      success: true,
      questions,
    });
  } catch (error) {
    if (
      error.message === "A document is required" ||
      error.message.includes("document") ||
      error.message.includes("readable text") ||
      error.message.includes("too much text")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.startsWith("Generated") ||
      error.message.startsWith("The AI returned") ||
      error.message.includes("Generated question")
    ) {
      return res.status(502).json({
        success: false,
        message: error.message,
      });
    }

    console.error(
      "Generate exam questions error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate exam questions",
    });
  }
};