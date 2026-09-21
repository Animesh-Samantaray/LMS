import OtpInput from "../components/OtpInput";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  LogOut,
} from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import api from "../services/api.service";
import { getDashboardPath } from "../utils/auth";

const VerifyTwoFactor = () => {
  const {
    firebaseUser,
    twoFactorRequired,
    loading: authLoading,
    refreshUser,
    logout,
  } = useAuth();

  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (authLoading) return;

    if (!firebaseUser) {
      navigate("/login", { replace: true });
      return;
    }

    if (!twoFactorRequired) {
      navigate("/", { replace: true });
      return;
    }

    inputRef.current?.focus();
  }, [
    authLoading,
    firebaseUser,
    twoFactorRequired,
    navigate,
  ]);


  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleOtpChange = (e) => {
    


    const value = e.target.value.replace(/\D/g, "").slice(0, 6);

    setOtp(value);

    if (errorMsg) {
      setErrorMsg("");
    }

    if (successMsg) {
      setSuccessMsg("");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (verifyLoading || resendLoading) return;

    setErrorMsg("");
    setSuccessMsg("");

    if (otp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      setVerifyLoading(true);

      const response = await api.post("/api/auth/2fa/verify", {
        otp,
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to verify the code."
        );
      }

      setSuccessMsg(
        "Verification successful. Redirecting to your dashboard..."
      );

      
      const updatedUser = await refreshUser();

      if (updatedUser?.role) {
        navigate(getDashboardPath(updatedUser.role), {
          replace: true,
        });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("[2FA] Verification failed:", error);

      const status = error?.response?.status;

      let message =
        error?.response?.data?.message ||
        error?.message ||
        "Invalid verification code. Please try again.";

      if (status === 429) {
        message =
          error?.response?.data?.message ||
          "Too many incorrect attempts. Please request a new code.";
      }

      if (status === 410) {
        message =
          "This verification code has expired. Please request a new code.";
      }

      setErrorMsg(message);
      setOtp("");
      inputRef.current?.focus();
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    if (
      resendLoading ||
      verifyLoading ||
      resendCooldown > 0
    ) {
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");

    try {
      setResendLoading(true);

      const response = await api.post("/api/auth/2fa/resend");

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Unable to resend verification code."
        );
      }

      setOtp("");

      setSuccessMsg(
        "A new verification code has been sent to your email."
      );

      setResendCooldown(60);

      inputRef.current?.focus();
    } catch (error) {
      console.error("[2FA] Resend failed:", error);

      const retryAfter =
        error?.response?.data?.retryAfter;

      if (retryAfter) {
        setResendCooldown(Number(retryAfter));
      }
      setErrorMsg(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to resend the verification code. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogout = async () => {
    if (verifyLoading || resendLoading) return;

    try {
      await logout();
    } catch (error) {
      console.error("[2FA] Logout failed:", error);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const isLoading =
    authLoading ||
    verifyLoading ||
    resendLoading;

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2
          size={32}
          className="animate-spin text-indigo-500"
        />
      </div>
    );
  }

  return (
    <AuthLayout
      title="Verify Your Identity"
      subtitle="Enter the 6-digit code sent to your email address"
      badgeText="Two-Factor Authentication"
      badgeIcon={ShieldCheck}
      footerPromptText="Not you?"
      footerActionText="Sign out"
      footerActionLink="/login"
    >
      <div className="space-y-5">
        
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <ShieldCheck
              size={32}
              className="text-blue-600"
            />
          </div>
        </div>

        
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
          <Mail
            size={18}
            className="text-blue-600 mt-0.5 flex-shrink-0"
          />

          <div className="min-w-0">
            <p className="text-xs text-gray-500">
              Verification code sent to
            </p>

            <p className="text-sm font-medium text-gray-700 truncate">
              {firebaseUser?.email || "your email address"}
            </p>
          </div>
        </div>

        
        {errorMsg && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
            <AlertCircle
              size={18}
              className="text-rose-400 flex-shrink-0 mt-0.5"
            />

            <span className="leading-snug">
              {errorMsg}
            </span>
          </div>
        )}

        
        {successMsg && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
            <CheckCircle2
              size={18}
              className="text-emerald-400 flex-shrink-0 mt-0.5"
            />

            <span className="leading-snug">
              {successMsg}
            </span>
          </div>
        )}

        
        <form
          onSubmit={handleVerify}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="twoFactorOtp"
              className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2"
            >
              Verification Code
            </label>

            <OtpInput length={6} value={otp} onChange={setOtp} disabled={isLoading} />

            <p className="mt-2 text-xs text-gray-400 text-center">
              Enter the 6-digit code from your email.
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.length !== 6}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {verifyLoading ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Verify Code
              </>
            )}
          </button>
        </form>

        
        <div className="text-center">
          <p className="text-xs text-gray-400 mb-2">
            Didn't receive the code?
          </p>

          <button
            type="button"
            onClick={handleResend}
            disabled={
              isLoading ||
              resendCooldown > 0
            }
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw
              size={15}
              className={
                resendLoading
                  ? "animate-spin"
                  : ""
              }
            />

            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : "Resend verification code"}
          </button>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50/60 transition-all disabled:opacity-50"
          >
            <LogOut size={16} />
            Sign out and use another account
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyTwoFactor;