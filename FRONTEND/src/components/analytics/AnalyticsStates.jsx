import React from 'react';
import { AlertCircle, FolderX, RefreshCw } from 'lucide-react';

export const AnalyticsEmptyState = ({
  icon: Icon = FolderX,
  title = "No Data Available",
  description = "There are currently no records or activity in this timeframe.",
  actionText,
  onAction,
}) => {
  return (
    <div className="py-12 px-6 text-center rounded-2xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border-subtle)] flex flex-col items-center justify-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-[var(--lms-surface)] border border-[var(--lms-border)] text-[var(--lms-text-muted)] flex items-center justify-center shadow-sm">
        <Icon size={22} />
      </div>
      <div className="max-w-sm space-y-1">
        <h4 className="text-sm font-bold text-[var(--lms-text-primary)]">{title}</h4>
        <p className="text-xs text-[var(--lms-text-secondary)] leading-relaxed">{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 text-xs font-semibold text-[var(--lms-accent)] hover:underline flex items-center gap-1.5"
        >
          <RefreshCw size={13} /> {actionText}
        </button>
      )}
    </div>
  );
};

export const AnalyticsLoadingSkeleton = ({ count = 4, height = "h-28" }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`rounded-2xl bg-[var(--lms-surface)] border border-[var(--lms-border)] ${height} p-5 flex flex-col justify-between`}
        >
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-[var(--lms-border)] rounded"></div>
              <div className="h-6 w-16 bg-[var(--lms-border)] rounded"></div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[var(--lms-border)]"></div>
          </div>
          <div className="h-2 w-28 bg-[var(--lms-border-subtle)] rounded"></div>
        </div>
      ))}
    </div>
  );
};

export const AnalyticsErrorState = ({ message, onRetry }) => {
  return (
    <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 text-center sm:text-left">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center shrink-0">
          <AlertCircle size={20} />
        </div>
        <div>
          <p className="text-sm font-bold">Failed to load analytics</p>
          <p className="text-xs opacity-80">{message || "A server or network error occurred."}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw size={13} /> Retry
        </button>
      )}
    </div>
  );
};
