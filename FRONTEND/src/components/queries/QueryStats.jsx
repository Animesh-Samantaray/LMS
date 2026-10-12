import React from 'react';
import { HelpCircle, Clock, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';

const QueryStats = ({ stats, loading = false, activeFilter, onFilterChange }) => {
  const cards = [
    {
      id: 'all',
      title: 'Total Queries',
      count: stats?.total ?? 0,
      icon: HelpCircle,
      gradient: 'from-violet-500/10 via-indigo-500/5 to-transparent',
      border: 'border-indigo-500/30',
      activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10',
      text: 'text-indigo-600 dark:text-indigo-400',
      bgIcon: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-300',
    },
    {
      id: 'pending',
      title: 'Pending',
      count: stats?.pending ?? 0,
      icon: Clock,
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
      border: 'border-amber-500/30',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 shadow-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      bgIcon: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      count: stats?.inProgress ?? 0,
      icon: ArrowUpRight,
      gradient: 'from-blue-500/10 via-blue-500/5 to-transparent',
      border: 'border-blue-500/30',
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10',
      text: 'text-blue-600 dark:text-blue-400',
      bgIcon: 'bg-blue-500/15 text-blue-600 dark:text-blue-300',
    },
    {
      id: 'answered',
      title: 'Answered',
      count: stats?.answered ?? 0,
      icon: CheckCircle2,
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      border: 'border-emerald-500/30',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      bgIcon: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
    },
    {
      id: 'closed',
      title: 'Closed',
      count: stats?.closed ?? 0,
      icon: XCircle,
      gradient: 'from-slate-500/10 via-slate-500/5 to-transparent',
      border: 'border-slate-500/30',
      activeBorder: 'border-slate-500 ring-2 ring-slate-500/20 shadow-slate-500/10',
      text: 'text-slate-600 dark:text-slate-400',
      bgIcon: 'bg-slate-500/15 text-slate-600 dark:text-slate-300',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const isSelected = activeFilter === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onFilterChange && onFilterChange(c.id)}
            className={`text-left rounded-2xl p-4 sm:p-5 border transition-all duration-300 relative overflow-hidden group bg-gradient-to-br ${c.gradient} bg-[var(--lms-surface)] backdrop-blur-sm ${
              isSelected
                ? `${c.activeBorder} shadow-lg scale-[1.02]`
                : 'border-[var(--lms-border)] hover:border-indigo-400/50 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)] truncate">
                {c.title}
              </span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 shadow-sm ${c.bgIcon}`}>
                <Icon size={16} />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              {loading ? (
                <div className="h-7 w-14 bg-[var(--lms-surface-subtle)] animate-pulse rounded-lg" />
              ) : (
                <span className={`text-2xl sm:text-3xl font-black tracking-tight ${c.text}`}>
                  {Number(c.count).toLocaleString()}
                </span>
              )}
              {isSelected && (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm">
                  Active
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default QueryStats;
