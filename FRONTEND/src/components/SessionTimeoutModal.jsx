import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SESSION_DURATION_MS = 2 * 60 * 60 * 1000;
const WARNING_WINDOW_MS = 5 * 60 * 1000;

export const SessionTimeoutModal = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(300);

  const resetSessionDeadline = () => {
    const newDeadline = Date.now() + SESSION_DURATION_MS;
    localStorage.setItem('lms_session_expiry', String(newDeadline));
    setShowWarning(false);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem('lms_session_expiry');
      setShowWarning(false);
      return;
    }

    let storedExpiry = localStorage.getItem('lms_session_expiry');
    if (!storedExpiry) {
      storedExpiry = String(Date.now() + SESSION_DURATION_MS);
      localStorage.setItem('lms_session_expiry', storedExpiry);
    }

    const interval = setInterval(() => {
      const currentExpiry = Number(localStorage.getItem('lms_session_expiry') || '0');
      const now = Date.now();
      const timeLeft = currentExpiry - now;

      if (timeLeft <= 0) {
        clearInterval(interval);
        localStorage.removeItem('lms_session_expiry');
        setShowWarning(false);
        logout().finally(() => {
          toast.error('Session timed out after 2 hours. Please login again.');
          navigate('/login');
        });
      } else if (timeLeft <= WARNING_WINDOW_MS) {
        setShowWarning(true);
        setSecondsRemaining(Math.max(0, Math.floor(timeLeft / 1000)));
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, logout, navigate]);

  if (!isAuthenticated || !showWarning) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const handleStay = () => {
    resetSessionDeadline();
    toast.success('Session extended by 2 hours');
  };

  const handleLogoutNow = () => {
    localStorage.removeItem('lms_session_expiry');
    setShowWarning(false);
    logout().then(() => {
      navigate('/login');
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="lms-glass-card w-full max-w-md p-6 rounded-3xl border border-amber-500/30 shadow-2xl relative text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
          <Clock size={28} className="animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-[var(--lms-text-primary)] mb-2">
          Session Expiring Soon
        </h3>

        <p className="text-sm text-[var(--lms-text-muted)] mb-5">
          Your 2-hour session is about to expire due to timeout. Do you want to stay logged in?
        </p>

        <div className="bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl p-4 mb-6">
          <div className="text-xs text-[var(--lms-text-muted)] uppercase tracking-wider font-bold mb-1">
            Auto Logout In
          </div>
          <div className="text-3xl font-black font-mono text-amber-400">
            {timeFormatted}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleLogoutNow}
            className="flex-1 py-3 px-4 rounded-xl border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] font-bold text-[var(--lms-text-secondary)] text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <LogOut size={15} /> Logout Now
          </button>
          <button
            type="button"
            onClick={handleStay}
            className="flex-1 py-3 px-4 rounded-xl bg-[var(--lms-accent)] hover:bg-[var(--lms-accent-hover)] text-white font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-1.5"
          >
            <RefreshCw size={15} /> Yes, Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};
