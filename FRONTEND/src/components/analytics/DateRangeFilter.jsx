import React from 'react';
import { Calendar } from 'lucide-react';

const DateRangeFilter = ({ selectedRange, onRangeChange, options }) => {
  const defaultOptions = [
    { value: '7', label: 'Last 7 Days' },
    { value: '30', label: 'Last 30 Days' },
    { value: '90', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' },
  ];

  const filterOptions = options || defaultOptions;

  return (
    <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-[var(--lms-surface)] border border-[var(--lms-border)] shadow-sm">
      <div className="pl-2 pr-1 text-[var(--lms-text-muted)] flex items-center">
        <Calendar size={14} />
      </div>
      {filterOptions.map((opt) => {
        const isSelected = selectedRange === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onRangeChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isSelected
                ? 'bg-[var(--lms-accent)] text-white shadow-sm'
                : 'text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-subtle)]'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};

export default DateRangeFilter;
