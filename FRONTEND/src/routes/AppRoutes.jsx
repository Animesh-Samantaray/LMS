import React from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import VerifyTwoFactor from "../pages/VerifyTwoFactor";
import VerifyCertificate from "../pages/VerifyCertificate";

import StudentDashboard from "../pages/dashboards/StudentDashboard";
import StudentMyCourses from "../pages/dashboards/student/StudentMyCourses";
import StudentCertificates from "../pages/dashboards/student/StudentCertificates";
import ViewCertificate from "../pages/dashboards/student/ViewCertificate";
import InstructorDashboard from "../pages/dashboards/InstructorDashboard";
import InstructorAssignments from '../pages/dashboards/instructor/InstructorAssignments';
import InstructorQuizzes from '../pages/dashboards/instructor/InstructorQuizzes';
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import CategoryManagement from "../pages/dashboards/admin/CategoryManagement";
import CourseManagement from "../pages/dashboards/admin/CourseManagement";
import UserManagement from "../pages/dashboards/admin/UserManagement";
import MyCourses from "../pages/dashboards/instructor/MyCourses";
import CreateCourse from "../pages/dashboards/instructor/CreateCourse";
import EditCourse from "../pages/dashboards/instructor/EditCourse";
import CourseContent from "../pages/dashboards/instructor/CourseContent";
import ProfileSettings from "../pages/dashboards/ProfileSettings";
import PremiumCoursesPage from "../pages/PremiumCoursesPage";
import PremiumCourseDetailsPage from "../pages/PremiumCourseDetailsPage";
import CourseList from "../pages/CourseList";
import CourseDetails from "../pages/CourseDetails";
import CourseLearn from "../pages/dashboards/student/CourseLearn";
import StudentQuizzes from "../pages/dashboards/student/StudentQuizzes";
import QuizTest from "../pages/dashboards/student/QuizTest";
import CourseAnalytics from "../pages/dashboards/instructor/CourseAnalytics";
import MyReports from "../pages/dashboards/reports/MyReports";
import AdminReports from "../pages/dashboards/reports/AdminReports";
import StudentAnalytics from "../pages/dashboards/instructor/StudentAnalytics";
import DiscussionPage from "../pages/dashboards/DiscussionPage";
import StudentCalendar from "../pages/dashboards/student/StudentCalendar";
import StudentReviews from "../pages/dashboards/student/StudentReviews";

import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/auth";

const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
  </div>
);












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
    // Prevent infinite redirect loops if target path requires a role we don't have
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
    lmsProfileMissing,
    twoFactorRequired,
    loading,
  } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  



  if (firebaseUser && twoFactorRequired) {
    return <Navigate to="/verify-2fa" replace />;
  }

  





  if (lmsProfileMissing) {
    return <Outlet />;
  }

  


  if (user && user?.role) {
    const targetPath = getDashboardPath(user?.role);
    if (location.pathname === targetPath) {
      return <Navigate to="/" replace />;
    }
    return <Navigate to={targetPath} replace />;
  }

  return <Outlet />;
};




const HomeRoute = () => {
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
    return <Outlet />;
  }

  


  if (firebaseUser && twoFactorRequired) {
    return <Navigate to="/verify-2fa" replace />;
  }

  

  if (user && user?.role) {
    const targetPath = getDashboardPath(user?.role);
    if (location.pathname === targetPath) {
      return <LandingPage />;
    }
    return <Navigate to={targetPath} replace />;
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
    <Routes>
      
      <Route path="/" element={<HomeRoute />} />
      <Route path="/premium-courses" element={<PremiumCoursesPage />} />
      <Route path="/course/:id" element={<PremiumCourseDetailsPage />} />
      <Route path="/courses" element={<CourseList />} />
      <Route path="/courses/:id" element={<CourseDetails />} />

      
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
      </Route>

      
      <Route element={<TwoFactorRoute />}>
        <Route
          path="/verify-2fa"
          element={<VerifyTwoFactor />}
        />
      </Route>

      <Route path="/verify-certificate/:certificateId?" element={<VerifyCertificate />} />

      
      <Route element={<ProtectedRoute roles={["Student"]} />}>
        <Route
          path="/student/dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="/student/courses"
          element={<CourseList />}
        />

        <Route
          path="/student/courses/my"
          element={<StudentMyCourses />}
        />

        <Route
          path="/student/courses/:id/learn"
          element={<CourseLearn />}
        />

        <Route
          path="/student/quizzes"
          element={<StudentQuizzes />}
        />

        <Route
          path="/student/quizzes/:quizId/take"
          element={<QuizTest />}
        />

        <Route
          path="/student/profile"
          element={<ProfileSettings />}
        />

        <Route
          path="/student/certificates"
          element={<StudentCertificates />}
        />

        <Route
          path="/student/certificates/view/:id"
          element={<ViewCertificate />}
        />

        <Route
          path="/student/analytics"
          element={<StudentAnalytics />}
        />

        <Route
          path="/student/discussions"
          element={<DiscussionPage />}
        />

        <Route
          path="/student/calendar"
          element={<StudentCalendar />}
        />

        <Route
          path="/student/reviews"
          element={<StudentReviews />}
        />
        <Route
          path="/student/reports"
          element={<MyReports />}
        />
      </Route>

      <Route element={<ProtectedRoute roles={["Instructor"]} />}>
        <Route
          path="/instructor/dashboard"
          element={<InstructorDashboard />}
        />
        
        <Route
          path="/instructor/courses"
          element={<MyCourses />}
        />

        <Route
          path="/instructor/courses/my"
          element={<MyCourses />}
        />

        <Route
          path="/instructor/discussions"
          element={<DiscussionPage />}
        />

        <Route
          path="/instructor/profile"
          element={<ProfileSettings />}
        />
        <Route
          path="/instructor/reports"
          element={<MyReports />}
        />
      </Route>

      {/* Shared routes for course creation, editing and analytics (Instructor & Admin) */}
      <Route element={<ProtectedRoute roles={["Instructor", "Admin"]} />}>
        <Route
          path="/instructor/courses/create"
          element={<CreateCourse />}
        />
        
        <Route
          path="/instructor/courses/:id/edit"
          element={<EditCourse />}
        />

        <Route
          path="/instructor/courses/:id/content"
          element={<CourseContent />}
        />
        <Route
          path="/instructor/assignments"
          element={<InstructorAssignments />}
        />
        <Route
          path="/instructor/quizzes"
          element={<InstructorQuizzes />}
        />
        <Route
          path="/instructor/course-analytics/:id"
          element={<CourseAnalytics />}
        />
        <Route
          path="/instructor/student-analytics/:studentId"
          element={<StudentAnalytics />}
        />
      </Route>

      
      <Route element={<ProtectedRoute roles={["Admin"]} />}>
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/users"
          element={<UserManagement />}
        />

        <Route
          path="/admin/categories"
          element={<CategoryManagement />}
        />
        
        <Route
          path="/admin/courses"
          element={<CourseManagement />}
        />

        <Route
          path="/admin/discussions"
          element={<DiscussionPage />}
        />

        <Route
          path="/admin/profile"
          element={<ProfileSettings />}
        />
        <Route
          path="/admin/reports"
          element={<AdminReports />}
        />
      </Route>

      {/* General discussion route accessible to any logged-in user */}
      <Route element={<ProtectedRoute roles={["Student", "Instructor", "Admin"]} />}>
        <Route
          path="/discussions"
          element={<DiscussionPage />}
        />
      </Route>

      
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};

export default AppRoutes;