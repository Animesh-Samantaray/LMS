import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, X } from 'lucide-react';

export const ExamStartModal = ({ isOpen, onClose, exam, onConfirm, loading }) => {
  if (!isOpen || !exam) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="lms-glass-card w-full max-w-lg p-6 sm:p-7 rounded-2xl border border-[var(--lms-border)] shadow-xl relative animate-scale-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-hover)] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--lms-accent)]">
              Exam Confirmation
            </span>
            <h2 className="text-xl font-bold text-[var(--lms-text-primary)]">{exam.title}</h2>
          </div>
        </div>

        <div className="bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl p-4 my-4 space-y-2 text-xs">
          <div className="flex justify-between text-[var(--lms-text-secondary)]">
            <span>Duration:</span>
            <span className="font-bold text-[var(--lms-text-primary)]">{exam.duration} Minutes</span>
          </div>
          <div className="flex justify-between text-[var(--lms-text-secondary)]">
            <span>Total Questions:</span>
            <span className="font-bold text-[var(--lms-text-primary)]">
              {exam.questionCount || exam.questions?.length || 0} Questions
            </span>
          </div>
          <div className="flex justify-between text-[var(--lms-text-secondary)]">
            <span>Max Marks:</span>
            <span className="font-bold text-[var(--lms-text-primary)]">
              {exam.totalMarks || exam.maxMarks || 0} Marks
            </span>
          </div>
          <div className="flex justify-between text-[var(--lms-text-secondary)]">
            <span>Max Attempts Allowed:</span>
            <span className="font-bold text-[var(--lms-text-primary)]">{exam.maxAttempts || 1}</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-300 mb-6">
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-400" />
          <p>
            Your countdown timer begins immediately once you enter the exam and will continue even if you close the browser. Make sure you have an active internet connection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] text-xs font-bold text-[var(--lms-text-secondary)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Start Exam'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
