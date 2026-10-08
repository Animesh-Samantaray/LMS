import React from 'react';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

export const ExamSubmitModal = ({
  isOpen,
  onClose,
  onSubmit,
  totalQuestions = 0,
  answeredCount = 0,
  submitting = false,
}) => {
  if (!isOpen) return null;

  const unansweredCount = Math.max(0, totalQuestions - answeredCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="lms-glass-card w-full max-w-md p-6 rounded-2xl border border-[var(--lms-border)] shadow-xl relative animate-scale-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-hover)] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-[var(--lms-accent)]/15 border border-[var(--lms-accent)]/30 text-[var(--lms-accent)]">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--lms-accent)]">
              Confirm Submission
            </span>
            <h2 className="text-lg font-bold text-[var(--lms-text-primary)]">Submit Exam Attempt?</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-center">
            <div className="text-2xl font-black text-emerald-400">{answeredCount}</div>
            <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mt-0.5">
              Answered
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-center">
            <div className="text-2xl font-black text-amber-400">{unansweredCount}</div>
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mt-0.5">
              Unanswered
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300 mb-6">
          <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-400" />
          <p>
            You will not be able to modify any responses after final submission. Your answers will be automatically evaluated.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3 px-4 rounded-xl border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] text-xs font-bold text-[var(--lms-text-secondary)] transition-all"
          >
            Review Answers
          </button>
          <button
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 py-3 px-4 rounded-xl bg-[var(--lms-accent)] hover:bg-[var(--lms-accent-hover)] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Submit Final Exam'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
