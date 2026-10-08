import mongoose from "mongoose";
import Exam from "../Models/Exam.model.js";
import Course from "../Models/Course.model.js";
import ExamQuestion from "../Models/ExamQuestion.model.js";
import ExamAttempt from "../Models/ExamAttempt.model.js";
import User from "../Models/User.model.js";
import sendMail from "../Utils/sendMail.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isEnrolled = (course, userId) => {
  return course.enrolled.some(
    (studentId) => studentId.toString() === userId.toString()
  );
};

const canManageExam = (exam, course, user) => {
  if (user.role === "Admin") return true;
  if (user.role === "Instructor") {
    return (
      exam.createdBy.toString() === user._id.toString() &&
      course.createdBy.toString() === user._id.toString()
    );
  }
  return false;
};

const sanitizeQuestions = (questions) => {
  return questions.map((q) => ({
    _id: q._id,
    examId: q.examId,
    question: q.question,
    options: q.options,
    marks: q.marks,
    order: q.order,
    createdAt: q.createdAt,
    updatedAt: q.updatedAt,
  }));
};

const buildLeaderboardData = async (examId) => {
  const submittedAttempts = await ExamAttempt.find({
    examId,
    status: "submitted",
  })
    .sort({ marksObtained: -1, submittedAt: 1 })
    .populate("studentId", "name")
    .lean();

  const bestAttemptMap = new Map();

  for (const attempt of submittedAttempts) {
    if (!attempt.studentId) continue;
    const studentKey = attempt.studentId._id.toString();

    if (!bestAttemptMap.has(studentKey)) {
      bestAttemptMap.set(studentKey, attempt);
    } else {
      const currentBest = bestAttemptMap.get(studentKey);
      if (attempt.marksObtained > currentBest.marksObtained) {
        bestAttemptMap.set(studentKey, attempt);
      } else if (
        attempt.marksObtained === currentBest.marksObtained &&
        new Date(attempt.submittedAt) < new Date(currentBest.submittedAt)
      ) {
        bestAttemptMap.set(studentKey, attempt);
      }
    }
  }

  const sortedBestAttempts = Array.from(bestAttemptMap.values()).sort(
    (a, b) => {
      if (b.marksObtained !== a.marksObtained) {
        return b.marksObtained - a.marksObtained;
      }
      return new Date(a.submittedAt) - new Date(b.submittedAt);
    }
  );

  return sortedBestAttempts.map((entry, index) => ({
    rank: index + 1,
    student: {
      id: entry.studentId._id.toString(),
      name: entry.studentId.name || "Student",
    },
    marksObtained: entry.marksObtained,
    maxMarks: entry.maxMarks,
    percentage: entry.percentage,
    attemptId: entry._id.toString(),
  }));
};

