import mongoose from "mongoose";
import Course from "../Models/Course.model.js";
import Progress from "../Models/Progress.model.js";
import Unit from "../Models/Unit.model.js";
import Lesson from "../Models/Lesson.model.js";
import Quiz from "../Models/Quiz.model.js";
import QuizSubmission from "../Models/QuizSubmission.model.js";
import Assignment from "../Models/Assignment.model.js";
import AssignmentSubmission from "../Models/AssignmentSubmission.model.js";
import User from "../Models/User.model.js";

const parseDateRange = (rangeQuery) => {
  const now = new Date();
  if (!rangeQuery || rangeQuery === "all") return null;
  const days = parseInt(rangeQuery, 10);
  if (isNaN(days) || days <= 0) return null;
  const startDate = new Date();
  startDate.setDate(now.getDate() - days);
  startDate.setHours(0, 0, 0, 0);
  return startDate;
};

export const getStudentDashboardAnalytics = async (req, res) => {
  try {
    const studentId = req.user._id || req.user.id;
    const studentObjectId = new mongoose.Types.ObjectId(studentId);
    const timeFilter = req.query.range || "30";
    const startDate = parseDateRange(timeFilter);

    const enrolledCourses = await Course.find({ enrolled: studentObjectId })
      .populate("createdBy", "name email profileImage role")
      .lean();

    const courseIds = enrolledCourses.map((c) => c._id);

    const allUnits = await Unit.find({ courseId: { $in: courseIds } }).sort("order").lean();
    const unitIds = allUnits.map((u) => u._id);
    const allLessons = await Lesson.find({ unitId: { $in: unitIds } }).sort("order").lean();

    const courseLessonMap = {};
    courseIds.forEach((id) => {
      courseLessonMap[id.toString()] = [];
    });

    const unitCourseMap = {};
    allUnits.forEach((u) => {
      unitCourseMap[u._id.toString()] = u.courseId.toString();
    });

    allLessons.forEach((l) => {
      const courseIdStr = unitCourseMap[l.unitId.toString()];
      if (courseIdStr && courseLessonMap[courseIdStr]) {
        courseLessonMap[courseIdStr].push(l);
      }
    });

    const progressRecords = await Progress.find({
      userId: studentObjectId,
      courseId: { $in: courseIds },
    }).lean();

    const progressMap = {};
    progressRecords.forEach((p) => {
      progressMap[p.courseId.toString()] = p;
    });

    let completedCoursesCount = 0;
    let inProgressCoursesCount = 0;
    let notStartedCoursesCount = 0;
    let totalProgressSum = 0;

    const detailedCourses = enrolledCourses.map((course) => {
      const cIdStr = course._id.toString();
      const lessons = courseLessonMap[cIdStr] || [];
      const totalLessons = lessons.length;
      const progress = progressMap[cIdStr];
      const completedLessonIds = (progress?.completedLessons || []).map((id) => id.toString());
      const completedLessonsCount = lessons.filter((l) =>
        completedLessonIds.includes(l._id.toString())
      ).length;

      let percentage = 0;
      if (totalLessons > 0) {
        percentage = Math.round((completedLessonsCount / totalLessons) * 100);
      }

      let status = "Not Started";
      if (percentage === 100) {
        status = "Completed";
        completedCoursesCount++;
      } else if (percentage > 0) {
        status = "In Progress";
        inProgressCoursesCount++;
      } else {
        notStartedCoursesCount++;
      }

      totalProgressSum += percentage;

      return {
        _id: course._id,
        title: course.title,
        category: course.category,
        thumbnail: course.thumbnail,
        instructor: course.createdBy
          ? {
              _id: course.createdBy._id,
              name: course.createdBy.name,
              email: course.createdBy.email,
              profileImage: course.createdBy.profileImage,
            }
          : null,
        totalLessons,
        completedLessons: completedLessonsCount,
        progressPercentage: percentage,
        status,
        lastActivity: progress?.updatedAt || course.createdAt,
      };
    });

    const totalEnrolled = enrolledCourses.length;
    const overallProgress =
      totalEnrolled > 0 ? Math.round(totalProgressSum / totalEnrolled) : 0;

    const publishedQuizzes = await Quiz.find({
      courseId: { $in: courseIds },
      status: "published",
    }).lean();
    const publishedQuizIds = publishedQuizzes.map((q) => q._id);

    const quizSubmissions = await QuizSubmission.find({
      quizId: { $in: publishedQuizIds },
      studentId: studentObjectId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const attemptedQuizIdSet = new Set(quizSubmissions.map((s) => s.quizId.toString()));
    const totalQuizzesAttempted = attemptedQuizIdSet.size;

    let totalScoreSum = 0;
    let totalMaxScoreSum = 0;
    let highestScorePct = 0;

    quizSubmissions.forEach((sub) => {
      const pct = sub.maxScore > 0 ? Math.round((sub.totalScore / sub.maxScore) * 100) : 0;
      if (pct > highestScorePct) highestScorePct = pct;
      totalScoreSum += sub.totalScore;
      totalMaxScoreSum += sub.maxScore;
    });

    const averageQuizScore =
      totalMaxScoreSum > 0 ? Math.round((totalScoreSum / totalMaxScoreSum) * 100) : 0;

    const quizMap = {};
    publishedQuizzes.forEach((q) => {
      quizMap[q._id.toString()] = q;
    });

    const courseMap = {};
    enrolledCourses.forEach((c) => {
      courseMap[c._id.toString()] = c;
    });

    const recentQuizAttempts = quizSubmissions.slice(0, 5).map((sub) => {
      const quiz = quizMap[sub.quizId.toString()];
      const course = quiz ? courseMap[quiz.courseId.toString()] : null;
      const scorePct = sub.maxScore > 0 ? Math.round((sub.totalScore / sub.maxScore) * 100) : 0;
      return {
        _id: sub._id,
        quizId: sub.quizId,
        quizTitle: quiz?.title || "Quiz",
        courseTitle: course?.title || "Course",
        courseId: quiz?.courseId,
        totalScore: sub.totalScore,
        maxScore: sub.maxScore,
        scorePercentage: scorePct,
        submittedAt: sub.createdAt,
      };
    });

    const publishedAssignments = await Assignment.find({
      courseId: { $in: courseIds },
      status: "published",
    }).lean();
    const publishedAssignmentIds = publishedAssignments.map((a) => a._id);

    const assignmentSubmissions = await AssignmentSubmission.find({
      assignmentId: { $in: publishedAssignmentIds },
      studentId: studentObjectId,
    })
      .sort({ submittedAt: -1 })
      .lean();

    const submissionMap = {};
    assignmentSubmissions.forEach((s) => {
      submissionMap[s.assignmentId.toString()] = s;
    });

    const now = new Date();
    let pendingAssignmentsCount = 0;
    let submittedAssignmentsCount = 0;
    let evaluatedAssignmentsCount = 0;
    let overdueAssignmentsCount = 0;
    let totalMarksObtained = 0;
    let totalMarksPossible = 0;

    const assignmentList = publishedAssignments.map((assign) => {
      const sub = submissionMap[assign._id.toString()];
      const course = courseMap[assign.courseId.toString()];
      const isDeadlinePassed = new Date(assign.deadline) < now;

      let subStatus = "pending";
      if (sub) {
        submittedAssignmentsCount++;
        if (sub.status === "marked") {
          evaluatedAssignmentsCount++;
          if (typeof sub.marks === "number" && assign.maximumMarks > 0) {
            totalMarksObtained += sub.marks;
            totalMarksPossible += assign.maximumMarks;
          }
          subStatus = "marked";
        } else {
          subStatus = "submitted";
        }
      } else {
        if (isDeadlinePassed) {
          overdueAssignmentsCount++;
          subStatus = "overdue";
        } else {
          pendingAssignmentsCount++;
          subStatus = "pending";
        }
      }

      return {
        _id: assign._id,
        title: assign.title,
        courseId: assign.courseId,
        courseTitle: course?.title || "Course",
        deadline: assign.deadline,
        maximumMarks: assign.maximumMarks,
        status: subStatus,
        marks: sub?.marks ?? null,
        feedback: sub?.feedback ?? null,
        isLate: sub?.isLate ?? false,
        submittedAt: sub?.submittedAt ?? null,
      };
    });

    const averageAssignmentMarks =
      totalMarksPossible > 0
        ? Math.round((totalMarksObtained / totalMarksPossible) * 100)
        : null;

    const activityTrendMap = {};
    const daysCount = timeFilter === "7" ? 7 : timeFilter === "90" ? 90 : 30;
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      activityTrendMap[key] = {
        date: key,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        quizSubmissions: 0,
        assignmentSubmissions: 0,
        totalEvents: 0,
      };
    }

    quizSubmissions.forEach((sub) => {
      const dateKey = new Date(sub.createdAt).toISOString().slice(0, 10);
      if (activityTrendMap[dateKey]) {
        activityTrendMap[dateKey].quizSubmissions++;
        activityTrendMap[dateKey].totalEvents++;
      }
    });

    assignmentSubmissions.forEach((sub) => {
      const dateKey = new Date(sub.submittedAt).toISOString().slice(0, 10);
      if (activityTrendMap[dateKey]) {
        activityTrendMap[dateKey].assignmentSubmissions++;
        activityTrendMap[dateKey].totalEvents++;
      }
    });

    const activityTrend = Object.values(activityTrendMap);

    const upcomingAssignments = assignmentList
      .filter((a) => a.status === "pending" && new Date(a.deadline) >= now)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5);

    const availableQuizzes = publishedQuizzes
      .filter((q) => {
        const attempts = quizSubmissions.filter(
          (s) => s.quizId.toString() === q._id.toString()
        ).length;
        return attempts < q.maxAttempts && new Date(q.deadline) >= now;
      })
      .map((q) => {
        const course = courseMap[q.courseId.toString()];
        return {
          _id: q._id,
          title: q.title,
          courseId: q.courseId,
          courseTitle: course?.title || "Course",
          duration: q.duration,
          deadline: q.deadline,
          maxAttempts: q.maxAttempts,
        };
      })
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalEnrolled,
          completedCourses: completedCoursesCount,
          inProgressCourses: inProgressCoursesCount,
          notStartedCourses: notStartedCoursesCount,
          overallProgress,
          totalAssigned: publishedAssignments.length,
          pendingAssignments: pendingAssignmentsCount,
          submittedAssignments: submittedAssignmentsCount,
          overdueAssignments: overdueAssignmentsCount,
          evaluatedAssignments: evaluatedAssignmentsCount,
          averageAssignmentScore: averageAssignmentMarks,
          totalQuizzes: publishedQuizzes.length,
          attemptedQuizzes: totalQuizzesAttempted,
          averageQuizScore,
          highestQuizScore: highestScorePct,
        },
        distribution: [
          { name: "Completed", value: completedCoursesCount, color: "#10b981" },
          { name: "In Progress", value: inProgressCoursesCount, color: "#6366f1" },
          { name: "Not Started", value: notStartedCoursesCount, color: "#94a3b8" },
        ],
        enrolledCourses: detailedCourses,
        recentQuizAttempts,
        assignments: assignmentList.slice(0, 8),
        upcomingWork: {
          assignments: upcomingAssignments,
          quizzes: availableQuizzes,
        },
        activityTrend,
      },
    });
  } catch (error) {
    console.error("Get Student Dashboard Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student dashboard analytics",
      error: error.message,
    });
  }
};

export const getInstructorDashboardAnalytics = async (req, res) => {
  try {
    const instructorId = req.user._id || req.user.id;
    const instructorObjectId = new mongoose.Types.ObjectId(instructorId);
    const isAdmin = req.user.role === "Admin";
    const timeFilter = req.query.range || "30";
    const startDate = parseDateRange(timeFilter);

    const courseQuery = isAdmin ? {} : { createdBy: instructorObjectId };
    const courses = await Course.find(courseQuery)
      .populate("createdBy", "name email profileImage")
      .lean();

    const courseIds = courses.map((c) => c._id);

    const uniqueStudentIdSet = new Set();
    let totalEnrollmentInstances = 0;
    courses.forEach((c) => {
      (c.enrolled || []).forEach((sId) => {
        uniqueStudentIdSet.add(sId.toString());
        totalEnrollmentInstances++;
      });
    });

    const activeCoursesCount = courses.filter((c) => c.status === "published").length;
    const draftCoursesCount = courses.filter((c) => c.status === "draft").length;

    const allUnits = await Unit.find({ courseId: { $in: courseIds } }).lean();
    const unitIds = allUnits.map((u) => u._id);
    const allLessons = await Lesson.find({ unitId: { $in: unitIds } }).lean();

    const courseLessonMap = {};
    courseIds.forEach((id) => {
      courseLessonMap[id.toString()] = [];
    });

    const unitCourseMap = {};
    allUnits.forEach((u) => {
      unitCourseMap[u._id.toString()] = u.courseId.toString();
    });

    allLessons.forEach((l) => {
      const cId = unitCourseMap[l.unitId.toString()];
      if (cId && courseLessonMap[cId]) {
        courseLessonMap[cId].push(l);
      }
    });

    const allProgressRecords = await Progress.find({
      courseId: { $in: courseIds },
    }).lean();

    const courseProgressMap = {};
    courseIds.forEach((id) => {
      courseProgressMap[id.toString()] = [];
    });

    allProgressRecords.forEach((p) => {
      const cId = p.courseId.toString();
      if (courseProgressMap[cId]) {
        courseProgressMap[cId].push(p);
      }
    });

    let totalCompletedLearnersAcrossCourses = 0;
    let totalLearnersSum = 0;
    let totalProgressSumAcrossCourses = 0;

    const coursePerformanceList = courses.map((course) => {
      const cIdStr = course._id.toString();
      const enrolledLearners = (course.enrolled || []).map((id) => id.toString());
      const totalEnrolled = enrolledLearners.length;
      const lessons = courseLessonMap[cIdStr] || [];
      const totalLessons = lessons.length;
      const progressRecords = courseProgressMap[cIdStr] || [];

      let completedCount = 0;
      let inProgressCount = 0;
      let notStartedCount = 0;
      let progressSum = 0;

      enrolledLearners.forEach((studentIdStr) => {
        const prog = progressRecords.find(
          (p) => p.userId.toString() === studentIdStr
        );
        const completedLessons = (prog?.completedLessons || []).map((id) => id.toString());
        const matchedCompleted = lessons.filter((l) =>
          completedLessons.includes(l._id.toString())
        ).length;

        let pct = 0;
        if (totalLessons > 0) {
          pct = Math.round((matchedCompleted / totalLessons) * 100);
        }

        if (pct === 100) {
          completedCount++;
        } else if (pct > 0) {
          inProgressCount++;
        } else {
          notStartedCount++;
        }

        progressSum += pct;
      });

      const avgProgress =
        totalEnrolled > 0 ? Math.round(progressSum / totalEnrolled) : 0;
      const completionRate =
        totalEnrolled > 0 ? Math.round((completedCount / totalEnrolled) * 100) : 0;

      totalCompletedLearnersAcrossCourses += completedCount;
      totalLearnersSum += totalEnrolled;
      totalProgressSumAcrossCourses += avgProgress;

      return {
        _id: course._id,
        title: course.title,
        status: course.status,
        category: course.category,
        thumbnail: course.thumbnail,
        createdAt: course.createdAt,
        totalEnrolled,
        totalLessons,
        completedLearners: completedCount,
        inProgressLearners: inProgressCount,
        notStartedLearners: notStartedCount,
        averageProgress: avgProgress,
        completionRate,
      };
    });

    const overallCohortAvgProgress =
      courses.length > 0 ? Math.round(totalProgressSumAcrossCourses / courses.length) : 0;

    const assignments = await Assignment.find({ courseId: { $in: courseIds } }).lean();
    const assignmentIds = assignments.map((a) => a._id);

    const submissions = await AssignmentSubmission.find({
      assignmentId: { $in: assignmentIds },
    }).lean();

    let pendingEvaluations = 0;
    let evaluatedSubmissions = 0;
    let totalAssignmentMarksSum = 0;
    let totalAssignmentMaxMarksSum = 0;

    const assignmentMap = {};
    assignments.forEach((a) => {
      assignmentMap[a._id.toString()] = a;
    });

    submissions.forEach((s) => {
      if (s.status === "submitted") {
        pendingEvaluations++;
      } else if (s.status === "marked") {
        evaluatedSubmissions++;
        const a = assignmentMap[s.assignmentId.toString()];
        if (typeof s.marks === "number" && a && a.maximumMarks > 0) {
          totalAssignmentMarksSum += s.marks;
          totalAssignmentMaxMarksSum += a.maximumMarks;
        }
      }
    });

    const averageAssignmentScore =
      totalAssignmentMaxMarksSum > 0
        ? Math.round((totalAssignmentMarksSum / totalAssignmentMaxMarksSum) * 100)
        : null;

    const quizzes = await Quiz.find({ courseId: { $in: courseIds } }).lean();
    const quizIds = quizzes.map((q) => q._id);

    const quizSubmissions = await QuizSubmission.find({
      quizId: { $in: quizIds },
    }).lean();

    let totalQuizScoreSum = 0;
    let totalQuizMaxScoreSum = 0;

    quizSubmissions.forEach((sub) => {
      totalQuizScoreSum += sub.totalScore;
      totalQuizMaxScoreSum += sub.maxScore;
    });

    const averageQuizScore =
      totalQuizMaxScoreSum > 0
        ? Math.round((totalQuizScoreSum / totalQuizMaxScoreSum) * 100)
        : 0;

    const daysCount = timeFilter === "7" ? 7 : timeFilter === "90" ? 90 : 30;
    const trendMap = {};
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      trendMap[key] = {
        date: key,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        submissions: 0,
        quizAttempts: 0,
        totalActivity: 0,
      };
    }

    submissions.forEach((s) => {
      const key = new Date(s.submittedAt).toISOString().slice(0, 10);
      if (trendMap[key]) {
        trendMap[key].submissions++;
        trendMap[key].totalActivity++;
      }
    });

    quizSubmissions.forEach((qs) => {
      const key = new Date(qs.createdAt).toISOString().slice(0, 10);
      if (trendMap[key]) {
        trendMap[key].quizAttempts++;
        trendMap[key].totalActivity++;
      }
    });

    const activityTrend = Object.values(trendMap);

    const studentsRequiringAttention = [];
    const allStudentUsers = await User.find({
      _id: { $in: Array.from(uniqueStudentIdSet) },
    }).select("name email profileImage").lean();

    const studentUserMap = {};
    allStudentUsers.forEach((u) => {
      studentUserMap[u._id.toString()] = u;
    });

    courses.forEach((course) => {
      const cIdStr = course._id.toString();
      const lessons = courseLessonMap[cIdStr] || [];
      const totalLessons = lessons.length;
      const progressRecords = courseProgressMap[cIdStr] || [];

      (course.enrolled || []).forEach((studentId) => {
        const sIdStr = studentId.toString();
        const user = studentUserMap[sIdStr];
        if (!user) return;

        const prog = progressRecords.find((p) => p.userId.toString() === sIdStr);
        const completedLessons = (prog?.completedLessons || []).map((id) => id.toString());
        const matched = lessons.filter((l) => completedLessons.includes(l._id.toString())).length;
        const pct = totalLessons > 0 ? Math.round((matched / totalLessons) * 100) : 0;

        let reason = null;
        if (totalLessons > 0 && pct === 0) {
          reason = "Enrolled but has not started any lessons yet";
        } else if (totalLessons > 0 && pct < 25) {
          reason = `Low course progress (${pct}%) across ${totalLessons} lessons`;
        }

        if (reason && studentsRequiringAttention.length < 10) {
          studentsRequiringAttention.push({
            studentId: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage,
            courseId: course._id,
            courseTitle: course.title,
            progress: pct,
            reason,
          });
        }
      });
    });

    return res.status(200).json({
      success: true,
      data: {
        kpis: {
          totalCourses: courses.length,
          activeCourses: activeCoursesCount,
          draftCourses: draftCoursesCount,
          totalEnrollments: totalEnrollmentInstances,
          uniqueStudents: uniqueStudentIdSet.size,
          averageCohortProgress: overallCohortAvgProgress,
          totalCompletedLearners: totalCompletedLearnersAcrossCourses,
          pendingEvaluations,
          evaluatedSubmissions,
          totalAssignments: assignments.length,
          totalQuizzes: quizzes.length,
          totalQuizAttempts: quizSubmissions.length,
          averageQuizScore,
          averageAssignmentScore,
        },
        coursePerformance: coursePerformanceList,
        activityTrend,
        studentsRequiringAttention,
      },
    });
  } catch (error) {
    console.error("Get Instructor Dashboard Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch instructor dashboard analytics",
      error: error.message,
    });
  }
};

