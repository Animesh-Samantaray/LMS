import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import ForgotPassword from '../pages/ForgotPassword';
import Dashboard from '../components/Dashboard';
import { getDashboardPath, useAuth } from '../context/AuthContext';

const LoadingScreen = () => <div className="auth-page-container" />;

const ProtectedRoute = ({ roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={getDashboardPath(user.role)} replace />;
  return <Outlet />;
};

const PublicOnlyRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={getDashboardPath(user.role)} replace />;
  return <Outlet />;
};

const HomeRoute = () => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <Navigate to={getDashboardPath(user.role)} replace /> : <LandingPage />;
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
        <Route path="/student/dashboard" element={<Dashboard />} />
      </Route>
      <Route element={<ProtectedRoute roles={['Instructor']} />}>
        <Route path="/instructor/dashboard" element={<Dashboard />} />
      </Route>
      <Route element={<ProtectedRoute roles={['Admin']} />}>
        <Route path="/admin/dashboard" element={<Dashboard />} />
      </Route>
      <Route path="*" element={<LandingPage />} />
    </Routes>
  );
};

export default AppRoutes;