export const startExamAttempt = async (req, res) => {
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

    const now = new Date();

    if (exam.status === "published" && now >= exam.endTime) {
      exam.status = "completed";
      await exam.save();
    }

    if (exam.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Exam is not available for attempts",
      });
    }

    const course = await Course.findById(exam.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    if (!isEnrolled(course, req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to take the exam",
      });
    }

    if (now < new Date(exam.startTime)) {
      return res.status(400).json({
        success: false,
        message: "Exam has not started yet",
      });
    }

    if (now >= new Date(exam.endTime)) {
      return res.status(400).json({
        success: false,
        message: "Exam has already ended",
      });
    }

    const existingActiveAttempt = await ExamAttempt.findOne({
      examId,
      studentId: req.user._id,
      status: "active",
    });

    if (existingActiveAttempt) {
      if (now >= new Date(existingActiveAttempt.expiresAt)) {
        existingActiveAttempt.status = "expired";
        await existingActiveAttempt.save();
      } else {
        const rawQuestions = await ExamQuestion.find({ examId })
          .sort({ order: 1 })
          .lean();

        return res.status(200).json({
          success: true,
          message: "Resumed active attempt",
          attemptId: existingActiveAttempt._id,
          examId: existingActiveAttempt.examId,
          startedAt: existingActiveAttempt.startedAt,
          expiresAt: existingActiveAttempt.expiresAt,
          duration: exam.duration,
          answers: existingActiveAttempt.answers,
          questions: sanitizeQuestions(rawQuestions),
        });
      }
    }

    const previousAttemptsCount = await ExamAttempt.countDocuments({
      examId,
      studentId: req.user._id,
    });

    if (previousAttemptsCount >= exam.maxAttempts) {
      return res.status(403).json({
        success: false,
        message: "You have reached the maximum number of attempts for this exam",
      });
    }

    const rawQuestions = await ExamQuestion.find({ examId })
      .sort({ order: 1 })
      .lean();

    if (!rawQuestions || rawQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Exam has no questions available",
      });
    }

    const maxMarks = rawQuestions.reduce(
      (sum, q) => sum + (Number(q.marks) || 1),
      0
    );

    const startedAt = now;
    const durationEndTime = new Date(startedAt.getTime() + exam.duration * 60 * 1000);
    const examEndTime = new Date(exam.endTime);
    const expiresAt = durationEndTime < examEndTime ? durationEndTime : examEndTime;

    const attempt = await ExamAttempt.create({
      examId,
      studentId: req.user._id,
      attemptNumber: previousAttemptsCount + 1,
      startedAt,
      expiresAt,
      status: "active",
      maxMarks,
      marksObtained: 0,
      percentage: 0,
      answers: [],
      resultEmailSent: false,
    });

    return res.status(201).json({
      success: true,
      message: "Exam attempt started successfully",
      attemptId: attempt._id,
      examId: attempt.examId,
      startedAt: attempt.startedAt,
      expiresAt: attempt.expiresAt,
      duration: exam.duration,
      questions: sanitizeQuestions(rawQuestions),
    });
  } catch (error) {
    if (error.code === 11000) {
      const activeAttempt = await ExamAttempt.findOne({
        examId: req.params.examId,
        studentId: req.user._id,
        status: "active",
      });
      if (activeAttempt) {
        const exam = await Exam.findById(req.params.examId);
        const rawQuestions = await ExamQuestion.find({
          examId: req.params.examId,
        })
          .sort({ order: 1 })
          .lean();

        return res.status(200).json({
          success: true,
          message: "Resumed active attempt",
          attemptId: activeAttempt._id,
          examId: activeAttempt.examId,
          startedAt: activeAttempt.startedAt,
          expiresAt: activeAttempt.expiresAt,
          duration: exam?.duration,
          answers: activeAttempt.answers,
          questions: sanitizeQuestions(rawQuestions),
        });
      }
    }

    console.error("Start exam attempt error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start exam attempt",
    });
  }
};

export const getActiveAttempt = async (req, res) => {
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

    const attempt = await ExamAttempt.findOne({
      examId,
      studentId: req.user._id,
      status: "active",
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "No active attempt found for this exam",
      });
    }

    const now = new Date();

    if (now >= new Date(attempt.expiresAt)) {
      attempt.status = "expired";
      await attempt.save();

      return res.status(400).json({
        success: false,
        message: "Exam attempt has expired",
      });
    }

    const rawQuestions = await ExamQuestion.find({ examId })
      .sort({ order: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      attemptId: attempt._id,
      examId: attempt.examId,
      startedAt: attempt.startedAt,
      expiresAt: attempt.expiresAt,
      duration: exam.duration,
      answers: attempt.answers,
      questions: sanitizeQuestions(rawQuestions),
    });
  } catch (error) {
    console.error("Get active attempt error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get active attempt",
    });
  }
};

export const saveExamAnswers = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;

    if (!isValidObjectId(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID",
      });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: "Answers must be an array",
      });
    }

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Exam attempt not found",
      });
    }

    if (attempt.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this attempt",
      });
    }

    if (attempt.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Cannot save answers for an inactive or completed attempt",
      });
    }

    const now = new Date();
    if (now >= new Date(attempt.expiresAt)) {
      attempt.status = "expired";
      await attempt.save();

      return res.status(400).json({
        success: false,
        message: "Exam attempt has expired",
      });
    }

    const validQuestions = await ExamQuestion.find({
      examId: attempt.examId,
    }).lean();

    const validQuestionIdSet = new Set(
      validQuestions.map((q) => q._id.toString())
    );

    const allowedOptions = new Set(["A", "B", "C", "D"]);

    for (const ans of answers) {
      if (!ans || !isValidObjectId(ans.questionId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid question ID in answers",
        });
      }

      if (!validQuestionIdSet.has(ans.questionId.toString())) {
        return res.status(400).json({
          success: false,
          message: "Question does not belong to this exam",
        });
      }

      if (!allowedOptions.has(ans.selectedOption)) {
        return res.status(400).json({
          success: false,
          message: "Selected option must be A, B, C, or D",
        });
      }
    }

    const currentAnswersMap = new Map();
    for (const item of attempt.answers) {
      currentAnswersMap.set(item.questionId.toString(), item.selectedOption);
    }

    for (const ans of answers) {
      currentAnswersMap.set(ans.questionId.toString(), ans.selectedOption);
    }

    attempt.answers = Array.from(currentAnswersMap.entries()).map(
      ([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      })
    );

    await attempt.save();

    return res.status(200).json({
      success: true,
      message: "Answers saved successfully",
      savedCount: attempt.answers.length,
      answers: attempt.answers,
    });
  } catch (error) {
    console.error("Save exam answers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save answers",
    });
  }
};

