import React from 'react';

const KPICard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme = 'blue',
  badgeText,
  onClick,
}) => {
  const colorMap = {
    blue: {
      iconBg: 'bg-blue-500/15 text-blue-500 border-blue-500/25',
      accentBorder: 'hover:border-blue-500/40',
      badge: 'bg-blue-500/15 text-blue-500',
    },
    purple: {
      iconBg: 'bg-purple-500/15 text-purple-500 border-purple-500/25',
      accentBorder: 'hover:border-purple-500/40',
      badge: 'bg-purple-500/15 text-purple-500',
    },
    emerald: {
      iconBg: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25',
      accentBorder: 'hover:border-emerald-500/40',
      badge: 'bg-emerald-500/15 text-emerald-500',
    },
    amber: {
      iconBg: 'bg-amber-500/15 text-amber-500 border-amber-500/25',
      accentBorder: 'hover:border-amber-500/40',
      badge: 'bg-amber-500/15 text-amber-500',
    },
    rose: {
      iconBg: 'bg-rose-500/15 text-rose-500 border-rose-500/25',
      accentBorder: 'hover:border-rose-500/40',
      badge: 'bg-rose-500/15 text-rose-500',
    },
    teal: {
      iconBg: 'bg-teal-500/15 text-teal-500 border-teal-500/25',
      accentBorder: 'hover:border-teal-500/40',
      badge: 'bg-teal-500/15 text-teal-500',
    },
  };

  const scheme = colorMap[colorScheme] || colorMap.blue;

  return (
    <div
      onClick={onClick}
      className={`lms-glass-card p-5 flex flex-col justify-between transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${scheme.accentBorder}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span className="text-[11px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-[var(--lms-text-primary)] tracking-tight">
            {value !== undefined && value !== null ? value : '—'}
          </div>
        </div>
        {Icon && (
          <div
            className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${scheme.iconBg}`}
          >
            <Icon size={20} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--lms-border-subtle)] text-[11px]">
        {subtitle && (
          <span className="text-[var(--lms-text-secondary)] font-medium truncate">
            {subtitle}
          </span>
        )}
        {badgeText && (
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${scheme.badge}`}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};

export default KPICard;
