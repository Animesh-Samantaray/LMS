import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import StudentDashboard from '../pages/dashboards/StudentDashboard';
import InstructorDashboard from '../pages/dashboards/InstructorDashboard';
import AdminDashboard from '../pages/dashboards/AdminDashboard';
import ProfileSettings from '../pages/dashboards/ProfileSettings';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../utils/auth';

const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const ProtectedRoute = ({ roles }) => {
  const { user, lmsProfileMissing, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (lmsProfileMissing) return <Navigate to="/signup" replace />;
  if (!user || !user.role) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
};

const PublicOnlyRoute = () => {
  const { user, lmsProfileMissing, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user && user.role && !lmsProfileMissing) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <Outlet />;
};

const HomeRoute = () => {
  const { user, lmsProfileMissing, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (user && user.role && !lmsProfileMissing) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return <LandingPage />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>
      <Route element={<ProtectedRoute roles={['Student']} />}>
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/profile" element={<ProfileSettings />} />
      </Route>
      <Route element={<ProtectedRoute roles={['Instructor']} />}>
        <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
        <Route path="/instructor/profile" element={<ProfileSettings />} />
      </Route>
      <Route element={<ProtectedRoute roles={['Admin']} />}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/profile" element={<ProfileSettings />} />
      </Route>
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};

export default AppRoutes;