export const submitExam = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;

    if (!isValidObjectId(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID",
      });
    }

    const attempt = await ExamAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Exam attempt not found",
      });
    }

    if (attempt.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to submit this attempt",
      });
    }

    const exam = await Exam.findById(attempt.examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    if (attempt.status === "submitted") {
      const leaderboard = await buildLeaderboardData(exam._id);
      const studentEntry = leaderboard.find(
        (entry) => entry.student.id === req.user._id.toString()
      );

      return res.status(200).json({
        success: true,
        message: "Exam already submitted",
        result: {
          attemptId: attempt._id,
          examTitle: exam.title,
          marksObtained: attempt.marksObtained,
          maxMarks: attempt.maxMarks,
          percentage: attempt.percentage,
          submittedAt: attempt.submittedAt,
          rank: studentEntry ? studentEntry.rank : null,
          totalParticipants: leaderboard.length,
        },
      });
    }

    const now = new Date();

    if (attempt.status === "expired" || now > new Date(attempt.expiresAt)) {
      attempt.status = "expired";
      await attempt.save();
      return res.status(400).json({
        success: false,
        message: "Attempt has expired and can no longer be submitted",
      });
    }

    if (Array.isArray(answers)) {
      const validQuestions = await ExamQuestion.find({
        examId: attempt.examId,
      }).lean();

      const validQuestionIdSet = new Set(
        validQuestions.map((q) => q._id.toString())
      );
      const allowedOptions = new Set(["A", "B", "C", "D"]);

      const currentAnswersMap = new Map();
      for (const item of attempt.answers) {
        currentAnswersMap.set(item.questionId.toString(), item.selectedOption);
      }

      for (const ans of answers) {
        if (
          ans &&
          isValidObjectId(ans.questionId) &&
          validQuestionIdSet.has(ans.questionId.toString()) &&
          allowedOptions.has(ans.selectedOption)
        ) {
          currentAnswersMap.set(ans.questionId.toString(), ans.selectedOption);
        }
      }

      attempt.answers = Array.from(currentAnswersMap.entries()).map(
        ([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })
      );
    }

    const questions = await ExamQuestion.find({
      examId: attempt.examId,
    }).lean();

    let marksObtained = 0;
    let maxMarks = 0;

    const studentAnswersMap = new Map();
    for (const ans of attempt.answers) {
      studentAnswersMap.set(ans.questionId.toString(), ans.selectedOption);
    }

    for (const q of questions) {
      const qMarks = Number(q.marks) || 1;
      maxMarks += qMarks;
      const selectedOption = studentAnswersMap.get(q._id.toString());
      if (selectedOption && selectedOption === q.correctOption) {
        marksObtained += qMarks;
      }
    }

    const percentage =
      maxMarks > 0 ? Number(((marksObtained / maxMarks) * 100).toFixed(2)) : 0;

    attempt.status = "submitted";
    attempt.submittedAt = now;
    attempt.marksObtained = marksObtained;
    attempt.maxMarks = maxMarks;
    attempt.percentage = percentage;

    await attempt.save();

    if (now >= new Date(exam.endTime) && exam.status === "published") {
      exam.status = "completed";
      await exam.save();
    }

    const leaderboard = await buildLeaderboardData(exam._id);
    const studentEntry = leaderboard.find(
      (entry) => entry.student.id === req.user._id.toString()
    );
    const rank = studentEntry ? studentEntry.rank : 1;
    const totalParticipants = leaderboard.length;

    if (!attempt.resultEmailSent) {
      try {
        const studentUser = await User.findById(req.user._id).lean();
        const studentName = studentUser?.name || "Student";

        await sendMail({
          to: req.user.email,
          subject: `Exam Result - ${exam.title}`,
          text: `Hello ${studentName},\n\nYour result for exam "${exam.title}":\nMarks Obtained: ${marksObtained}/${maxMarks}\nPercentage: ${percentage}%\nRank: ${rank} out of ${totalParticipants}\n\nCongratulations on completing your exam!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #2563eb; margin-top: 0;">Exam Result: ${exam.title}</h2>
              <p>Hello <strong>${studentName}</strong>,</p>
              <p>Your exam submission has been successfully processed. Here is your performance summary:</p>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Marks Obtained</strong></td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${marksObtained} / ${maxMarks}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Percentage</strong></td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${percentage}%</td>
                </tr>
                <tr style="background-color: #f8fafc;">
                  <td style="padding: 10px; border: 1px solid #e2e8f0;"><strong>Current Rank</strong></td>
                  <td style="padding: 10px; border: 1px solid #e2e8f0;">${rank} of ${totalParticipants}</td>
                </tr>
              </table>
              <p style="color: #64748b; font-size: 13px;">This is an automated notification from the LMS Platform.</p>
            </div>
          `,
        });

        attempt.resultEmailSent = true;
        await attempt.save();
      } catch (mailError) {
        console.error("Result email delivery failed:", mailError.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Exam submitted and evaluated successfully",
      result: {
        attemptId: attempt._id,
        examTitle: exam.title,
        marksObtained,
        maxMarks,
        percentage,
        submittedAt: attempt.submittedAt,
        rank,
        totalParticipants,
      },
    });
  } catch (error) {
    console.error("Submit exam error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit exam",
    });
  }
};

