import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2, Sparkles, UserCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import GoogleAuthButton from '../components/GoogleAuthButton';
import authService from '../services/authService';
import { getDashboardPath, useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleRole, setGoogleRole] = useState('Student');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!authService.isValidEmail(formData.email.trim())) {
      setErrorMsg('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }
    if (!formData.password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login({
        email: formData.email.trim(),
        password: formData.password,
      });
      setSuccessMsg(`Welcome back, ${res.user.name || 'Learner'}! Redirecting...`);
      setTimeout(() => {
        navigate(getDashboardPath(res.user.role), { replace: true });
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setGoogleLoading(true);
      authService.startGoogleAuth(googleRole);
    } catch {
      setErrorMsg('Failed to initialize Google authentication.');
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Enter your LMS credentials to access your courses"
      badgeText="Secure LMS Access"
      badgeIcon={Sparkles}
      footerPromptText="Don't have an account yet?"
      footerActionText="Create an account"
      footerActionLink="/signup"
      compact={false}
    >
      {errorMsg && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm animate-fade-in">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm animate-fade-in">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="space-y-2.5">
        <GoogleAuthButton
          onClick={handleGoogleLogin}
          loading={googleLoading}
          text="Continue with Google"
        />

        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/40 border border-slate-800/80 text-xs">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            <UserCheck size={14} className="text-indigo-400" /> If new Google account, join as:
          </span>
          <div className="inline-flex rounded-md p-0.5 bg-slate-900 border border-slate-800">
            <button
              type="button"
              onClick={() => setGoogleRole('Student')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                googleRole === 'Student'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setGoogleRole('Instructor')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                googleRole === 'Instructor'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Instructor
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center my-3">
        <div className="w-full border-t border-slate-800"></div>
        <span className="absolute bg-slate-900 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          or sign in with email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail size={17} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled={loading}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative flex items-center">
            <Lock size={17} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              disabled={loading}
              className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-200 focus:outline-none hover:bg-slate-800/60 transition-colors"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <div className="flex items-center">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500/30 focus:ring-offset-0 focus:ring-2 cursor-pointer accent-indigo-600"
            />
            <span className="text-xs text-slate-400 font-medium">Remember my session</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:via-indigo-400 hover:to-purple-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Logging in...</span>
            </>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;
