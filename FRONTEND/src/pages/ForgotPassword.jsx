import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, KeyRound, AlertCircle, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { forgotPassword, getAuthErrorMessage } from '../services/firebaseAuth.service';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState('email');
  
  const [formData, setFormData] = useState({ email: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = formData.email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      await forgotPassword(cleanEmail);
      setSuccessMsg(`A password reset email has been sent to ${cleanEmail}.`);
      setStep('success');
    } catch (err) {
      setErrorMsg(getAuthErrorMessage(err, 'Unable to send the reset email. Please check your email and try again.'));
    } finally {
      setLoading(false);
    }
  };

  const getHeaderInfo = () => {
    if (step === 'success') {
        return {
          title: 'Reset Email Sent',
          subtitle: 'Check your inbox for the password reset link.',
          badge: 'Email sent',
        };
    }

    return {
      title: 'Forgot Password?',
      subtitle: "Enter your registered email and we'll send a password reset link.",
      badge: 'Reset password',
    };
  };

  const header = getHeaderInfo();

  return (
    <AuthLayout
      title={header.title}
      subtitle={header.subtitle}
      badgeText={header.badge}
      badgeIcon={KeyRound}
      footerPromptText={step === 'email' ? 'Remember your password?' : undefined}
      footerActionText={step === 'email' ? 'Back to sign in' : undefined}
      footerActionLink={step === 'email' ? '/login' : undefined}
      compact={true}
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

      {step === 'email' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 pink:text-pink-800 uppercase tracking-wider mb-1.5">
              Account Email Address
            </label>
            <div className="relative flex items-center">
              <Mail size={17} className="absolute left-3.5 text-slate-600 dark:text-slate-400 pink:text-pink-600 pointer-events-none" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={updateField}
                placeholder="name@example.com"
                disabled={loading}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/80 dark:bg-slate-950/60 pink:bg-pink-50/80 border border-slate-200 dark:border-slate-800 pink:border-pink-300 text-slate-900 dark:text-slate-100 pink:text-pink-950 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:via-indigo-400 hover:to-purple-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <span>Send Reset Email</span>
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}

      {step === 'success' && (
        <div className="text-center py-4 space-y-4 animate-scale-in">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <ShieldCheck size={30} />
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 pink:text-pink-800">
            You can now log in with your updated password.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all"
          >
            Go to Login <ArrowRight size={16} />
          </button>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;