export const getExamResult = async (req, res) => {
  try {
    const { attemptId } = req.params;

    if (!isValidObjectId(attemptId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid attempt ID",
      });
    }

    const attempt = await ExamAttempt.findById(attemptId).populate(
      "studentId",
      "name email"
    );

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Exam attempt not found",
      });
    }

    const exam = await Exam.findById(attempt.examId);
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

    const isOwner =
      attempt.studentId._id.toString() === req.user._id.toString();
    const isStaff = canManageExam(exam, course, req.user);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this result",
      });
    }

    if (attempt.status !== "submitted") {
      return res.status(400).json({
        success: false,
        message: "This exam attempt has not been submitted yet",
      });
    }

    const leaderboard = await buildLeaderboardData(exam._id);
    const studentEntry = leaderboard.find(
      (entry) => entry.student.id === attempt.studentId._id.toString()
    );

    return res.status(200).json({
      success: true,
      result: {
        attemptId: attempt._id,
        examId: exam._id,
        examTitle: exam.title,
        studentName: attempt.studentId?.name || "Student",
        marksObtained: attempt.marksObtained,
        maxMarks: attempt.maxMarks,
        percentage: attempt.percentage,
        submittedAt: attempt.submittedAt,
        rank: studentEntry ? studentEntry.rank : null,
        totalParticipants: leaderboard.length,
      },
    });
  } catch (error) {
    console.error("Get exam result error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get exam result",
    });
  }
};

export const getExamLeaderboard = async (req, res) => {
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

    const course = await Course.findById(exam.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const now = new Date();
    if (exam.status === "published" && now >= exam.endTime) {
      exam.status = "completed";
      await exam.save();
    }

    if (req.user.role === "Student") {
      if (!isEnrolled(course, req.user._id)) {
        return res.status(403).json({
          success: false,
          message: "You must be enrolled in this course",
        });
      }

      if (now < new Date(exam.endTime) && exam.status !== "completed") {
        return res.status(403).json({
          success: false,
          code: "LEADERBOARD_LOCKED",
          message: "Leaderboard will be available once the exam duration has ended",
          endTime: exam.endTime,
        });
      }

      if (exam.status !== "published" && exam.status !== "completed") {
        return res.status(403).json({
          success: false,
          message: "Leaderboard is not available",
        });
      }
    } else if (!canManageExam(exam, course, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this leaderboard",
      });
    }

    const leaderboard = await buildLeaderboardData(exam._id);

    let myRank = null;
    if (req.user.role === "Student") {
      const studentEntry = leaderboard.find(
        (entry) => entry.student.id === req.user._id.toString()
      );
      myRank = studentEntry ? studentEntry.rank : null;
    }

    return res.status(200).json({
      success: true,
      exam: {
        id: exam._id,
        title: exam.title,
        status: exam.status,
      },
      leaderboard: leaderboard.map((item) => ({
        rank: item.rank,
        student: item.student,
        marksObtained: item.marksObtained,
        maxMarks: item.maxMarks,
        percentage: item.percentage,
      })),
      myRank,
    });
  } catch (error) {
    console.error("Get exam leaderboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch leaderboard",
    });
  }
};
