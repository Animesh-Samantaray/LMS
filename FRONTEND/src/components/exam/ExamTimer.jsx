import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export const ExamTimer = ({ expiresAt, onExpire }) => {
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;

    const targetTime = new Date(expiresAt).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((targetTime - now) / 1000));
      setSecondsRemaining(diff);

      if (diff <= 0) {
        if (onExpire) onExpire();
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [expiresAt, onExpire]);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const formattedTime = `${hours > 0 ? String(hours).padStart(2, '0') + ':' : ''}${String(
    minutes
  ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isUrgent = secondsRemaining > 0 && secondsRemaining <= 300;
  const isCritical = secondsRemaining > 0 && secondsRemaining <= 60;

  const timerColorClass = isCritical
    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
    : isUrgent
    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    : 'bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] border-[var(--lms-border)]';

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-sm font-mono font-bold tracking-wider transition-all duration-300 ${timerColorClass}`}
    >
      {isCritical ? (
        <AlertTriangle size={15} className="text-rose-400 animate-bounce" />
      ) : (
        <Clock size={15} className={isUrgent ? 'text-amber-400' : 'text-[var(--lms-accent)]'} />
      )}
      <span>{formattedTime}</span>
    </div>
  );
};
