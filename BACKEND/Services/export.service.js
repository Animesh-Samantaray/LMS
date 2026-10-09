import User from "../Models/User.model.js";
import StudentProfile from "../Models/StudentProfile.model.js";
import InstructorProfile from "../Models/InstructorProfile.model.js";
import Category from "../Models/Category.model.js";
import Course from "../Models/Course.model.js";
import Unit from "../Models/Unit.model.js";
import Lesson from "../Models/Lesson.model.js";
import Resource from "../Models/Resource.model.js";
import Quiz from "../Models/Quiz.model.js";
import QuizQuestion from "../Models/QuizQuestion.model.js";
import QuizSubmission from "../Models/QuizSubmission.model.js";
import Exam from "../Models/Exam.Model.js";
import ExamQuestion from "../Models/ExamQuestion.model.js";
import ExamAttempt from "../Models/ExamAttempt.model.js";
import Assignment from "../Models/Assignment.model.js";
import AssignmentSubmission from "../Models/AssignmentSubmission.model.js";
import Discussion from "../Models/Discussion.model.js";
import Message from "../Models/Message.model.js";
import Progress from "../Models/Progress.model.js";
import Certificate from "../Models/Certificate.model.js";
import CourseReview from "../Models/CourseReview.model.js";
import PracticeChallenge from "../Models/PracticeChallenge.model.js";
import PracticeSubmission from "../Models/PracticeSubmission.model.js";
import Report from "../Models/Report.model.js";
import Notification from "../Models/Notification.model.js";
export const DATASET_REGISTRY = {
  users: {
    key: "users",
    name: "Users",
    description: "Registered LMS users and accounts",
    model: User,
    defaultSort: { createdAt: -1 },
    projection: {
      _id: 1,
      name: 1,
      email: 1,
      role: 1,
      profileImage: 1,
      accountStatus: 1,
      twoFactorEnabled: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      name: doc.name,
      email: doc.email,
      role: doc.role,
      profileImage: doc.profileImage || "",
      accountStatus: doc.accountStatus,
      twoFactorEnabled: !!doc.twoFactorEnabled,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  "student-profiles": {
    key: "student-profiles",
    name: "Student Profiles",
    description: "Extended student bios, education, and learning goals",
    model: StudentProfile,
    defaultSort: { createdAt: -1 },
    projection: {
      _id: 1,
      user: 1,
      bio: 1,
      phone: 1,
      dateOfBirth: 1,
      location: 1,
      education: 1,
      interests: 1,
      skills: 1,
      learningGoals: 1,
      socialLinks: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      userId: doc.user?.toString(),
      bio: doc.bio || "",
      phone: doc.phone || "",
      dateOfBirth: doc.dateOfBirth,
      location: doc.location || "",
      education: doc.education || "",
      interests: doc.interests || [],
      skills: doc.skills || [],
      learningGoals: doc.learningGoals || [],
      socialLinks: doc.socialLinks || {},
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  "instructor-profiles": {
    key: "instructor-profiles",
    name: "Instructor Profiles",
    description: "Instructor bios, designations, qualifications, and credentials",
    model: InstructorProfile,
    defaultSort: { createdAt: -1 },
    projection: {
      _id: 1,
      user: 1,
      bio: 1,
      phone: 1,
      location: 1,
      expertise: 1,
      qualification: 1,
      experience: 1,
      designation: 1,
      socialLinks: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      userId: doc.user?.toString(),
      bio: doc.bio || "",
      phone: doc.phone || "",
      location: doc.location || "",
      expertise: doc.expertise || [],
      qualification: doc.qualification || "",
      experience: doc.experience || "",
      designation: doc.designation || "",
      socialLinks: doc.socialLinks || {},
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  categories: {
    key: "categories",
    name: "Categories",
    description: "Course categories and taxonomy",
    model: Category,
    defaultSort: { name: 1 },
    projection: {
      _id: 1,
      name: 1,
      description: 1,
      status: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      name: doc.name,
      description: doc.description || "",
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  courses: {
    key: "courses",
    name: "Courses",
    description: "Course catalog, modules, enrollments, and status",
    model: Course,
    defaultSort: { createdAt: -1 },
    projection: {
      _id: 1,
      title: 1,
      description: 1,
      thumbnail: 1,
      category: 1,
      createdBy: 1,
      enrolled: 1,
      modules: 1,
      status: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      title: doc.title,
      description: doc.description,
      thumbnail: doc.thumbnail || "",
      category: doc.category,
      createdBy: doc.createdBy?.toString(),
      enrolledCount: Array.isArray(doc.enrolled) ? doc.enrolled.length : 0,
      enrolledUserIds: Array.isArray(doc.enrolled) ? doc.enrolled.map((id) => id?.toString()) : [],
      moduleIds: Array.isArray(doc.modules) ? doc.modules.map((id) => id?.toString()) : [],
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  units: {
    key: "units",
    name: "Course Units",
    description: "Course units and structured content sections",
    model: Unit,
    defaultSort: { courseId: 1, order: 1 },
    projection: {
      _id: 1,
      courseId: 1,
      title: 1,
      description: 1,
      order: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      courseId: doc.courseId?.toString(),
      title: doc.title,
      description: doc.description || "",
      order: doc.order,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  lessons: {
    key: "lessons",
    name: "Lessons",
    description: "Individual lessons, videos, PDFs, and learning materials",
    model: Lesson,
    defaultSort: { unitId: 1, order: 1 },
    projection: {
      _id: 1,
      unitId: 1,
      title: 1,
      description: 1,
      order: 1,
      contentType: 1,
      videoUrl: 1,
      pdfUrl: 1,
      externalUrl: 1,
      duration: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      unitId: doc.unitId?.toString(),
      title: doc.title,
      description: doc.description || "",
      order: doc.order,
      contentType: doc.contentType,
      videoUrl: doc.videoUrl || "",
      pdfUrl: doc.pdfUrl || "",
      externalUrl: doc.externalUrl || "",
      duration: doc.duration || 0,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  resources: {
    key: "resources",
    name: "Lesson Resources",
    description: "Supplementary downloadable lesson resources and attachments",
    model: Resource,
    defaultSort: { lessonId: 1, order: 1 },
    projection: {
      _id: 1,
      lessonId: 1,
      title: 1,
      description: 1,
      type: 1,
      url: 1,
      originalName: 1,
      fileSize: 1,
      mimeType: 1,
      source: 1,
      order: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      lessonId: doc.lessonId?.toString(),
      title: doc.title,
      description: doc.description || "",
      type: doc.type,
      url: doc.url,
      originalName: doc.originalName || "",
      fileSize: doc.fileSize || 0,
      mimeType: doc.mimeType || "",
      source: doc.source,
      order: doc.order || 0,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  quizzes: {
    key: "quizzes",
    name: "Quizzes",
    description: "Course quizzes, configurations, and deadlines",
    model: Quiz,
    defaultSort: { createdAt: -1 },
    projection: {
      _id: 1,
      courseId: 1,
      title: 1,
      description: 1,
      duration: 1,
      maxAttempts: 1,
      deadline: 1,
      status: 1,
      createdBy: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      courseId: doc.courseId?.toString(),
      title: doc.title,
      description: doc.description || "",
      duration: doc.duration,
      maxAttempts: doc.maxAttempts,
      deadline: doc.deadline,
      status: doc.status,
      createdBy: doc.createdBy?.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  "quiz-questions": {
    key: "quiz-questions",
    name: "Quiz Questions",
    description: "Questions and options bank for quizzes",
    model: QuizQuestion,
    defaultSort: { quizId: 1, order: 1 },
    projection: {
      _id: 1,
      quizId: 1,
      question: 1,
      options: 1,
      correctOption: 1,
      marks: 1,
      order: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      quizId: doc.quizId?.toString(),
      question: doc.question,
      options: doc.options || [],
      correctOption: doc.correctOption,
      marks: doc.marks,
      order: doc.order,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  "quiz-submissions": {
    key: "quiz-submissions",
    name: "Quiz Submissions",
    description: "Student quiz results and final scores",
    model: QuizSubmission,
    defaultSort: { createdAt: -1 },
    projection: {
      _id: 1,
      quizId: 1,
      studentId: 1,
      totalScore: 1,
      maxScore: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      quizId: doc.quizId?.toString(),
      studentId: doc.studentId?.toString(),
      totalScore: doc.totalScore,
      maxScore: doc.maxScore,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  exams: {
    key: "exams",
    name: "Exams",
    description: "Scheduled online examinations and configurations",
    model: Exam,
    defaultSort: { createdAt: -1 },
    projection: {
      _id: 1,
      courseId: 1,
      title: 1,
      description: 1,
      duration: 1,
      startTime: 1,
      endTime: 1,
      maxAttempts: 1,
      questions: 1,
      createdBy: 1,
      status: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      courseId: doc.courseId?.toString(),
      title: doc.title,
      description: doc.description,
      duration: doc.duration,
      startTime: doc.startTime,
      endTime: doc.endTime,
      maxAttempts: doc.maxAttempts,
      questionIds: Array.isArray(doc.questions) ? doc.questions.map((q) => q?.toString()) : [],
      createdBy: doc.createdBy?.toString(),
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  "exam-questions": {
    key: "exam-questions",
    name: "Exam Questions",
    description: "Questions, options, and assigned marks for exams",
    model: ExamQuestion,
    defaultSort: { examId: 1, order: 1 },
    projection: {
      _id: 1,
      examId: 1,
      question: 1,
      options: 1,
      correctOption: 1,
      marks: 1,
      order: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      examId: doc.examId?.toString(),
      question: doc.question,
      options: doc.options || [],
      correctOption: doc.correctOption,
      marks: doc.marks,
      order: doc.order,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  "exam-attempts": {
    key: "exam-attempts",
    name: "Exam Attempts",
    description: "Student exam attempts, answers, scores, and timestamps",
    model: ExamAttempt,
    defaultSort: { createdAt: -1 },
    projection: {
      _id: 1,
      examId: 1,
      studentId: 1,
      attemptNumber: 1,
      startedAt: 1,
      expiresAt: 1,
      submittedAt: 1,
      answers: 1,
      status: 1,
      marksObtained: 1,
      maxMarks: 1,
      percentage: 1,
      resultEmailSent: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      examId: doc.examId?.toString(),
      studentId: doc.studentId?.toString(),
      attemptNumber: doc.attemptNumber,
      startedAt: doc.startedAt,
      expiresAt: doc.expiresAt,
      submittedAt: doc.submittedAt,
      answers: Array.isArray(doc.answers)
        ? doc.answers.map((a) => ({
            questionId: a.questionId?.toString(),
            selectedOption: a.selectedOption,
          }))
        : [],
      status: doc.status,
      marksObtained: doc.marksObtained,
      maxMarks: doc.maxMarks,
      percentage: doc.percentage,
      resultEmailSent: doc.resultEmailSent,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  assignments: {
    key: "assignments",
    name: "Assignments",
    description: "Course assignments, question files, and deadlines",
    model: Assignment,
    defaultSort: { createdAt: -1 },
    projection: {
      _id: 1,
      courseId: 1,
      title: 1,
      description: 1,
      questionFile: 1,
      maximumMarks: 1,
      deadline: 1,
      status: 1,
      createdBy: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      courseId: doc.courseId?.toString(),
      title: doc.title,
      description: doc.description || "",
      questionFile: doc.questionFile
        ? {
            url: doc.questionFile.url,
            originalName: doc.questionFile.originalName || "",
            fileSize: doc.questionFile.fileSize || 0,
            mimeType: doc.questionFile.mimeType || "",
          }
        : null,
      maximumMarks: doc.maximumMarks,
      deadline: doc.deadline,
      status: doc.status,
      createdBy: doc.createdBy?.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  "assignment-submissions": {
    key: "assignment-submissions",
    name: "Assignment Submissions",
    description: "Student assignment submissions, grading, and feedback",
    model: AssignmentSubmission,
    defaultSort: { submittedAt: -1 },
    projection: {
      _id: 1,
      assignmentId: 1,
      studentId: 1,
      answerFiles: 1,
      submittedAt: 1,
      status: 1,
      isLate: 1,
      marks: 1,
      feedback: 1,
      evaluatedBy: 1,
      evaluatedAt: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      assignmentId: doc.assignmentId?.toString(),
      studentId: doc.studentId?.toString(),
      answerFiles: Array.isArray(doc.answerFiles)
        ? doc.answerFiles.map((f) => ({
            url: f.url,
            originalName: f.originalName || "",
            fileSize: f.fileSize || 0,
            mimeType: f.mimeType || "",
          }))
        : [],
      submittedAt: doc.submittedAt,
      status: doc.status,
      isLate: !!doc.isLate,
      marks: doc.marks,
      feedback: doc.feedback || "",
      evaluatedBy: doc.evaluatedBy?.toString() || null,
      evaluatedAt: doc.evaluatedAt || null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  discussions: {
    key: "discussions",
    name: "Discussions",
    description: "Course discussion forums and active member lists",
    model: Discussion,
    defaultSort: { createdAt: -1 },
    projection: {
      _id: 1,
      courseId: 1,
      creatorId: 1,
      members: 1,
      isDeleted: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      courseId: doc.courseId?.toString(),
      creatorId: doc.creatorId?.toString(),
      memberCount: Array.isArray(doc.members) ? doc.members.length : 0,
      memberUserIds: Array.isArray(doc.members) ? doc.members.map((m) => m?.toString()) : [],
      isDeleted: !!doc.isDeleted,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  messages: {
    key: "messages",
    name: "Discussion Messages",
    description: "Messages exchanged across discussion channels",
    model: Message,
    defaultSort: { createdAt: -1 },
    projection: {
      _id: 1,
      discussionId: 1,
      senderId: 1,
      type: 1,
      content: 1,
      fileUrl: 1,
      fileName: 1,
      fileSize: 1,
      fileMimeType: 1,
      parentMessageId: 1,
      reactions: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      discussionId: doc.discussionId?.toString(),
      senderId: doc.senderId?.toString(),
      type: doc.type,
      content: doc.content || "",
      fileUrl: doc.fileUrl || "",
      fileName: doc.fileName || "",
      fileSize: doc.fileSize || 0,
      fileMimeType: doc.fileMimeType || "",
      parentMessageId: doc.parentMessageId?.toString() || null,
      reactions: Array.isArray(doc.reactions)
        ? doc.reactions.map((r) => ({
            userId: r.userId?.toString(),
            emoji: r.emoji,
          }))
        : [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  progress: {
    key: "progress",
    name: "Student Progress",
    description: "Lesson completion and course progress records",
    model: Progress,
    defaultSort: { updatedAt: -1 },
    projection: {
      _id: 1,
      userId: 1,
      courseId: 1,
      completedLessons: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      userId: doc.userId?.toString(),
      courseId: doc.courseId?.toString(),
      completedLessonsCount: Array.isArray(doc.completedLessons) ? doc.completedLessons.length : 0,
      completedLessonIds: Array.isArray(doc.completedLessons)
        ? doc.completedLessons.map((l) => l?.toString())
        : [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  certificates: {
    key: "certificates",
    name: "Certificates",
    description: "Generated student course completion certificates",
    model: Certificate,
    defaultSort: { completionDate: -1 },
    projection: {
      _id: 1,
      certificateId: 1,
      studentId: 1,
      courseId: 1,
      studentName: 1,
      studentEmail: 1,
      courseName: 1,
      completionDate: 1,
      learningCompletion: 1,
      assignmentAverage: 1,
      quizAverage: 1,
      overallAssessmentAverage: 1,
      pdfUrl: 1,
      status: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      certificateId: doc.certificateId,
      studentId: doc.studentId?.toString(),
      courseId: doc.courseId?.toString(),
      studentName: doc.studentName,
      studentEmail: doc.studentEmail,
      courseName: doc.courseName,
      completionDate: doc.completionDate,
      learningCompletion: doc.learningCompletion,
      assignmentAverage: doc.assignmentAverage,
      quizAverage: doc.quizAverage,
      overallAssessmentAverage: doc.overallAssessmentAverage,
      pdfUrl: doc.pdfUrl,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  reviews: {
    key: "reviews",
    name: "Course Reviews",
    description: "Student course ratings, stars, and feedback reviews",
    model: CourseReview,
    defaultSort: { createdAt: -1 },
    projection: {
      _id: 1,
      courseId: 1,
      userId: 1,
      rating: 1,
      comment: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      courseId: doc.courseId?.toString(),
      userId: doc.userId?.toString(),
      rating: doc.rating,
      comment: doc.comment,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  "practice-challenges": {
    key: "practice-challenges",
    name: "Practice Challenges",
    description: "Coding practice challenges, starter code, and test cases",
    model: PracticeChallenge,
    defaultSort: { createdAt: -1 },
    projection: {
      _id: 1,
      title: 1,
      description: 1,
      difficulty: 1,
      instructions: 1,
      language: 1,
      initialCode: 1,
      testCases: 1,
      timeLimit: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      title: doc.title,
      description: doc.description,
      difficulty: doc.difficulty,
      instructions: doc.instructions || "",
      language: doc.language,
      initialCode: doc.initialCode || "",
      testCases: doc.testCases || [],
      timeLimit: doc.timeLimit || 1000,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  "practice-submissions": {
    key: "practice-submissions",
    name: "Practice Submissions",
    description: "Student submissions and solutions in the practice arena",
    model: PracticeSubmission,
    defaultSort: { createdAt: -1 },
    projection: {
      _id: 1,
      userId: 1,
      challengeId: 1,
      code: 1,
      language: 1,
      status: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      userId: doc.userId?.toString(),
      challengeId: doc.challengeId?.toString(),
      code: doc.code || "",
      language: doc.language || "javascript",
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  reports: {
    key: "reports",
    name: "Issue Reports",
    description: "User issue reports, moderation flags, and administrative replies",
    model: Report,
    defaultSort: { createdAt: -1 },
    projection: {
      _id: 1,
      reportId: 1,
      reportedBy: 1,
      type: 1,
      name: 1,
      description: 1,
      attachment: 1,
      courseId: 1,
      status: 1,
      reply: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      reportId: doc.reportId,
      reportedBy: doc.reportedBy?.toString(),
      type: doc.type,
      name: doc.name,
      description: doc.description,
      attachment: doc.attachment
        ? {
            url: doc.attachment.url || "",
            name: doc.attachment.name || "",
            size: doc.attachment.size || 0,
            mimeType: doc.attachment.mimeType || "",
          }
        : null,
      courseId: doc.courseId?.toString() || null,
      status: doc.status,
      reply: doc.reply || "",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
  notifications: {
    key: "notifications",
    name: "System Notifications",
    description: "In-app notifications and broadcast alerts",
    model: Notification,
    defaultSort: { createdAt: -1 },
    projection: {
      _id: 1,
      recipient: 1,
      actor: 1,
      type: 1,
      title: 1,
      message: 1,
      entityType: 1,
      entityId: 1,
      actionUrl: 1,
      isRead: 1,
      readAt: 1,
      createdAt: 1,
      updatedAt: 1,
    },
    transform: (doc) => ({
      _id: doc._id?.toString(),
      recipientId: doc.recipient?.toString(),
      actorId: doc.actor?.toString() || null,
      type: doc.type,
      title: doc.title,
      message: doc.message,
      entityType: doc.entityType || null,
      entityId: doc.entityId?.toString() || null,
      actionUrl: doc.actionUrl || "",
      isRead: !!doc.isRead,
      readAt: doc.readAt || null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }),
  },
};

export const getExportCatalogList = async () => {
  const catalog = await Promise.all(
    Object.values(DATASET_REGISTRY).map(async (ds) => {
      try {
        const count = await ds.model.countDocuments({});
        return {
          key: ds.key,
          name: ds.name,
          description: ds.description,
          recordCount: count,
          previewSupported: true,
          downloadSupported: true,
        };
      } catch (err) {
        console.error(`Error counting dataset ${ds.key}:`, err);
        return {
          key: ds.key,
          name: ds.name,
          description: ds.description,
          recordCount: 0,
          previewSupported: true,
          downloadSupported: true,
        };
      }
    })
  );
  return catalog;
};

export const getDatasetPreview = async (datasetKey, page = 1, limit = 20) => {
  const config = DATASET_REGISTRY[datasetKey];
  if (!config) return null;

  const validPage = Math.max(1, parseInt(page, 10) || 1);
  const validLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (validPage - 1) * validLimit;

  const [totalRecords, rawDocs] = await Promise.all([
    config.model.countDocuments({}),
    config.model
      .find({})
      .select(config.projection)
      .sort(config.defaultSort || { _id: 1 })
      .skip(skip)
      .limit(validLimit)
      .lean(),
  ]);

  const sanitizedRecords = rawDocs.map((doc) => config.transform(doc));
  const totalPages = Math.ceil(totalRecords / validLimit) || 1;

  return {
    key: config.key,
    name: config.name,
    description: config.description,
    page: validPage,
    limit: validLimit,
    totalRecords,
    totalPages,
    hasMore: validPage < totalPages,
    records: sanitizedRecords,
  };
};

export const getFullDatasetExport = async (datasetKey) => {
  const config = DATASET_REGISTRY[datasetKey];
  if (!config) return null;

  const rawDocs = await config.model
    .find({})
    .select(config.projection)
    .sort(config.defaultSort || { _id: 1 })
    .lean();

  const totalRecords = rawDocs.length;
  const sanitizedRecords = rawDocs.map((doc) => config.transform(doc));

  return {
    metadata: {
      application: "LMS",
      exportType: "single-dataset",
      dataset: config.key,
      datasetName: config.name,
      exportedAt: new Date().toISOString(),
      recordCount: totalRecords,
      formatVersion: 1,
    },
    data: sanitizedRecords,
  };
};

export const getCompletePlatformExport = async () => {
  const exportedAt = new Date().toISOString();
  const data = {};
  const datasetCounts = {};
  let totalRecords = 0;

  for (const [key, config] of Object.entries(DATASET_REGISTRY)) {
    const rawDocs = await config.model
      .find({})
      .select(config.projection)
      .sort(config.defaultSort || { _id: 1 })
      .lean();

    const sanitized = rawDocs.map((doc) => config.transform(doc));
    data[key] = sanitized;
    datasetCounts[key] = sanitized.length;
    totalRecords += sanitized.length;
  }

  return {
    metadata: {
      application: "LMS",
      exportType: "full-platform",
      exportedAt,
      totalDatasets: Object.keys(DATASET_REGISTRY).length,
      totalRecords,
      datasetCounts,
      formatVersion: 1,
    },
    data,
  };
};
