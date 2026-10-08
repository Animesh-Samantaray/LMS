import React from 'react';
import { CheckCircle2, Bookmark, Check } from 'lucide-react';

export const QuestionNavigator = ({
  questions = [],
  currentIndex = 0,
  answers = {},
  onSelectIndex,
  isMobile = false,
  onCloseMobile,
}) => {
  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const progressPercent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[var(--lms-border)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">
            Navigator
          </span>
          <span className="text-xs font-bold text-[var(--lms-accent)]">
            {answeredCount} / {totalCount} Answered
          </span>
        </div>
        <div className="w-full bg-[var(--lms-surface-subtle)] h-1.5 rounded-full overflow-hidden border border-[var(--lms-border)]/50">
          <div
            className="bg-[var(--lms-accent)] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
        <div className="grid grid-cols-5 gap-2">
          {questions.map((q, idx) => {
            const isAnswered = !!answers[q._id];
            const isCurrent = idx === currentIndex;

            let buttonStyles =
              'bg-[var(--lms-surface-subtle)] border-[var(--lms-border)] text-[var(--lms-text-secondary)] hover:border-[var(--lms-accent)]/60';

            if (isAnswered) {
              buttonStyles =
                'bg-emerald-500/15 border-emerald-500/40 text-emerald-400 font-bold';
            }

            if (isCurrent) {
              buttonStyles =
                'bg-[var(--lms-accent)] border-[var(--lms-accent)] text-white font-bold ring-2 ring-[var(--lms-accent)]/30 scale-105 z-10 shadow-sm';
            }

            return (
              <button
                key={q._id || idx}
                onClick={() => {
                  onSelectIndex(idx);
                  if (isMobile && onCloseMobile) onCloseMobile();
                }}
                className={`relative h-10 w-full rounded-xl border flex items-center justify-center text-xs transition-all duration-200 ${buttonStyles}`}
              >
                <span>{idx + 1}</span>
                {isAnswered && !isCurrent && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-[var(--lms-surface)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-[var(--lms-border)] bg-[var(--lms-surface-subtle)]/50 text-[11px] text-[var(--lms-text-muted)] flex items-center justify-around">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[var(--lms-accent)]" />
          <span>Current</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-emerald-500/20 border border-emerald-500/40" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]" />
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
};
