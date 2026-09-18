import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2, Sparkles, Github } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { getAuthErrorMessage, googleLogin, githubLogin, login } from '../services/firebaseAuth.service';
import { getDashboardPath, useAuth } from '../context/AuthContext';
import api from '../services/api.service';

const Login = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errorMsg) setErrorMsg('');
  };

  const syncWithBackend = async (firebaseUser, token) => {
    const res = await api.get('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data?.user || res.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.email.trim()) return setErrorMsg('Please enter your email address.');
    if (!formData.password) return setErrorMsg('Please enter your password.');

    try {
      setLoading(true);
      const credential = await login(formData.email.trim(), formData.password);
      const token = await credential.user.getIdToken();
      const dbUser = await syncWithBackend(credential.user, token);
      
      const fullUser = { ...credential.user, ...dbUser };
      setSuccessMsg(`Welcome back, ${fullUser.name}!`);
      setUser(fullUser);
      
      setTimeout(() => {
        navigate(getDashboardPath(fullUser.role), { replace: true });
      }, 1000);
    } catch (err) {
      setErrorMsg(getAuthErrorMessage(err, 'Invalid email or password. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (providerFn) => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setProviderLoading(true);
      const credential = await providerFn();
      const token = await credential.user.getIdToken();
      const dbUser = await syncWithBackend(credential.user, token);
      
      const fullUser = { ...credential.user, ...dbUser };
      setUser(fullUser);
      navigate(getDashboardPath(fullUser.role), { replace: true });
    } catch (err) {
      setErrorMsg(getAuthErrorMessage(err, 'Authentication failed.'));
    } finally {
      setProviderLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Enter your credentials to access your account"
      badgeText="Secure Access"
      badgeIcon={Sparkles}
      footerPromptText="Don't have an account yet?"
      footerActionText="Create an account"
      footerActionLink="/signup"
    >
      {errorMsg && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-300 text-sm animate-fade-in mb-4">
          <AlertCircle size={18} className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <span className="leading-snug">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-sm animate-fade-in mb-4">
          <CheckCircle2 size={18} className="text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="space-y-3">
        <GoogleAuthButton
          onClick={() => handleProviderLogin(googleLogin)}
          loading={providerLoading}
          text="Continue with Google"
        />
        <button
          type="button"
          onClick={() => handleProviderLogin(githubLogin)}
          disabled={providerLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-300 dark:border-slate-700 pink:border-pink-400 bg-white dark:bg-slate-100 dark:bg-slate-800 pink:bg-pink-200 text-slate-700 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-sm transition-colors"
        >
          <Github size={18} /> Continue with GitHub
        </button>
      </div>

      <div className="relative flex items-center justify-center my-6">
        <div className="w-full border-t border-slate-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300"></div>
        <span className="absolute bg-white dark:bg-slate-50 dark:bg-slate-950 pink:bg-pink-100 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 pink:text-pink-600">
          or sign in with email
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-700 dark:text-slate-300 pink:text-pink-800 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail size={17} className="absolute left-3.5 text-slate-600 dark:text-slate-400 pink:text-pink-600" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled={loading}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300 bg-white dark:bg-white dark:bg-slate-900 pink:bg-pink-50 text-slate-900 dark:text-slate-900 dark:text-slate-100 pink:text-pink-950 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-700 dark:text-slate-300 pink:text-pink-800 uppercase tracking-wider">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
              Forgot password?
            </Link>
          </div>
          <div className="relative flex items-center">
            <Lock size={17} className="absolute left-3.5 text-slate-600 dark:text-slate-400 pink:text-pink-600" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              disabled={loading}
              className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300 bg-white dark:bg-white dark:bg-slate-900 pink:bg-pink-50 text-slate-900 dark:text-slate-900 dark:text-slate-100 pink:text-pink-950 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 p-1 text-slate-600 dark:text-slate-400 pink:text-pink-600">
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
        </button>
      </form>
    </AuthLayout>
  );
};
export default Login;
