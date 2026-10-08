import mongoose from "mongoose";
import axios from "axios";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

import Quiz from "../Models/Quiz.model.js";
import Course from "../Models/Course.model.js";
import QuizQuestion from "../Models/QuizQuestion.model.js";
import QuizSubmission from "../Models/QuizSubmission.model.js";
import sendMail from "../Utils/sendMail.js";

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

const validateQuizData = ({ title, duration, deadline, maxAttempts = 1 }) => {
  if (typeof title !== "string" || title.trim().length < 2) {
    return "Quiz title must contain at least 2 characters";
  }

  if (title.trim().length > 200) {
    return "Quiz title cannot exceed 200 characters";
  }

  if (!Number.isInteger(Number(duration)) || Number(duration) < 1) {
    return "Duration must be a positive whole number of minutes";
  }

  if (!Number.isInteger(Number(maxAttempts)) || Number(maxAttempts) < 1) {
    return "Maximum attempts must be a positive whole number";
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

const AI_MAX_QUESTIONS = 30;
const AI_MAX_DOCUMENT_CHARS = 120000;
const AI_DIFFICULTIES = new Set(["Easy", "Medium", "Hard"]);
const AI_OPTION_KEYS = ["A", "B", "C", "D"];

const extractDocumentText = async (file) => {
  if (!file?.buffer?.length) throw new Error("A document is required");

  let text;
  if (file.mimetype === "text/plain") {
    text = file.buffer.toString("utf8");
  } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    text = result.value;
  } else if (file.mimetype === "application/pdf") {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const result = await parser.getText();
      text = result.text;
    } finally {
      await parser.destroy();
    }
  } else {
    throw new Error("Only PDF, DOCX, and TXT documents are supported");
  }

  const normalizedText = text?.replace(/\s+/g, " ").trim();
  if (!normalizedText) throw new Error("The document does not contain readable text");
  if (normalizedText.length > AI_MAX_DOCUMENT_CHARS) throw new Error("The document contains too much text to process");
  return normalizedText;
};

const validateGeneratedQuestions = (payload, expectedCount, expectedMarks) => {
  if (!payload || !Array.isArray(payload.questions) || payload.questions.length !== expectedCount) {
    throw new Error(`The AI returned an invalid question count. Expected ${expectedCount} questions.`);
  }

  return payload.questions.map((item, index) => {
    if (!item || typeof item.question !== "string" || !item.question.trim()) throw new Error(`Generated question ${index + 1} has no question text`);
    if (!Array.isArray(item.options) || item.options.length !== 4) throw new Error(`Generated question ${index + 1} must have exactly four options`);

    const optionKeys = item.options.map((option) => option?.key);
    if (new Set(optionKeys).size !== 4 || !AI_OPTION_KEYS.every((key) => optionKeys.includes(key))) throw new Error(`Generated question ${index + 1} has invalid option keys`);
    if (item.options.some((option) => typeof option?.text !== "string" || !option.text.trim())) throw new Error(`Generated question ${index + 1} has an empty option`);
    if (!AI_OPTION_KEYS.includes(item.correctOption)) throw new Error(`Generated question ${index + 1} has an invalid correct option`);

    const marks = Number(item.marks);
    if (!Number.isFinite(marks) || marks < 1 || marks !== expectedMarks) throw new Error(`Generated question ${index + 1} has invalid marks`);
    if (Number(item.order) !== index + 1) throw new Error("Generated question order is invalid");

    return {
      question: item.question.trim(),
      options: AI_OPTION_KEYS.map((key) => ({ key, text: item.options.find((option) => option.key === key).text.trim() })),
      correctOption: item.correctOption,
      marks,
      order: index + 1,
    };
  });
};

