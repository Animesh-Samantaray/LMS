import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, XCircle, FileQuestion, Award } from 'lucide-react';

export const getExamStatusInfo = (exam) => {
  if (!exam) return { status: 'UNKNOWN', label: 'Unknown', color: 'slate' };
  if (exam.status === 'draft') {
    return { status: 'DRAFT', label: 'Draft', color: 'slate' };
  }
  if (exam.status === 'archived') {
    return { status: 'ARCHIVED', label: 'Archived', color: 'slate' };
  }
  if (exam.status === 'completed') {
    return { status: 'COMPLETED', label: 'Ended', color: 'amber' };
  }

  const now = new Date();
  const start = new Date(exam.startTime);
  const end = new Date(exam.endTime);

  if (now < start) {
    return { status: 'UPCOMING', label: 'Upcoming', color: 'blue' };
  }
  if (now >= start && now < end) {
    return { status: 'LIVE', label: 'Live Now', color: 'emerald' };
  }
  return { status: 'ENDED', label: 'Ended', color: 'rose' };
};

export const ExamStatusBadge = ({ exam, size = 'normal' }) => {
  const info = getExamStatusInfo(exam);
  const isSmall = size === 'small';

  const badgeStyles = {
    DRAFT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    UPCOMING: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    LIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse',
    ENDED: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    COMPLETED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    ARCHIVED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  }[info.status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-lg border ${badgeStyles} ${
        isSmall ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
    >
      {info.status === 'LIVE' && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
      )}
      {info.label}
    </span>
  );
};
