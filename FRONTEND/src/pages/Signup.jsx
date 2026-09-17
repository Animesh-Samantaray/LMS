import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2, Sparkles, GraduationCap, Laptop, Check } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import GoogleAuthButton from '../components/GoogleAuthButton';
import authService from '../services/authService';
import { getDashboardPath, useAuth } from '../context/AuthContext';

const Signup = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student',
    adminAccessToken: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!authService.isValidEmail(formData.email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    const passwordError = authService.validatePassword(formData.password);
    if (passwordError) {
      setErrorMsg(passwordError);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify both fields.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.register(
        formData.fullName.trim(),
        formData.email.trim(),
        formData.password,
        formData.role,
        formData.role === 'Admin' ? formData.adminAccessToken : undefined
      );
      setSuccessMsg(`Welcome to EduFlow, ${res.user.name}! Redirecting to your dashboard...`);
      setUser(res.user);
      setTimeout(() => {
        navigate(getDashboardPath(res.user.role), { replace: true });
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setGoogleLoading(true);
      authService.startGoogleAuth(formData.role);
    } catch {
      setErrorMsg('Google sign-up failed.');
      setGoogleLoading(false);
    }
  };

  const isLengthValid = formData.password.length >= 8;
  const isMatch = formData.confirmPassword && formData.password === formData.confirmPassword;

  return (
    <AuthLayout
      title="Create Your LMS Account"
      subtitle="Join as a Student or Instructor to start learning"
      badgeText="Instant Access"
      badgeIcon={Sparkles}
      footerPromptText="Already have an account?"
      footerActionText="Sign in"
      footerActionLink="/login"
      compact={false}
    >
      {errorMsg && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs sm:text-sm animate-fade-in">
          <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs sm:text-sm animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="space-y-5">
        {formData.role === 'Admin' && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Access Token
            </label>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="password"
                name="adminAccessToken"
                value={formData.adminAccessToken}
                onChange={handleChange}
                placeholder="Enter admin access token"
                disabled={loading}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Choose Account Type
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleRoleSelect('Student')}
              className={`group relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-200 text-left ${
                formData.role === 'Student'
                  ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm shadow-indigo-500/20 ring-1 ring-indigo-500/40'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  formData.role === 'Student' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                }`}
              >
                <GraduationCap size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate text-white">Student</div>
                <div className="text-[10px] text-slate-400 truncate">Learn & get certified</div>
              </div>
              {formData.role === 'Student' && (
                <div className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Check size={10} strokeWidth={3} />
                </div>
              )}
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('Instructor')}
              className={`group relative flex items-center gap-2.5 p-2.5 rounded-xl border transition-all duration-200 text-left ${
                formData.role === 'Instructor'
                  ? 'bg-purple-600/15 border-purple-500 text-white shadow-sm shadow-purple-500/20 ring-1 ring-purple-500/40'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  formData.role === 'Instructor' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-slate-300'
                }`}
              >
                <Laptop size={15} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold truncate text-white">Instructor</div>
                <div className="text-[10px] text-slate-400 truncate">Create & teach courses</div>
              </div>
              {formData.role === 'Instructor' && (
                <div className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Check size={10} strokeWidth={3} />
                </div>
              )}
            </button>
          </div>
        </div>

        <GoogleAuthButton
          onClick={handleGoogleSignup}
          loading={googleLoading}
          text={`Sign up as ${formData.role} with Google`}
        />
      </div>

      <div className="relative flex items-center justify-center my-6">
        <div className="w-full border-t border-slate-800"></div>
        <span className="absolute bg-slate-900/50 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          or register with email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative flex items-center">
              <User size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Alex Morgan"
                disabled={loading}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@example.com"
                disabled={loading}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              {formData.password && (
                <span className={`text-[10px] font-medium ${isLengthValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isLengthValid ? '8+ chars ✓' : 'Min 8 chars'}
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                disabled={loading}
                className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-200 focus:outline-none"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Confirm Password
              </label>
              {formData.confirmPassword && (
                <span className={`text-[10px] font-medium ${isMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isMatch ? 'Match ✓' : 'Mismatch'}
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter password"
                disabled={loading}
                className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="absolute right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-200 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex items-center justify-center gap-2 mt-1 py-2.5 sm:py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:via-indigo-400 hover:to-purple-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create {formData.role} Account</span>
              <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Signup;
