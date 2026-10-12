import React from 'react';
import { Clock, CheckCircle2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300/40 dark:border-amber-500/30',
    dot: 'bg-amber-500 shadow-sm shadow-amber-500/50',
  },
  in_progress: {
    label: 'In Progress',
    icon: AlertCircle,
    className: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-300/40 dark:border-indigo-500/30',
    dot: 'bg-indigo-500 shadow-sm shadow-indigo-500/50',
  },
  answered: {
    label: 'Answered',
    icon: CheckCircle2,
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/40 dark:border-emerald-500/30',
    dot: 'bg-emerald-500 shadow-sm shadow-emerald-500/50',
  },
  closed: {
    label: 'Closed',
    icon: XCircle,
    className: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/40 dark:border-slate-500/30',
    dot: 'bg-slate-400',
  },
};

const QueryStatusBadge = ({ status, size = 'sm', showDot = true }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'text-[10px] px-2.5 py-0.5 gap-1.5 font-semibold',
    sm: 'text-xs px-3 py-1 gap-1.5 font-bold',
    md: 'text-sm px-3.5 py-1.5 gap-2 font-bold',
  }[size] || 'text-xs px-3 py-1 gap-1.5 font-bold';

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm backdrop-blur-sm tracking-wide uppercase ${sizeClasses} ${config.className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      )}
      <Icon size={size === 'xs' ? 11 : size === 'sm' ? 13 : 15} />
      <span>{config.label}</span>
    </span>
  );
};

export default QueryStatusBadge;
