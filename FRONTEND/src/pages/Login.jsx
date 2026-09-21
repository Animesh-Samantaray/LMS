import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Github,
} from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import GoogleAuthButton from "../components/GoogleAuthButton";

import {
  getAuthErrorMessage,
  googleLogin,
  githubLogin,
  login,
} from "../services/firebaseAuth.service";

import { useAuth } from "../context/AuthContext";
import { getDashboardPath } from "../utils/auth";

const Login = () => {
  const {
    user,
    firebaseUser,
    loading: authLoading,
    lmsProfileMissing,
    twoFactorRequired,
  } = useAuth();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [providerLoading, setProviderLoading] = useState(false);

  













  useEffect(() => {
    if (authLoading) return;

    
    if (lmsProfileMissing) {
      setActionLoading(false);
      setProviderLoading(false);

      setErrorMsg(
        "No LMS account found for this account. Please sign up to choose your role."
      );

      return;
    }

   
    if (firebaseUser && twoFactorRequired) {
      setActionLoading(false);
      setProviderLoading(false);

      navigate("/verify-2fa", { replace: true });
      return;
    }

  
    if (user?.role) {
      setActionLoading(false);
      setProviderLoading(false);

      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [
    authLoading,
    firebaseUser,
    user,
    lmsProfileMissing,
    twoFactorRequired,
    navigate,
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errorMsg) {
      setErrorMsg("");
    }

    if (successMsg) {
      setSuccessMsg("");
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (actionLoading || providerLoading || authLoading) {
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setActionLoading(true);

    const email = formData.email.trim();

    if (!email) {
      setActionLoading(false);
      setErrorMsg("Please enter your email address.");
      return;
    }

    if (!formData.password) {
      setActionLoading(false);
      setErrorMsg("Please enter your password.");
      return;
    }

    try {
      console.log("[Login:Email] Authenticating with Firebase...");

    
      await login(email, formData.password);

      console.log("[Login:Email] Firebase authentication successful.");
    } catch (err) {
      console.error("[Login:Email] Firebase authentication error:", err);

      setActionLoading(false);

      setErrorMsg(
        getAuthErrorMessage(
          err,
          "Invalid email or password. Please try again."
        )
      );
    }
  };

  const handleProviderLogin = async (providerFn, providerName) => {
    if (providerLoading || actionLoading || authLoading) {
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setProviderLoading(true);

    try {
      console.log(`[Login:${providerName}] Opening popup...`);

     
      await providerFn();

      console.log(
        `[Login:${providerName}] Firebase authentication successful.`
      );
    } catch (err) {
      console.error(
        `[Login:${providerName}] Authentication error:`,
        err
      );

      setProviderLoading(false);

      setErrorMsg(
        getAuthErrorMessage(
          err,
          `${providerName} sign-in was cancelled or failed.`
        )
      );
    }
  };

  const isAnyLoading =
    actionLoading || providerLoading || authLoading;

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
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm animate-fade-in mb-4">
          <AlertCircle
            size={18}
            className="text-rose-400 flex-shrink-0 mt-0.5"
          />

          <div className="flex-1 leading-snug">
            <span>{errorMsg}</span>

            {(errorMsg.includes("sign up") ||
              errorMsg.includes("Sign up")) && (
              <div className="mt-1">
                <Link
                  to="/signup"
                  className="font-semibold underline text-rose-300 hover:text-rose-200"
                >
                  Go to Sign Up →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

     
      {successMsg && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm animate-fade-in mb-4">
          <CheckCircle2
            size={18}
            className="text-emerald-400 flex-shrink-0"
          />

          <span>{successMsg}</span>
        </div>
      )}

      
      <div className="space-y-3">
        <GoogleAuthButton
          onClick={() =>
            handleProviderLogin(googleLogin, "Google")
          }
          loading={providerLoading}
          disabled={isAnyLoading}
          text="Continue with Google"
        />

        <button
          type="button"
          onClick={() =>
            handleProviderLogin(githubLogin, "GitHub")
          }
          disabled={isAnyLoading}
          className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 hover:text-gray-900 font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {providerLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Github size={18} className="text-gray-900" />
          )}

          Continue with GitHub
        </button>
      </div>

    
      <div className="relative flex items-center justify-center my-6">
        <div className="w-full border-t border-gray-200" />

        <span className="absolute bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          or sign in with email
        </span>
      </div>

  
      <form
        onSubmit={handleEmailSubmit}
        className="space-y-4"
      >
       
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Email Address
          </label>

          <div className="relative flex items-center">
            <Mail
              size={17}
              className="absolute left-3.5 text-gray-500 pointer-events-none"
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              disabled={isAnyLoading}
              autoComplete="email"
              required
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition-all disabled:opacity-50"
            />
          </div>
        </div>

    
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Password
            </label>

            <Link
              to="/forgot-password"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative flex items-center">
            <Lock
              size={17}
              className="absolute left-3.5 text-gray-500 pointer-events-none"
            />

            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••••••"
              disabled={isAnyLoading}
              autoComplete="current-password"
              required
              className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/25 transition-all disabled:opacity-50"
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword((prev) => !prev)
              }
              disabled={isAnyLoading}
              className="absolute right-3 p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>
        </div>

     
        <button
          type="submit"
          disabled={isAnyLoading}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {actionLoading ? (
            <>
              <Loader2
                className="animate-spin"
                size={18}
              />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Login;