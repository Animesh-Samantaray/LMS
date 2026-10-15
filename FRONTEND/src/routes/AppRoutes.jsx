import React, { Suspense, lazy } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/auth";
import LoadingScreen from "../components/LoadingScreen";
import RouteLoadingFallback from "../components/RouteLoadingFallback";

// Lazy-loaded routes for optimal initial bundle size and rapid LCP
const LandingPage = lazy(() => import("../pages/LandingPage"));
const Login = lazy(() => import("../pages/Login"));
const Signup = lazy(() => import("../pages/Signup"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const VerifyTwoFactor = lazy(() => import("../pages/VerifyTwoFactor"));
const VerifyCertificate = lazy(() => import("../pages/VerifyCertificate"));

const StudentDashboard = lazy(() => import("../pages/dashboards/StudentDashboard"));
const StudentMyCourses = lazy(() => import("../pages/dashboards/student/StudentMyCourses"));
const StudentCertificates = lazy(() => import("../pages/dashboards/student/StudentCertificates"));
const ViewCertificate = lazy(() => import("../pages/dashboards/student/ViewCertificate"));
const InstructorDashboard = lazy(() => import("../pages/dashboards/InstructorDashboard"));
const InstructorAssignments = lazy(() => import('../pages/dashboards/instructor/InstructorAssignments'));
const InstructorQuizzes = lazy(() => import('../pages/dashboards/instructor/InstructorQuizzes'));
const AdminDashboard = lazy(() => import("../pages/dashboards/AdminDashboard"));
const CategoryManagement = lazy(() => import("../pages/dashboards/admin/CategoryManagement"));
const CourseManagement = lazy(() => import("../pages/dashboards/admin/CourseManagement"));
const UserManagement = lazy(() => import("../pages/dashboards/admin/UserManagement"));
const MyCourses = lazy(() => import("../pages/dashboards/instructor/MyCourses"));
const CreateCourse = lazy(() => import("../pages/dashboards/instructor/CreateCourse"));
const EditCourse = lazy(() => import("../pages/dashboards/instructor/EditCourse"));
const CourseContent = lazy(() => import("../pages/dashboards/instructor/CourseContent"));
const ProfileSettings = lazy(() => import("../pages/dashboards/ProfileSettings"));
const PremiumCoursesPage = lazy(() => import("../pages/PremiumCoursesPage"));
const PremiumCourseDetailsPage = lazy(() => import("../pages/PremiumCourseDetailsPage"));
const CourseList = lazy(() => import("../pages/CourseList"));
const CourseDetails = lazy(() => import("../pages/CourseDetails"));
const CourseLearn = lazy(() => import("../pages/dashboards/student/CourseLearn"));
const StudentQuizzes = lazy(() => import("../pages/dashboards/student/StudentQuizzes"));
const QuizTest = lazy(() => import("../pages/dashboards/student/QuizTest"));
const StudentExams = lazy(() => import("../pages/dashboards/student/StudentExams"));
const ExamDetailsPage = lazy(() => import("../pages/ExamDetailsPage"));
const ActiveExamPage = lazy(() => import("../pages/ActiveExamPage"));
const ExamResultPage = lazy(() => import("../pages/ExamResultPage"));
const ExamLeaderboardPage = lazy(() => import("../pages/ExamLeaderboardPage"));
const InstructorExams = lazy(() => import("../pages/dashboards/instructor/InstructorExams"));
const InstructorExamQuestions = lazy(() => import("../pages/dashboards/instructor/InstructorExamQuestions"));
const CourseAnalytics = lazy(() => import("../pages/dashboards/instructor/CourseAnalytics"));
const MyReports = lazy(() => import("../pages/dashboards/reports/MyReports"));
const AdminReports = lazy(() => import("../pages/dashboards/reports/AdminReports"));
const AdminAnalytics = lazy(() => import("../pages/dashboards/admin/AdminAnalytics"));
const StudentAnalytics = lazy(() => import("../pages/dashboards/instructor/StudentAnalytics"));
const DiscussionPage = lazy(() => import("../pages/dashboards/DiscussionPage"));
const StudentCalendar = lazy(() => import("../pages/dashboards/student/StudentCalendar"));
const StudentReviews = lazy(() => import("../pages/dashboards/student/StudentReviews"));
const StudentQueries = lazy(() => import("../pages/dashboards/student/StudentQueries"));
const InstructorQueries = lazy(() => import("../pages/dashboards/instructor/InstructorQueries"));
const AdminQueries = lazy(() => import("../pages/dashboards/admin/AdminQueries"));
const AdminChatbotLogs = lazy(() => import("../pages/dashboards/admin/AdminChatbotLogs"));

const AddPracticeChallenge = lazy(() => import('../pages/dashboards/instructor/AddPracticeChallenge'));
const InstructorPracticeList = lazy(() => import('../pages/dashboards/instructor/InstructorPracticeList'));
const PracticeZone = lazy(() => import('../pages/dashboards/student/PracticeZone'));

const ProtectedRoute = ({ roles }) => {
  const {
    user,
    firebaseUser,
    lmsProfileMissing,
    twoFactorRequired,
    loading,
  } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (lmsProfileMissing) {
    return <Navigate to="/signup" replace />;
  }

  if (firebaseUser && twoFactorRequired) {
    return <Navigate to="/verify-2fa" replace />;
  }

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.some(r => r.toLowerCase() === user?.role?.toLowerCase()?.trim())) {
    const targetPath = getDashboardPath(user?.role);
    if (location.pathname === targetPath) {
      return <Navigate to="/" replace />;
    }
    return <Navigate to={targetPath} replace />;
  }

  return <Outlet />;
};

const PublicOnlyRoute = () => {
  const {
    user,
    firebaseUser,
    twoFactorRequired,
    loading,
  } = useAuth();
  const location = useLocation();

  // If already confirmed authenticated, redirect to role dashboard
  if (!loading && user?.role) {
    const targetPath = getDashboardPath(user.role);
    if (location.pathname !== targetPath) {
      return <Navigate to={targetPath} replace />;
    }
  }

  if (!loading && firebaseUser && twoFactorRequired) {
    return <Navigate to="/verify-2fa" replace />;
  }

  // Render public login/signup page immediately without full-screen loading blocker
  return <Outlet />;
};

const HomeRoute = () => {
  const {
    user,
    firebaseUser,
    twoFactorRequired,
    loading,
  } = useAuth();
  const location = useLocation();

  if (!loading && user?.role) {
    const targetPath = getDashboardPath(user.role);
    if (location.pathname !== targetPath) {
      return <Navigate to={targetPath} replace />;
    }
  }

  if (!loading && firebaseUser && twoFactorRequired) {
    return <Navigate to="/verify-2fa" replace />;
  }

  return <LandingPage />;
};

const TwoFactorRoute = () => {
  const {
    firebaseUser,
    twoFactorRequired,
    loading,
  } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  if (!twoFactorRequired) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const AppRoutes = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/premium-courses" element={<PremiumCoursesPage />} />
        <Route path="/course/:id" element={<PremiumCourseDetailsPage />} />
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetails />} />

        {/* Public only routes */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route element={<TwoFactorRoute />}>
          <Route path="/verify-2fa" element={<VerifyTwoFactor />} />
        </Route>

        <Route path="/verify-certificate/:certificateId?" element={<VerifyCertificate />} />

        {/* Student Routes */}
        <Route element={<ProtectedRoute roles={["Student"]} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/courses" element={<CourseList />} />
          <Route path="/student/courses/my" element={<StudentMyCourses />} />
          <Route path="/student/courses/:id/learn" element={<CourseLearn />} />
          <Route path="/student/quizzes" element={<StudentQuizzes />} />
          <Route path="/student/quizzes/:quizId/take" element={<QuizTest />} />
          <Route path="/student/profile" element={<ProfileSettings />} />
          <Route path="/student/certificates" element={<StudentCertificates />} />
          <Route path="/student/certificates/view/:id" element={<ViewCertificate />} />
          <Route path="/student/analytics" element={<StudentAnalytics />} />
          <Route path="/student/discussions" element={<DiscussionPage />} />
          <Route path="/student/calendar" element={<StudentCalendar />} />
          <Route path="/student/reviews" element={<StudentReviews />} />
          <Route path="/student/reports" element={<MyReports />} />
          <Route path="/student/practice" element={<PracticeZone />} />
          <Route path="/student/queries" element={<StudentQueries />} />
          <Route path="/exams" element={<StudentExams />} />
          <Route path="/exams/:examId" element={<ExamDetailsPage />} />
          <Route path="/exams/:examId/attempt" element={<ActiveExamPage />} />
          <Route path="/exams/:examId/result/:attemptId" element={<ExamResultPage />} />
        </Route>

        {/* Instructor Routes */}
        <Route element={<ProtectedRoute roles={["Instructor"]} />}>
          <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          <Route path="/instructor/courses" element={<MyCourses />} />
          <Route path="/instructor/courses/my" element={<MyCourses />} />
          <Route path="/instructor/discussions" element={<DiscussionPage />} />
          <Route path="/instructor/profile" element={<ProfileSettings />} />
          <Route path="/instructor/reports" element={<MyReports />} />
          <Route path="/instructor/practice" element={<InstructorPracticeList />} />
          <Route path="/instructor/practice/create" element={<AddPracticeChallenge />} />
          <Route path="/instructor/practice/edit/:id" element={<AddPracticeChallenge />} />
          <Route path="/instructor/queries" element={<InstructorQueries />} />
        </Route>

        {/* Shared Instructor & Admin */}
        <Route element={<ProtectedRoute roles={["Instructor", "Admin"]} />}>
          <Route path="/instructor/courses/create" element={<CreateCourse />} />
          <Route path="/instructor/courses/:id/edit" element={<EditCourse />} />
          <Route path="/instructor/courses/:id/content" element={<CourseContent />} />
          <Route path="/instructor/assignments" element={<InstructorAssignments />} />
          <Route path="/instructor/quizzes" element={<InstructorQuizzes />} />
          <Route path="/instructor/exams" element={<InstructorExams />} />
          <Route path="/instructor/exams/:examId/questions" element={<InstructorExamQuestions />} />
          <Route path="/instructor/course-analytics/:id" element={<CourseAnalytics />} />
          <Route path="/instructor/student-analytics/:studentId" element={<StudentAnalytics />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute roles={["Admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/categories" element={<CategoryManagement />} />
          <Route path="/admin/courses" element={<CourseManagement />} />
          <Route path="/admin/discussions" element={<DiscussionPage />} />
          <Route path="/admin/profile" element={<ProfileSettings />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/queries" element={<AdminQueries />} />
          <Route path="/admin/chatbot-logs" element={<AdminChatbotLogs />} />
        </Route>

        {/* General discussion & leaderboard */}
        <Route element={<ProtectedRoute roles={["Student", "Instructor", "Admin"]} />}>
          <Route path="/discussions" element={<DiscussionPage />} />
          <Route path="/exams/:examId/leaderboard" element={<ExamLeaderboardPage />} />
        </Route>

        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;