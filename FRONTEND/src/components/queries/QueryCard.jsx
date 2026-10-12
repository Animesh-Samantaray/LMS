import React from 'react';
import { MessageSquare, Calendar, User, BookOpen, Clock, ChevronRight } from 'lucide-react';
import QueryStatusBadge from './QueryStatusBadge';

const formatTimeAgo = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  const diffSec = Math.floor((new Date() - date) / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

const QueryCard = ({ query, onClick, isSelected, showCourse = true, showStudent = true }) => {
  const repliesCount = query.replies?.length || 0;
  const courseTitle = query.courseId?.title || query.courseTitle || 'Course';
  const studentName = query.studentId?.name || query.studentName || 'Student';
  const lastActive = query.lastRepliedAt || query.updatedAt || query.createdAt;

  const isClosed = query.status === 'closed';

  return (
    <div
      onClick={() => onClick && onClick(query)}
      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer group relative bg-[var(--lms-surface)] ${
        isSelected
          ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20'
          : 'border-[var(--lms-border)] hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <QueryStatusBadge status={query.status} size="xs" />
            {showCourse && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-lg border border-indigo-200/50 dark:border-indigo-800/40 truncate max-w-[220px]">
                <BookOpen size={11} className="shrink-0 text-indigo-500" />
                <span className="truncate">{courseTitle}</span>
              </span>
            )}
          </div>
          <h3 className={`text-sm sm:text-base font-bold text-[var(--lms-text-primary)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 ${isClosed ? 'opacity-75' : ''}`}>
            {query.subject}
          </h3>
        </div>

        <div className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-[var(--lms-text-secondary)] bg-[var(--lms-surface-subtle)] px-2.5 py-1 rounded-xl border border-[var(--lms-border)] shadow-xs">
          <MessageSquare size={13} className="text-indigo-500 shrink-0" />
          <span>{repliesCount}</span>
        </div>
      </div>

      <p className="text-xs text-[var(--lms-text-secondary)] line-clamp-2 leading-relaxed mb-3.5 opacity-90">
        {query.description}
      </p>

      <div className="flex items-center justify-between text-[11px] text-[var(--lms-text-muted)] pt-3 border-t border-[var(--lms-border)] font-medium">
        <div className="flex items-center gap-3.5 truncate">
          {showStudent && (
            <span className="flex items-center gap-1.5 truncate max-w-[140px] text-[var(--lms-text-secondary)]">
              <User size={12} className="text-slate-400 shrink-0" />
              <span className="truncate font-semibold">{studentName}</span>
            </span>
          )}
          <span className="flex items-center gap-1 shrink-0 text-slate-400">
            <Clock size={12} className="shrink-0" />
            <span>{formatTimeAgo(lastActive)}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold text-xs group-hover:translate-x-0.5 transition-transform shrink-0">
          <span>Open</span>
          <ChevronRight size={13} />
        </div>
      </div>
    </div>
  );
};

export default QueryCard;
