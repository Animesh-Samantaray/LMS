import React, { useState } from 'react';
import { Clock, Globe, AlertCircle, Edit2, Trash2, Send, Loader, HelpCircle } from 'lucide-react';

const QuizCard = ({
  quiz,
  canManage = false,
  onView,
  onEdit,
  onPublish,
  onDelete,
  isPublishing = false,
  isDeleting = false,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!quiz) return null;

  const isDraft = quiz.status === 'draft';
  const deadlineDate = quiz.deadline ? new Date(quiz.deadline) : null;
  const isPastDeadline = deadlineDate ? deadlineDate < new Date() : false;

  return (
    <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-5 shadow-sm hover:border-[var(--lms-accent-border)] transition-all flex flex-col justify-between gap-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-500 border border-purple-500/30 flex items-center justify-center shrink-0">
              <HelpCircle size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-[var(--lms-text-primary)] truncate">
                {quiz.title}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                {isDraft ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                    <Clock size={10} /> Draft
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                    <Globe size={10} /> Published
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {quiz.description && (
          <p className="text-xs text-[var(--lms-text-secondary)] line-clamp-2 leading-relaxed">
            {quiz.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--lms-border)] text-xs">
          <div className="flex items-center gap-1.5 text-[var(--lms-text-secondary)]">
            <Clock size={14} className="text-[var(--lms-accent)] shrink-0" />
            <span className="font-semibold">{quiz.duration} mins</span>
          </div>

          <div className="flex items-center gap-1.5 text-[var(--lms-text-secondary)] justify-end">
            <AlertCircle size={14} className={isPastDeadline ? "text-rose-500 shrink-0" : "text-amber-500 shrink-0"} />
            <span className={`font-semibold ${isPastDeadline ? "text-rose-500" : ""}`}>
              {deadlineDate ? deadlineDate.toLocaleDateString() : 'No deadline'}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-[var(--lms-border)] flex items-center gap-2 flex-wrap">
        {deleteConfirm ? (
          <div className="flex items-center justify-between w-full gap-2 p-1">
            <span className="text-xs text-rose-500 font-bold flex items-center gap-1">
              <AlertCircle size={13} /> Confirm delete?
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onDelete && onDelete(quiz._id)}
                disabled={isDeleting}
                className="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-bold transition-colors"
              >
                {isDeleting ? <Loader size={12} className="animate-spin" /> : 'Yes'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                className="px-2.5 py-1 bg-[var(--lms-surface)] text-[var(--lms-text-primary)] border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] rounded-lg text-xs font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onView && onView(quiz)}
              className="flex-1 lms-btn lms-btn-secondary py-1.5 px-3 text-xs font-semibold flex items-center justify-center gap-1"
            >
              <span>View Details</span>
            </button>

            {canManage && (
              <>
                <button
                  type="button"
                  onClick={() => onEdit && onEdit(quiz)}
                  className="p-2 rounded-xl border transition-colors text-[var(--lms-text-secondary)] hover:text-[var(--lms-accent)] bg-[var(--lms-surface-subtle)] border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)]"
                  title="Edit Quiz"
                >
                  <Edit2 size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteConfirm(true)}
                  className="p-2 rounded-xl transition-colors text-rose-500 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] hover:bg-rose-500/15 hover:border-rose-500/30"
                  title="Delete Quiz"
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuizCard;
