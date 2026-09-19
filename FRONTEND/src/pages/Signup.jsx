import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2, Sparkles, GraduationCap, Laptop, Shield, Github, Users } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { getAuthErrorMessage, googleLogin, githubLogin, register, verifyEmail } from '../services/firebaseAuth.service';
import { updateProfile } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../utils/auth';
import api from '../services/api.service';

const Signup = () => {
  const { user, firebaseUser, loading: authLoading, refreshUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step, setStep] = useState(1);
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
  const [errorMsg, setErrorMsg] = useState(location.state?.alert || '');
  const [successMsg, setSuccessMsg] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState(false);

  
  useEffect(() => {
    if (!authLoading && user?.role) {
      console.log('[Signup] Authenticated LMS user detected, navigating to dashboard:', user.role);
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (firebaseUser && !formData.email) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || firebaseUser.displayName || '',
        email: prev.email || firebaseUser.email || '',
      }));
    }
  }, [firebaseUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    if (errorMsg) setErrorMsg('');
    setTimeout(() => {
      setStep(2);
    }, 150);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (actionLoading || providerLoading) return;

    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.fullName.trim()) return setErrorMsg('Please enter your full name.');
    if (!formData.email.trim()) return setErrorMsg('Please enter your email address.');
    if (formData.password.length < 8) return setErrorMsg('Password must be at least 8 characters.');
    if (formData.password !== formData.confirmPassword) return setErrorMsg('Passwords do not match.');
    if (formData.role === 'Admin' && !formData.adminAccessToken.trim()) return setErrorMsg('Admin access token is required.');

    try {
      setActionLoading(true);
      console.log('[Signup:Email] Step 1: Creating Firebase user...');
      const credential = await register(formData.email.trim(), formData.password);
      
      try {
        await updateProfile(credential.user, { displayName: formData.fullName.trim() });
      } catch (profileErr) {
        console.warn('Could not set Firebase displayName:', profileErr);
      }

      try {
        await verifyEmail();
      } catch (emailErr) {
        console.warn('Email verification send issue:', emailErr);
      }
      
      const token = await credential.user.getIdToken();
      console.log('[Signup:Email] Step 2: Registering in MongoDB | UID:', credential.user.uid, '| Role:', formData.role);

      const payload = {
        name: formData.fullName.trim(),
        role: formData.role,
      };
      if (formData.role === 'Admin') {
        payload.adminAccessToken = formData.adminAccessToken.trim();
      }

      await api.post('/api/auth/register', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('[Signup:Email] Step 3: MongoDB registration succeeded. Calling refreshUser()...');

      setSuccessMsg('Account created successfully! Redirecting...');
      await refreshUser();
    } catch (err) {
      console.error('[Signup:Email] Error:', err);
      setActionLoading(false);
      const status = err?.status || err?.response?.status;
      const message = err?.response?.data?.message || err?.message;

      if (status === 409) {
        if (message?.includes('already exists for this Firebase account')) {
          await refreshUser();
        } else {
          setErrorMsg('An LMS account already exists with this email address. Please sign in instead.');
        }
      } else {
        setErrorMsg(getAuthErrorMessage(err, message || 'Registration failed. Please try again.'));
      }
    }
  };

  const handleProviderSignup = async (providerFn, providerName) => {
    if (providerLoading || actionLoading) return;

    setErrorMsg('');
    setSuccessMsg('');

    if (formData.role === 'Admin') {
      return setErrorMsg('Admin registration must use Email with an Admin Access Token.');
    }

    try {
      setProviderLoading(true);
      console.log(`[Signup:${providerName}] Step 1: Opening popup...`);
      const credential = await providerFn();
      const token = await credential.user.getIdToken();

      console.log(`[Signup:${providerName}] Step 2: Checking existing LMS profile...`);
      try {
        const meRes = await api.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`[Signup:${providerName}] Existing LMS account found | Role:`, meRes.data?.user?.role);
        await refreshUser();
      } catch (meErr) {
        const status = meErr?.status || meErr?.response?.status;
        if (status === 404) {
          console.log(`[Signup:${providerName}] No LMS account found (404). Registering with role:`, formData.role);
          await api.post(
            '/api/auth/register',
            {
              name: (credential.user.displayName || credential.user.email?.split('@')[0] || 'Learner').trim(),
              role: formData.role,
            },
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          console.log(`[Signup:${providerName}] Registration completed. Refreshing LMS user...`);
          await refreshUser();
        } else {
          throw meErr;
        }
      }
    } catch (err) {
      console.error(`[Signup:${providerName}] Error:`, err);
      setProviderLoading(false);
      const status = err?.status || err?.response?.status;
      const message = err?.response?.data?.message || err?.message;

      if (status === 409) {
        setErrorMsg(message || 'An account with this email already exists. Please sign in directly.');
      } else {
        setErrorMsg(getAuthErrorMessage(err, message || 'Sign-up failed. Please try again.'));
      }
    }
  };

  const isAnyLoading = actionLoading || providerLoading || authLoading;

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Join to start learning and teaching"
      badgeText="Instant Access"
      badgeIcon={Sparkles}
      footerPromptText="Already have an account?"
      footerActionText="Sign in"
      footerActionLink="/login"
      compact={false}
    >
      {errorMsg && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm animate-fade-in mb-4">
          <AlertCircle size={16} className="text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 leading-snug">
            <span>{errorMsg}</span>
            {errorMsg.includes('sign in') || errorMsg.includes('Sign in') ? (
              <div className="mt-1">
                <Link to="/login" className="font-semibold underline text-rose-300 hover:text-rose-200">
                  Go to Sign In &rarr;
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm animate-fade-in mb-4">
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {step === 1 ? (
        <div className="space-y-4">
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Select Your Role
          </label>
          <div className="grid grid-cols-1 gap-4">
            {[
              { id: 'Student', title: 'Student Account', desc: 'Access courses, exams, and track your progress.', icon: GraduationCap },
              { id: 'Instructor', title: 'Instructor Account', desc: 'Create and manage courses, assessments, and students.', icon: Users },
              { id: 'Admin', title: 'Admin Account', desc: 'Manage the entire platform and system settings.', icon: Shield }
            ].map((r) => {
              const Icon = r.icon;
              const isSelected = formData.role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r.id)}
                  className={`relative flex items-center gap-5 p-4 rounded-xl border transition-all duration-200 text-left overflow-hidden ${
                    isSelected
                      ? 'bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500/50'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center transition-colors ${
                    isSelected 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 '
                  }`}>
                    <Icon size={22} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold text-sm mb-1 ${isSelected ? 'text-indigo-400' : 'text-slate-200'}`}>{r.title}</h3>
                    <p className="text-[12px] text-slate-400 leading-snug">{r.desc}</p>
                  </div>
                  {isSelected && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-500">
                      <CheckCircle2 size={18} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
        </div>
      ) : (
        <div className="space-y-5 animate-fade-in">
          <button onClick={() => setStep(1)} className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline mb-2">
            &larr; Back to Role Selection ({formData.role})
          </button>

          {formData.role !== 'Admin' && (
            <div className="space-y-3">
              <GoogleAuthButton
                onClick={() => handleProviderSignup(googleLogin, 'Google')}
                loading={providerLoading}
                disabled={isAnyLoading}
                text={`Sign up as ${formData.role} with Google`}
              />
              <button
                type="button"
                onClick={() => handleProviderSignup(githubLogin, 'GitHub')}
                disabled={isAnyLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 text-slate-100 hover:text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Github size={18} className="text-white" /> Sign up with GitHub
              </button>
              <div className="relative flex items-center justify-center my-6">
                <div className="w-full border-t border-slate-800"></div>
                <span className="absolute bg-[#0d1424] px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  or register with email
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {formData.role === 'Admin' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
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
                    required
                    disabled={isAnyLoading}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative flex items-center">
                  <User size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    disabled={isAnyLoading}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Email</label>
                <div className="relative flex items-center">
                  <Mail size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    disabled={isAnyLoading}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Password</label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={isAnyLoading}
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-slate-400 hover:text-slate-200">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Confirm</label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={isAnyLoading}
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-700/80 bg-slate-950/70 text-slate-100 placeholder-slate-500 text-sm focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAnyLoading}
              className="w-full flex items-center justify-center gap-2 mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-60"
            >
              {actionLoading ? <Loader2 className="animate-spin" size={18} /> : `Create ${formData.role} Account`}
            </button>
          </form>
        </div>
      )}
    </AuthLayout>
  );
};

export default Signup;
