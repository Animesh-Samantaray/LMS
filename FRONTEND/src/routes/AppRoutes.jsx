import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import VerifyTwoFactor from "../pages/VerifyTwoFactor";

import StudentDashboard from "../pages/dashboards/StudentDashboard";
import InstructorDashboard from "../pages/dashboards/InstructorDashboard";
import AdminDashboard from "../pages/dashboards/AdminDashboard";
import ProfileSettings from "../pages/dashboards/ProfileSettings";
import PremiumCoursesPage from "../pages/PremiumCoursesPage";
import PremiumCourseDetailsPage from "../pages/PremiumCourseDetailsPage";

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

  
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
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

  if (loading) {
    return <LoadingScreen />;
  }

  



  if (firebaseUser && twoFactorRequired) {
    return <Navigate to="/verify-2fa" replace />;
  }

  





  if (lmsProfileMissing) {
    return <Outlet />;
  }

  


  if (user && user.role) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
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

  if (loading) {
    return <LoadingScreen />;
  }

  



  if (firebaseUser && twoFactorRequired) {
    return <Navigate to="/verify-2fa" replace />;
  }

  


  if (user && user.role && !lmsProfileMissing) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
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

      
      <Route element={<ProtectedRoute roles={["Student"]} />}>
        <Route
          path="/student/dashboard"
          element={<StudentDashboard />}
        />

        <Route
          path="/student/profile"
          element={<ProfileSettings />}
        />
      </Route>

      
      <Route element={<ProtectedRoute roles={["Instructor"]} />}>
        <Route
          path="/instructor/dashboard"
          element={<InstructorDashboard />}
        />

        <Route
          path="/instructor/profile"
          element={<ProfileSettings />}
        />
      </Route>

      
      <Route element={<ProtectedRoute roles={["Admin"]} />}>
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/admin/profile"
          element={<ProfileSettings />}
        />
      </Route>

      
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};

export default AppRoutes;