import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2, Sparkles, GraduationCap, Laptop, Shield, Github } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { getAuthErrorMessage, googleLogin, githubLogin, register, verifyEmail } from '../services/firebaseAuth.service';
import { updateProfile } from 'firebase/auth';
import { getDashboardPath, useAuth } from '../context/AuthContext';
import api from '../services/api.service';

const Signup = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  
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
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleRoleSelect = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    if (errorMsg) setErrorMsg('');
  };

  const syncWithBackend = async (firebaseUser, token) => {
    const payload = {
      name: formData.fullName || firebaseUser.displayName || 'Learner',
      role: formData.role,
    };
    if (formData.role === 'Admin') {
      payload.adminAccessToken = formData.adminAccessToken;
    }
    
    // Pass token explicitly to ensure no race condition with interceptor
    const res = await api.post('/api/auth/register', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data?.user || res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.fullName.trim()) return setErrorMsg('Please enter your full name.');
    if (!formData.email.trim()) return setErrorMsg('Please enter your email address.');
    if (formData.password.length < 8) return setErrorMsg('Password must be at least 8 characters.');
    if (formData.password !== formData.confirmPassword) return setErrorMsg('Passwords do not match.');
    if (formData.role === 'Admin' && !formData.adminAccessToken.trim()) return setErrorMsg('Admin access token is required.');

    try {
      setLoading(true);
      const credential = await register(formData.email.trim(), formData.password);
      await updateProfile(credential.user, { displayName: formData.fullName.trim() });
      await verifyEmail();
      
      const token = await credential.user.getIdToken();
      const dbUser = await syncWithBackend(credential.user, token);
      
      const fullUser = { ...credential.user, ...dbUser };
      setUser(fullUser);
      setSuccessMsg(`Welcome, ${fullUser.name}!`);
      
      setTimeout(() => {
        navigate(getDashboardPath(fullUser.role), { replace: true });
      }, 1000);
    } catch (err) {
      setErrorMsg(getAuthErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSignup = async (providerFn) => {
    setErrorMsg('');
    try {
      setProviderLoading(true);
      const credential = await providerFn();
      const token = await credential.user.getIdToken();
      const dbUser = await syncWithBackend(credential.user, token);
      
      const fullUser = { ...credential.user, ...dbUser };
      setUser(fullUser);
      navigate(getDashboardPath(fullUser.role), { replace: true });
    } catch (err) {
      setErrorMsg(getAuthErrorMessage(err, 'Sign-up failed.'));
    } finally {
      setProviderLoading(false);
    }
  };

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
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-300 text-xs sm:text-sm animate-fade-in mb-4">
          <AlertCircle size={16} className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-xs sm:text-sm animate-fade-in mb-4">
          <CheckCircle2 size={16} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {step === 1 ? (
        <div className="space-y-4">
          <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-600 dark:text-slate-400 pink:text-pink-600 uppercase tracking-wider mb-2">
            Select Your Role
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['Student', 'Instructor', 'Admin'].map((r) => {
              const Icon = r === 'Admin' ? Shield : r === 'Instructor' ? Laptop : GraduationCap;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleRoleSelect(r)}
                  className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                    formData.role === r
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-500/20 dark:text-white dark:border-indigo-400 shadow-sm shadow-indigo-500/20 ring-1 ring-indigo-500/40'
                      : 'bg-white dark:bg-white dark:bg-slate-900 pink:bg-pink-50 border-slate-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300 text-slate-600 dark:text-slate-600 dark:text-slate-400 pink:text-pink-600 hover:border-slate-300 dark:hover:border-slate-300 dark:border-slate-700 pink:border-pink-400 hover:bg-slate-50 dark:hover:bg-slate-100 dark:bg-slate-800 pink:bg-pink-200'
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-sm font-semibold">{r}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full flex items-center justify-center gap-2 mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors"
          >
            Continue <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="space-y-5 animate-fade-in">
          <button onClick={() => setStep(1)} className="text-xs text-indigo-600 hover:underline mb-2">
            &larr; Back to Role Selection
          </button>

          {formData.role !== 'Admin' && (
            <div className="space-y-3">
              <GoogleAuthButton
                onClick={() => handleProviderSignup(googleLogin)}
                loading={providerLoading}
                text={`Sign up as ${formData.role} with Google`}
              />
              <button
                onClick={() => handleProviderSignup(githubLogin)}
                disabled={providerLoading}
                className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-300 dark:border-slate-700 pink:border-pink-400 bg-white dark:bg-slate-100 dark:bg-slate-800 pink:bg-pink-200 text-slate-700 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-sm transition-colors"
              >
                <Github size={18} /> Sign up with GitHub
              </button>
              <div className="relative flex items-center justify-center my-6">
                <div className="w-full border-t border-slate-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300"></div>
                <span className="absolute bg-white dark:bg-slate-50 dark:bg-slate-950 pink:bg-pink-100 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 pink:text-pink-600">
                  or register with email
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {formData.role === 'Admin' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-700 dark:text-slate-300 pink:text-pink-800 uppercase tracking-wider mb-1">
                  Admin Access Token
                </label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3 text-slate-600 dark:text-slate-400 pink:text-pink-600" />
                  <input
                    type="password"
                    name="adminAccessToken"
                    value={formData.adminAccessToken}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300 bg-white dark:bg-white dark:bg-slate-900 pink:bg-pink-50 text-slate-900 dark:text-slate-900 dark:text-slate-100 pink:text-pink-950 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-700 dark:text-slate-300 pink:text-pink-800 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative flex items-center">
                  <User size={15} className="absolute left-3 text-slate-600 dark:text-slate-400 pink:text-pink-600" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300 bg-white dark:bg-white dark:bg-slate-900 pink:bg-pink-50 text-slate-900 dark:text-slate-900 dark:text-slate-100 pink:text-pink-950 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-700 dark:text-slate-300 pink:text-pink-800 uppercase tracking-wider mb-1">Email</label>
                <div className="relative flex items-center">
                  <Mail size={15} className="absolute left-3 text-slate-600 dark:text-slate-400 pink:text-pink-600" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300 bg-white dark:bg-white dark:bg-slate-900 pink:bg-pink-50 text-slate-900 dark:text-slate-900 dark:text-slate-100 pink:text-pink-950 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-700 dark:text-slate-300 pink:text-pink-800 uppercase tracking-wider mb-1">Password</label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3 text-slate-600 dark:text-slate-400 pink:text-pink-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300 bg-white dark:bg-white dark:bg-slate-900 pink:bg-pink-50 text-slate-900 dark:text-slate-900 dark:text-slate-100 pink:text-pink-950 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 text-slate-600 dark:text-slate-400 pink:text-pink-600">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-700 dark:text-slate-300 pink:text-pink-800 uppercase tracking-wider mb-1">Confirm</label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3 text-slate-600 dark:text-slate-400 pink:text-pink-600" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300 bg-white dark:bg-white dark:bg-slate-900 pink:bg-pink-50 text-slate-900 dark:text-slate-900 dark:text-slate-100 pink:text-pink-950 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 mt-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : `Create ${formData.role} Account`}
            </button>
          </form>
        </div>
      )}
    </AuthLayout>
  );
};
export default Signup;
