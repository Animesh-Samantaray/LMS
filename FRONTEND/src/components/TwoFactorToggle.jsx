import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { ShieldCheck, ShieldOff, Loader2, X, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../services/api.service";

const TwoFactorToggle = ({ user: propUser, setUser: propSetUser, compact = false }) => {
  const auth = useAuth();
  const user = propUser || auth?.user;
  const setUser = propSetUser || auth?.setUser;
  const { setTwoFactorVerified } = auth || {};

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!user) return null;

  const enabled = Boolean(user?.twoFactorEnabled);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    const action = enabled ? "disable" : "enable";
    const nextState = !enabled;

    try {
      setLoading(true);

      const response = await api.post(`/api/auth/2fa/${action}`);

      if (response.data?.success || response.status === 200) {
        if (setUser) {
          setUser((previous) => ({
            ...previous,
            twoFactorEnabled: nextState,
          }));
        }

        if (setTwoFactorVerified) {
          setTwoFactorVerified(nextState);
        }

        setToast({
          type: "success",
          message: nextState
            ? "Two-factor authentication enabled."
            : "Two-factor authentication disabled.",
        });
      }
    } catch (error) {
      console.error(`[2FA] Failed to ${action} 2FA:`, error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        `Unable to ${action} two-factor authentication.`;

      setToast({
        type: "error",
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const toastContent = toast && typeof document !== "undefined" ? (
    ReactDOM.createPortal(
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-xl ${
            toast.type === "success"
              ? "bg-slate-900/95 border-emerald-500/40 text-white shadow-emerald-950/40"
              : "bg-slate-900/95 border-rose-500/40 text-white shadow-rose-950/40"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle size={18} className="text-rose-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-1 p-0.5 rounded-lg text-slate-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </motion.div>
      </AnimatePresence>,
      document.body
    )
  ) : null;

  return (
    <>
      <motion.button
        type="button"
        onClick={handleToggle}
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        title={
          enabled
            ? "Two-factor authentication is active. Click to disable."
            : "Two-factor authentication is inactive. Click to enable."
        }
        aria-label={enabled ? "Disable two-factor authentication" : "Enable two-factor authentication"}
        className={`
          group relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-semibold
          transition-all duration-300 select-none shadow-sm cursor-pointer
          disabled:cursor-not-allowed disabled:opacity-60
          ${
            enabled
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/15 shadow-emerald-500/5"
              : "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:border-rose-500/50 hover:bg-rose-500/15 shadow-rose-500/5"
          }
        `}
      >
        <div className="flex items-center justify-center shrink-0 w-4 h-4">
          <AnimatePresence mode="wait" initial={false}>
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{ rotate: { repeat: Infinity, duration: 1, ease: "linear" } }}
              >
                <Loader2 size={15} className="animate-spin" />
              </motion.div>
            ) : enabled ? (
              <motion.div
                key="enabled"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                <ShieldCheck size={16} className="text-emerald-500 dark:text-emerald-400" />
              </motion.div>
            ) : (
              <motion.div
                key="disabled"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                <ShieldOff size={16} className="text-rose-500 dark:text-rose-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span className={`font-bold tracking-tight text-[11px] whitespace-nowrap ${compact ? "hidden sm:inline" : ""}`}>
          {loading ? "Updating..." : enabled ? "2FA ON" : "2FA OFF"}
        </span>

        <div
          className={`
            relative inline-flex h-4 w-7 shrink-0 items-center rounded-full p-0.5 transition-colors duration-300
            ${enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}
          `}
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={`
              h-3 w-3 rounded-full bg-white shadow-sm
              ${enabled ? "translate-x-3" : "translate-x-0"}
            `}
          />
        </div>
      </motion.button>

      {toastContent}
    </>
  );
};

export default TwoFactorToggle;