import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, KeyRound, AlertCircle, CheckCircle2, Loader2, RotateCw, ShieldCheck } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import OtpInput from '../components/OtpInput';
import authService from '../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState('email');
  
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const updateField = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleOtpChange = (otpValue) => {
    setFormData((prev) => ({ ...prev, otp: otpValue }));
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
    if (!authService.isValidEmail(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.sendResetPasswordOtp(cleanEmail);
      setSuccessMsg(res.message || `A 6-digit verification code has been sent to ${cleanEmail}`);
      setStep('otp');
    } catch (err) {
      setErrorMsg(err.message || 'Unable to send reset code. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setResending(true);
      const res = await authService.sendResetPasswordOtp(formData.email.trim());
      setSuccessMsg(res.message || 'A fresh 6-digit code has been sent.');
    } catch (err) {
      setErrorMsg(err.message || 'Unable to resend OTP at this time.');
    } finally {
      setResending(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.otp.length !== 6) {
      setErrorMsg('Please enter the full 6-digit verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.verifyResetPasswordOtp(formData.email.trim(), formData.otp);
      setSuccessMsg(res.message || 'OTP verified successfully! Now set your new password.');
      setStep('reset');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const passError = authService.validatePassword(formData.newPassword);
    if (passError) {
      setErrorMsg(passError);
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.changePassword(
        formData.email.trim(),
        formData.otp,
        formData.newPassword
      );
      setSuccessMsg(res.message || 'Password reset successfully! Redirecting to login...');
      setStep('success');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getHeaderInfo = () => {
    switch (step) {
      case 'otp':
        return {
          title: 'Verify Your Email',
          subtitle: `Enter the 6-digit OTP code sent to ${formData.email || 'your email'}`,
          badge: 'Step 2 of 3',
        };
      case 'reset':
        return {
          title: 'Reset Password',
          subtitle: 'Choose a strong new password for your account',
          badge: 'Step 3 of 3',
        };
      case 'success':
        return {
          title: 'Password Updated!',
          subtitle: 'Your password has been changed successfully.',
          badge: 'Completed',
        };
      default:
        return {
          title: 'Forgot Password?',
          subtitle: "Enter your registered email and we'll send a 6-digit reset code.",
          badge: 'Step 1 of 3',
        };
    }
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
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Account Email Address
            </label>
            <div className="relative flex items-center">
              <Mail size={17} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={updateField}
                placeholder="name@example.com"
                disabled={loading}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
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
                <span>Send 6-Digit Code</span>
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
          <div className="text-center">
            <OtpInput
              length={6}
              value={formData.otp}
              onChange={handleOtpChange}
              disabled={loading}
              hasError={Boolean(errorMsg)}
            />
            <p className="text-xs text-slate-400 mt-2">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending || loading}
                className="text-indigo-400 hover:text-indigo-300 font-semibold hover:underline inline-flex items-center gap-1 disabled:opacity-50"
              >
                {resending ? (
                  <>
                    <Loader2 size={12} className="animate-spin" /> Resending...
                  </>
                ) : (
                  <>
                    <RotateCw size={12} /> Resend OTP
                  </>
                )}
              </button>
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || formData.otp.length !== 6}
            className="group relative w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:via-indigo-400 hover:to-purple-500 text-white font-semibold text-sm sm:text-base shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify & Continue</span>
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('email');
              setErrorMsg('');
            }}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft size={13} /> Change email address
          </button>
        </form>
      )}

      {step === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-4 animate-fade-in">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                New Password
              </label>
              {formData.newPassword && (
                <span
                  className={`text-[10px] font-medium ${
                    formData.newPassword.length >= 8 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {formData.newPassword.length >= 8 ? 'Length OK ✓' : 'Min 8 chars'}
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <Lock size={17} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={updateField}
                placeholder="At least 8 characters"
                disabled={loading}
                autoFocus
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-200 focus:outline-none"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Confirm New Password
              </label>
              {formData.confirmPassword && (
                <span
                  className={`text-[10px] font-medium ${
                    formData.newPassword === formData.confirmPassword
                      ? 'text-emerald-400'
                      : 'text-red-400'
                  }`}
                >
                  {formData.newPassword === formData.confirmPassword ? 'Match ✓' : 'Mismatch'}
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <Lock size={17} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={updateField}
                placeholder="Re-enter new password"
                disabled={loading}
                className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-200 focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
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
                <span>Updating password...</span>
              </>
            ) : (
              <>
                <span>Update Password</span>
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
          <p className="text-sm text-slate-300">
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