export const generateQuizQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { topic, numberOfQuestions, difficulty, marksPerQuestion, instructions = "" } = req.body;

    if (!isValidObjectId(quizId)) return res.status(400).json({ success: false, message: "Invalid quiz ID" });
    if (!req.file && !topic) return res.status(400).json({ success: false, message: "A document or a topic is required" });

    const questionCount = Number(numberOfQuestions);
    const marks = Number(marksPerQuestion);
    if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > AI_MAX_QUESTIONS) return res.status(400).json({ success: false, message: `Number of questions must be a whole number from 1 to ${AI_MAX_QUESTIONS}` });
    if (!AI_DIFFICULTIES.has(difficulty)) return res.status(400).json({ success: false, message: "Difficulty must be Easy, Medium, or Hard" });
    if (!Number.isFinite(marks) || marks < 1 || marks > 100) return res.status(400).json({ success: false, message: "Marks per question must be between 1 and 100" });
    if (typeof instructions !== "string" || instructions.length > 2000) return res.status(400).json({ success: false, message: "Instructions must be at most 2000 characters" });
    if (!process.env.GROQ_API_KEY) return res.status(503).json({ success: false, message: "AI question generation is not configured" });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found" });
    const course = await Course.findById(quiz.courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    if (!canManageQuiz(quiz, course, req.user)) return res.status(403).json({ success: false, message: "You are not allowed to generate questions for this quiz" });
    if (quiz.status !== "draft") return res.status(400).json({ success: false, message: "Questions can only be generated for a draft quiz" });

    let documentText;
    try {
      documentText = await extractDocumentText(req.file);
      if (documentText.length > 20000) {
        documentText = documentText.substring(0, 20000) + "... [TRUNCATED DUE TO SIZE LIMIT]";
      }
    } catch (documentError) {
      return res.status(400).json({
        success: false,
        message: documentError.message || "The document could not be read",
      });
    }
    const prompt = `Create exactly ${questionCount} multiple-choice questions from the document content below. Difficulty: ${difficulty}. Marks per question: ${marks}. ${instructions.trim() ? `Additional instructions: ${instructions.trim()}` : ""}
Use only facts supported by the document. Do not ask unrelated general-knowledge questions. Make every question clear and unambiguous, with exactly four options and one correct answer. Use plausible but incorrect distractors and avoid duplicate or near-duplicate questions. Return only valid JSON, with no Markdown fences or explanatory text, in this exact shape:
{"questions":[{"question":"Question text","options":[{"key":"A","text":"Option A"},{"key":"B","text":"Option B"},{"key":"C","text":"Option C"},{"key":"D","text":"Option D"}],"correctOption":"A","marks":${marks},"order":1}]}

Document content:
${documentText}`;

    let providerResponse;
    try {
      providerResponse = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
        temperature: 0.2,
        max_tokens: Math.min(7000, Math.max(1500, questionCount * 350)),
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You generate grounded educational multiple-choice questions." },
          { role: "user", content: prompt },
        ],
      }, { headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }, timeout: 60000 });
    } catch (providerError) {
      console.error("Groq question generation failed:", providerError.response?.data || providerError.message);
      const errorMessage = providerError.response?.data?.error?.message || "The AI question service is currently unavailable";
      return res.status(502).json({ success: false, message: errorMessage });
    }

    const content = providerResponse.data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) return res.status(502).json({ success: false, message: "The AI returned an empty response" });

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content.replace(/^```(?:json)?\s*|\s*```$/gi, "").trim());
    } catch {
      return res.status(502).json({ success: false, message: "The AI returned invalid JSON" });
    }

    const questions = validateGeneratedQuestions(parsedResponse, questionCount, marks);
    return res.status(200).json({ success: true, questions });
  } catch (error) {
    if (error.message === "A document or a topic is required" || error.message.includes("document") || error.message.includes("readable text") || error.message.includes("too much text")) return res.status(400).json({ success: false, message: error.message });
    if (error.message.startsWith("Generated") || error.message.startsWith("The AI returned") || error.message.includes("Generated question")) return res.status(502).json({ success: false, message: error.message });
    console.error("Generate quiz questions error:", error.message);
    return res.status(500).json({ success: false, message: "Failed to generate quiz questions" });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description = "", duration, deadline, maxAttempts = 1 } = req.body;

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
      maxAttempts,
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
      maxAttempts: Number(maxAttempts),
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

        const attemptCount = req.user.role === "Student"
          ? await QuizSubmission.countDocuments({
              quizId: quiz._id,
              studentId: req.user._id,
            })
          : 0;

        return {
          ...quiz,
          questionCount: questionStats[0]?.questionCount || 0,
          totalMarks: questionStats[0]?.totalMarks || 0,
          ...(req.user.role === "Student"
            ? {
                attempts: attemptCount,
                attemptsRemaining: Math.max(quiz.maxAttempts - attemptCount, 0),
              }
            : {}),
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

    let attemptInfo = {};
    if (req.user.role === "Student") {
      const attempts = await QuizSubmission.countDocuments({
        quizId: quiz._id,
        studentId: req.user._id,
      });

      attemptInfo = {
        attempts,
        maxAttempts: quiz.maxAttempts,
        attemptsRemaining: Math.max(quiz.maxAttempts - attempts, 0),
      };

      if (attempts >= quiz.maxAttempts) {
        return res.status(403).json({
          success: false,
          code: "MAX_ATTEMPTS_REACHED",
          message: "You have submitted this quiz the maximum number of times",
          ...attemptInfo,
        });
      }
    }

    return res.status(200).json({
      success: true,
      quiz: {
        ...quiz,
        questionCount: questionStats[0]?.questionCount || 0,
        totalMarks: questionStats[0]?.totalMarks || 0,
        ...attemptInfo,
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
    const { title, description, duration, deadline, maxAttempts } = req.body;

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
      maxAttempts: maxAttempts === undefined ? quiz.maxAttempts : maxAttempts,
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
    quiz.maxAttempts = Number(updatedData.maxAttempts);
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
export const evaluateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;
    const userId = req.user._id; 
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz || quiz.status !== "published") {
      return res.status(404).json({ success: false, message: "Published quiz not found" });
    }

    const existingAttempts = await QuizSubmission.countDocuments({
      quizId,
      studentId: userId,
    });

    if (existingAttempts >= quiz.maxAttempts) {
      return res.status(403).json({
        success: false,
        code: "MAX_ATTEMPTS_REACHED",
        message: "You have submitted this quiz the maximum number of times",
        attempts: existingAttempts,
        maxAttempts: quiz.maxAttempts,
        attemptsRemaining: 0,
      });
    }

    const questions = await QuizQuestion.find({ quizId });
    
    let totalScore = 0;
    const results = questions.map(q => {
      const studentAnswer = answers.find(a => a.questionId === q._id.toString());
      const isCorrect = studentAnswer && studentAnswer.selectedOption === q.correctOption;
      
      if (isCorrect) {
        totalScore += q.marks || 1;
      }
      
      return {
        questionId: q._id,
        correctOption: q.correctOption,
        selectedOption: studentAnswer ? studentAnswer.selectedOption : null,
        isCorrect,
        marksAwarded: isCorrect ? (q.marks || 1) : 0,
        explanation: q.explanation 
      };
    });

    const maxScore = questions.reduce((acc, q) => acc + (q.marks || 1), 0);

    await QuizSubmission.create({
      quizId,
      studentId: userId,
      totalScore,
      maxScore
    });

    const attempts = existingAttempts + 1;
    try {
      await sendMail({
        to: req.user.email,
        subject: `Quiz result: ${quiz.title}`,
        text: `Your score for ${quiz.title} is ${totalScore}/${maxScore}. Attempt ${attempts} of ${quiz.maxAttempts}.`,
        html: `<p>Your quiz submission has been recorded.</p><p><strong>${quiz.title}</strong></p><p>Score: <strong>${totalScore}/${maxScore}</strong></p><p>Attempt: ${attempts} of ${quiz.maxAttempts}</p>`,
      });
    } catch (mailError) {
      console.error("Quiz result email failed:", mailError.message);
    }

    return res.status(200).json({
      success: true,
      totalScore,
      maxScore,
      attempts,
      maxAttempts: quiz.maxAttempts,
      attemptsRemaining: Math.max(quiz.maxAttempts - attempts, 0),
      results
    });
  } catch (error) {
    console.error("Evaluate quiz error:", error);
    return res.status(500).json({ success: false, message: "Failed to evaluate quiz" });
  }
};

export const getMyQuizzes = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    // Find all courses the student is enrolled in
    const enrolledCourses = await Course.find({ enrolled: userId }).select("_id title");
    const courseIds = enrolledCourses.map(c => c._id);
    
    // Find all published quizzes for these courses
    const quizzes = await Quiz.find({ 
      courseId: { $in: courseIds },
      status: "published"
    }).sort({ createdAt: -1 });
    
    // Fetch attempts
    const quizIds = quizzes.map(q => q._id);
    const submissions = await QuizSubmission.find({
      studentId: userId,
      quizId: { $in: quizIds }
    });
    
    const attemptsMap = {};
    submissions.forEach(sub => {
      attemptsMap[sub.quizId] = (attemptsMap[sub.quizId] || 0) + 1;
    });
    
    // Attach course title to quizzes
    const enrichedQuizzes = quizzes.map(quiz => {
      const course = enrolledCourses.find(c => c._id.toString() === quiz.courseId.toString());
      return {
        ...quiz.toObject(),
        courseTitle: course ? course.title : "Unknown Course",
        attempts: attemptsMap[quiz._id] || 0,
        maxAttempts: quiz.maxAttempts,
        attemptsRemaining: Math.max(
          quiz.maxAttempts - (attemptsMap[quiz._id] || 0),
          0
        ),
      };
    });

    return res.status(200).json({
      success: true,
      quizzes: enrichedQuizzes
    });
  } catch (error) {
    console.error("Get my quizzes error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch your quizzes" });
  }
};