export const getCourseDetailedAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id || req.user.id;
    const role = req.user.role;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId)
      .populate("createdBy", "name email profileImage")
      .lean();

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    if (role === "Instructor" && course.createdBy._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view analytics for this course",
      });
    }

    const enrolledStudentIds = (course.enrolled || []).map((id) => id.toString());
    const totalEnrolled = enrolledStudentIds.length;

    const units = await Unit.find({ courseId }).sort("order").lean();
    const unitIds = units.map((u) => u._id);
    const lessons = await Lesson.find({ unitId: { $in: unitIds } }).sort("order").lean();
    const totalLessons = lessons.length;

    const progressRecords = await Progress.find({ courseId }).lean();
    const enrolledUsers = await User.find({
      _id: { $in: enrolledStudentIds },
    }).select("name email profileImage createdAt").lean();

    const userMap = {};
    enrolledUsers.forEach((u) => {
      userMap[u._id.toString()] = u;
    });

    const progressMap = {};
    progressRecords.forEach((p) => {
      progressMap[p.userId.toString()] = p;
    });

    let completedLearners = 0;
    let inProgressLearners = 0;
    let notStartedLearners = 0;
    let totalProgressSum = 0;

    const lessonCompletionCountMap = {};
    lessons.forEach((l) => {
      lessonCompletionCountMap[l._id.toString()] = 0;
    });

    const learnerTable = enrolledStudentIds.map((sIdStr) => {
      const user = userMap[sIdStr];
      const prog = progressMap[sIdStr];
      const completedLessonIds = (prog?.completedLessons || []).map((id) => id.toString());

      completedLessonIds.forEach((lId) => {
        if (lessonCompletionCountMap[lId] !== undefined) {
          lessonCompletionCountMap[lId]++;
        }
      });

      const completedCount = lessons.filter((l) =>
        completedLessonIds.includes(l._id.toString())
      ).length;

      const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      let status = "Not Started";
      if (pct === 100) {
        status = "Completed";
        completedLearners++;
      } else if (pct > 0) {
        status = "In Progress";
        inProgressLearners++;
      } else {
        notStartedLearners++;
      }

      totalProgressSum += pct;

      return {
        studentId: sIdStr,
        name: user?.name || "Student",
        email: user?.email || "No email",
        profileImage: user?.profileImage || "",
        progressPercentage: pct,
        completedLessons: completedCount,
        totalLessons,
        status,
        lastActivity: prog?.updatedAt || null,
        enrollmentDate: user?.createdAt || null,
      };
    });

    const averageProgress =
      totalEnrolled > 0 ? Math.round(totalProgressSum / totalEnrolled) : 0;
    const completionRate =
      totalEnrolled > 0 ? Math.round((completedLearners / totalEnrolled) * 100) : 0;

    const unitAnalytics = units.map((unit) => {
      const unitLessons = lessons.filter(
        (l) => l.unitId.toString() === unit._id.toString()
      );
      const unitTotalLessons = unitLessons.length;
      
      let unitCompletedLearnerCount = 0;
      if (unitTotalLessons > 0 && totalEnrolled > 0) {
        enrolledStudentIds.forEach((sIdStr) => {
          const prog = progressMap[sIdStr];
          const completedIds = (prog?.completedLessons || []).map((id) => id.toString());
          const isUnitFullyCompleted = unitLessons.every((l) =>
            completedIds.includes(l._id.toString())
          );
          if (isUnitFullyCompleted) {
            unitCompletedLearnerCount++;
          }
        });
      }

      const unitCompletionPct =
        totalEnrolled > 0
          ? Math.round((unitCompletedLearnerCount / totalEnrolled) * 100)
          : 0;

      return {
        _id: unit._id,
        title: unit.title,
        order: unit.order,
        totalLessons: unitTotalLessons,
        completedLearnersCount: unitCompletedLearnerCount,
        completionPercentage: unitCompletionPct,
        lessons: unitLessons.map((l) => ({
          _id: l._id,
          title: l.title,
          contentType: l.contentType,
          order: l.order,
          completedCount: lessonCompletionCountMap[l._id.toString()] || 0,
          completionPercentage:
            totalEnrolled > 0
              ? Math.round(
                  ((lessonCompletionCountMap[l._id.toString()] || 0) / totalEnrolled) * 100
                )
              : 0,
        })),
      };
    });

    const quizzes = await Quiz.find({ courseId }).lean();
    const quizIds = quizzes.map((q) => q._id);
    const quizSubmissions = await QuizSubmission.find({ quizId: { $in: quizIds } })
      .populate("studentId", "name email profileImage")
      .sort({ createdAt: -1 })
      .lean();

    const quizAnalyticsList = quizzes.map((q) => {
      const qSubmissions = quizSubmissions.filter(
        (s) => s.quizId.toString() === q._id.toString()
      );
      const totalAttempts = qSubmissions.length;
      const uniqueStudentAttempts = new Set(qSubmissions.map((s) => s.studentId?._id?.toString() || s.studentId?.toString())).size;

      let scoreSum = 0;
      let maxScoreSum = 0;
      qSubmissions.forEach((sub) => {
        scoreSum += sub.totalScore;
        maxScoreSum += sub.maxScore;
      });

      const avgScorePct =
        maxScoreSum > 0 ? Math.round((scoreSum / maxScoreSum) * 100) : 0;
      const participationRate =
        totalEnrolled > 0 ? Math.round((uniqueStudentAttempts / totalEnrolled) * 100) : 0;

      return {
        _id: q._id,
        title: q.title,
        status: q.status,
        duration: q.duration,
        maxAttempts: q.maxAttempts,
        deadline: q.deadline,
        totalAttempts,
        uniqueParticipants: uniqueStudentAttempts,
        participationRate,
        averageScorePercentage: avgScorePct,
      };
    });

    const assignments = await Assignment.find({ courseId }).lean();
    const assignmentIds = assignments.map((a) => a._id);
    const assignmentSubmissions = await AssignmentSubmission.find({
      assignmentId: { $in: assignmentIds },
    })
      .populate("studentId", "name email profileImage")
      .sort({ submittedAt: -1 })
      .lean();

    const assignmentAnalyticsList = assignments.map((assign) => {
      const aSubmissions = assignmentSubmissions.filter(
        (s) => s.assignmentId.toString() === assign._id.toString()
      );
      const totalSubmissions = aSubmissions.length;
      const evaluatedCount = aSubmissions.filter((s) => s.status === "marked").length;
      const toEvaluateCount = aSubmissions.filter((s) => s.status === "submitted").length;
      const lateCount = aSubmissions.filter((s) => s.isLate).length;

      let marksSum = 0;
      let marksEvaluatedCount = 0;
      aSubmissions.forEach((s) => {
        if (typeof s.marks === "number") {
          marksSum += s.marks;
          marksEvaluatedCount++;
        }
      });

      const avgMarks =
        marksEvaluatedCount > 0 ? Math.round((marksSum / marksEvaluatedCount) * 10) / 10 : null;
      const submissionRate =
        totalEnrolled > 0 ? Math.round((totalSubmissions / totalEnrolled) * 100) : 0;

      return {
        _id: assign._id,
        title: assign.title,
        status: assign.status,
        maximumMarks: assign.maximumMarks,
        deadline: assign.deadline,
        totalSubmissions,
        evaluatedCount,
        toEvaluateCount,
        lateCount,
        submissionRate,
        averageMarks: avgMarks,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
          description: course.description,
          category: course.category,
          thumbnail: course.thumbnail,
          status: course.status,
          createdAt: course.createdAt,
          instructor: course.createdBy,
        },
        kpis: {
          totalEnrolled,
          uniqueStudents: totalEnrolled,
          completedLearners,
          inProgressLearners,
          notStartedLearners,
          averageProgress,
          completionRate,
          totalUnits: units.length,
          totalLessons,
          totalQuizzes: quizzes.length,
          totalAssignments: assignments.length,
        },
        distribution: [
          { name: "Completed", value: completedLearners, color: "#10b981" },
          { name: "In Progress", value: inProgressLearners, color: "#6366f1" },
          { name: "Not Started", value: notStartedLearners, color: "#94a3b8" },
        ],
        units: unitAnalytics,
        quizzes: quizAnalyticsList,
        assignments: assignmentAnalyticsList,
        learners: learnerTable,
        recentQuizSubmissions: quizSubmissions.slice(0, 10).map((s) => ({
          _id: s._id,
          studentName: s.studentId?.name || "Student",
          studentEmail: s.studentId?.email || "",
          studentImage: s.studentId?.profileImage || "",
          score: s.totalScore,
          maxScore: s.maxScore,
          percentage: s.maxScore > 0 ? Math.round((s.totalScore / s.maxScore) * 100) : 0,
          date: s.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Get Course Detailed Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course analytics",
      error: error.message,
    });
  }
};

export const getStudentDetailedAnalytics = async (req, res) => {
  try {
    let targetStudentId = req.params.studentId;
    const authUserId = (req.user._id || req.user.id).toString();
    const userRole = req.user.role;
    const timeFilter = req.query.range || "30";
    const startDate = parseDateRange(timeFilter);

    if (!targetStudentId || targetStudentId === "undefined" || targetStudentId === "me") {
      targetStudentId = authUserId;
    }

    if (!mongoose.Types.ObjectId.isValid(targetStudentId)) {
      return res.status(400).json({ success: false, message: "Invalid student ID" });
    }

    const studentUser = await User.findById(targetStudentId).select(
      "name email profileImage role accountStatus createdAt"
    ).lean();

    if (!studentUser) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    let authorizedCourseQuery = { enrolled: new mongoose.Types.ObjectId(targetStudentId) };

    if (userRole === "Student") {
      if (authUserId !== targetStudentId.toString()) {
        return res.status(403).json({
          success: false,
          message: "You can only access your own analytics",
        });
      }
    } else if (userRole === "Instructor") {
      authorizedCourseQuery.createdBy = new mongoose.Types.ObjectId(authUserId);
    }

    const enrolledCourses = await Course.find(authorizedCourseQuery)
      .populate("createdBy", "name email profileImage")
      .lean();

    const courseIds = enrolledCourses.map((c) => c._id);

    const allUnits = await Unit.find({ courseId: { $in: courseIds } }).sort("order").lean();
    const unitIds = allUnits.map((u) => u._id);
    const allLessons = await Lesson.find({ unitId: { $in: unitIds } }).sort("order").lean();

    const courseLessonMap = {};
    courseIds.forEach((id) => {
      courseLessonMap[id.toString()] = [];
    });

    const unitCourseMap = {};
    allUnits.forEach((u) => {
      unitCourseMap[u._id.toString()] = u.courseId.toString();
    });

    allLessons.forEach((l) => {
      const cId = unitCourseMap[l.unitId.toString()];
      if (cId && courseLessonMap[cId]) {
        courseLessonMap[cId].push(l);
      }
    });

    const progressRecords = await Progress.find({
      userId: new mongoose.Types.ObjectId(targetStudentId),
      courseId: { $in: courseIds },
    }).lean();

    const progressMap = {};
    progressRecords.forEach((p) => {
      progressMap[p.courseId.toString()] = p;
    });

    let completedCoursesCount = 0;
    let inProgressCoursesCount = 0;
    let notStartedCoursesCount = 0;
    let progressSum = 0;

    const courseWiseProgress = enrolledCourses.map((course) => {
      const cIdStr = course._id.toString();
      const lessons = courseLessonMap[cIdStr] || [];
      const totalLessons = lessons.length;
      const prog = progressMap[cIdStr];
      const completedLessonIds = (prog?.completedLessons || []).map((id) => id.toString());
      const completedCount = lessons.filter((l) =>
        completedLessonIds.includes(l._id.toString())
      ).length;

      const pct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

      let status = "Not Started";
      if (pct === 100) {
        status = "Completed";
        completedCoursesCount++;
      } else if (pct > 0) {
        status = "In Progress";
        inProgressCoursesCount++;
      } else {
        notStartedCoursesCount++;
      }

      progressSum += pct;

      return {
        _id: course._id,
        title: course.title,
        category: course.category,
        thumbnail: course.thumbnail,
        instructor: course.createdBy
          ? {
              _id: course.createdBy._id,
              name: course.createdBy.name,
              email: course.createdBy.email,
              profileImage: course.createdBy.profileImage,
            }
          : null,
        totalLessons,
        completedLessons: completedCount,
        progressPercentage: pct,
        status,
        lastActivity: prog?.updatedAt || null,
      };
    });

    const overallProgress =
      enrolledCourses.length > 0 ? Math.round(progressSum / enrolledCourses.length) : 0;

    const quizzes = await Quiz.find({ courseId: { $in: courseIds } }).lean();
    const quizIds = quizzes.map((q) => q._id);
    const quizSubmissions = await QuizSubmission.find({
      quizId: { $in: quizIds },
      studentId: new mongoose.Types.ObjectId(targetStudentId),
    })
      .sort({ createdAt: -1 })
      .lean();

    const quizMap = {};
    quizzes.forEach((q) => {
      quizMap[q._id.toString()] = q;
    });

    const courseMap = {};
    enrolledCourses.forEach((c) => {
      courseMap[c._id.toString()] = c;
    });

    let totalQuizScoreSum = 0;
    let totalQuizMaxScoreSum = 0;
    let highestQuizScorePct = 0;

    const quizPerformanceList = quizSubmissions.map((sub) => {
      const quiz = quizMap[sub.quizId.toString()];
      const course = quiz ? courseMap[quiz.courseId.toString()] : null;
      const pct = sub.maxScore > 0 ? Math.round((sub.totalScore / sub.maxScore) * 100) : 0;
      if (pct > highestQuizScorePct) highestQuizScorePct = pct;
      totalQuizScoreSum += sub.totalScore;
      totalQuizMaxScoreSum += sub.maxScore;

      return {
        _id: sub._id,
        quizId: sub.quizId,
        quizTitle: quiz?.title || "Quiz",
        courseId: quiz?.courseId,
        courseTitle: course?.title || "Course",
        totalScore: sub.totalScore,
        maxScore: sub.maxScore,
        scorePercentage: pct,
        attemptDate: sub.createdAt,
      };
    });

    const averageQuizScore =
      totalQuizMaxScoreSum > 0
        ? Math.round((totalQuizScoreSum / totalQuizMaxScoreSum) * 100)
        : null;

    const assignments = await Assignment.find({ courseId: { $in: courseIds } }).lean();
    const assignmentIds = assignments.map((a) => a._id);
    const assignmentSubmissions = await AssignmentSubmission.find({
      assignmentId: { $in: assignmentIds },
      studentId: new mongoose.Types.ObjectId(targetStudentId),
    })
      .sort({ submittedAt: -1 })
      .lean();

    const submissionMap = {};
    assignmentSubmissions.forEach((s) => {
      submissionMap[s.assignmentId.toString()] = s;
    });

    const now = new Date();
    let submittedAssignments = 0;
    let pendingAssignments = 0;
    let overdueAssignments = 0;
    let evaluatedAssignments = 0;
    let totalMarksEarned = 0;
    let totalMarksTotal = 0;

    const assignmentPerformanceList = assignments.map((assign) => {
      const sub = submissionMap[assign._id.toString()];
      const course = courseMap[assign.courseId.toString()];
      const isPast = new Date(assign.deadline) < now;

      let status = "pending";
      if (sub) {
        submittedAssignments++;
        if (sub.status === "marked") {
          evaluatedAssignments++;
          if (typeof sub.marks === "number" && assign.maximumMarks > 0) {
            totalMarksEarned += sub.marks;
            totalMarksTotal += assign.maximumMarks;
          }
          status = "marked";
        } else {
          status = "submitted";
        }
      } else {
        if (isPast) {
          overdueAssignments++;
          status = "overdue";
        } else {
          pendingAssignments++;
          status = "pending";
        }
      }

      return {
        _id: assign._id,
        title: assign.title,
        courseId: assign.courseId,
        courseTitle: course?.title || "Course",
        deadline: assign.deadline,
        maximumMarks: assign.maximumMarks,
        status,
        marks: sub?.marks ?? null,
        feedback: sub?.feedback ?? null,
        isLate: sub?.isLate ?? false,
        submittedAt: sub?.submittedAt ?? null,
      };
    });

    const averageAssignmentScore =
      totalMarksTotal > 0 ? Math.round((totalMarksEarned / totalMarksTotal) * 100) : null;

    const daysCount = timeFilter === "7" ? 7 : timeFilter === "90" ? 90 : 30;
    const activityTrendMap = {};
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      activityTrendMap[key] = {
        date: key,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        quizAttempts: 0,
        assignmentSubmissions: 0,
        totalActions: 0,
      };
    }

    quizSubmissions.forEach((sub) => {
      const key = new Date(sub.createdAt).toISOString().slice(0, 10);
      if (activityTrendMap[key]) {
        activityTrendMap[key].quizAttempts++;
        activityTrendMap[key].totalActions++;
      }
    });

    assignmentSubmissions.forEach((sub) => {
      const key = new Date(sub.submittedAt).toISOString().slice(0, 10);
      if (activityTrendMap[key]) {
        activityTrendMap[key].assignmentSubmissions++;
        activityTrendMap[key].totalActions++;
      }
    });

    const activityTrend = Object.values(activityTrendMap);

    return res.status(200).json({
      success: true,
      data: {
        student: {
          _id: studentUser._id,
          name: studentUser.name,
          email: studentUser.email,
          profileImage: studentUser.profileImage,
          role: studentUser.role,
          accountStatus: studentUser.accountStatus,
          joinedAt: studentUser.createdAt,
        },
        kpis: {
          totalEnrolledCourses: enrolledCourses.length,
          completedCourses: completedCoursesCount,
          inProgressCourses: inProgressCoursesCount,
          notStartedCourses: notStartedCoursesCount,
          overallProgress,
          totalAssignedAssignments: assignments.length,
          submittedAssignments,
          pendingAssignments,
          overdueAssignments,
          evaluatedAssignments,
          averageAssignmentScore,
          totalQuizzesAttempted: quizSubmissions.length,
          averageQuizScore,
          highestQuizScore: highestQuizScorePct,
        },
        distribution: [
          { name: "Completed", value: completedCoursesCount, color: "#10b981" },
          { name: "In Progress", value: inProgressCoursesCount, color: "#6366f1" },
          { name: "Not Started", value: notStartedCoursesCount, color: "#94a3b8" },
        ],
        activityTrend,
        courses: courseWiseProgress,
        quizPerformance: quizPerformanceList,
        assignmentPerformance: assignmentPerformanceList,
      },
    });
  } catch (error) {
    console.error("Get Student Detailed Analytics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student detailed analytics",
      error: error.message,
    });
  }
};
