import React, { useState } from 'react';
import { FileText, Calendar, Award, ExternalLink, Edit2, Trash2, Send, Loader, Globe, Clock, AlertCircle, Users } from 'lucide-react';

const AssignmentCard = ({
  assignment,
  canManage = false,
  onView,
  onSubmissions,
  onEdit,
  onPublish,
  onDelete,
  isPublishing = false,
  isDeleting = false,
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!assignment) return null;

  const isDraft = assignment.status === 'draft';
  const deadlineDate = assignment.deadline ? new Date(assignment.deadline) : null;
  const isPastDeadline = deadlineDate ? deadlineDate < new Date() : false;

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-5 shadow-sm hover:border-[var(--lms-accent-border)] transition-all flex flex-col justify-between gap-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center shrink-0">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm sm:text-base text-[var(--lms-text-primary)] truncate">
                {assignment.title}
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

        {assignment.description && (
          <p className="text-xs text-[var(--lms-text-secondary)] line-clamp-2 leading-relaxed">
            {assignment.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--lms-border)] text-xs">
          <div className="flex items-center gap-1.5 text-[var(--lms-text-secondary)]">
            <Award size={14} className="text-[var(--lms-accent)] shrink-0" />
            <span className="font-semibold">{assignment.maximumMarks} Marks</span>
          </div>

          <div className="flex items-center gap-1.5 text-[var(--lms-text-secondary)] justify-end">
            <Calendar size={14} className={isPastDeadline ? "text-rose-500 shrink-0" : "text-amber-500 shrink-0"} />
            <span className={`font-semibold ${isPastDeadline ? "text-rose-500" : ""}`}>
              {deadlineDate ? deadlineDate.toLocaleDateString() : 'No deadline'}
            </span>
          </div>
        </div>

        {assignment.questionFile?.originalName && (
          <div className="p-2.5 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <FileText size={14} className="text-rose-500 shrink-0" />
              <span className="font-medium text-[var(--lms-text-primary)] truncate">
                {assignment.questionFile.originalName}
              </span>
              {assignment.questionFile.fileSize > 0 && (
                <span className="text-[10px] text-[var(--lms-text-muted)] shrink-0">
                  ({formatFileSize(assignment.questionFile.fileSize)})
                </span>
              )}
            </div>
            {assignment.questionFile.url && (
              <a
                href={assignment.questionFile.url}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--lms-accent)] hover:underline text-[11px] font-bold flex items-center gap-1 shrink-0"
              >
                <span>View</span>
                <ExternalLink size={11} />
              </a>
            )}
          </div>
        )}
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
                onClick={() => onDelete && onDelete(assignment._id)}
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
              onClick={() => onView && onView(assignment)}
              className="flex-1 lms-btn lms-btn-secondary py-1.5 px-3 text-xs font-semibold flex items-center justify-center gap-1"
            >
              <span>{canManage ? 'View' : 'View Assignment'}</span>
            </button>

            {canManage && (
              <>
                <button
                  type="button"
                  onClick={() => onSubmissions && onSubmissions(assignment)}
                  className="p-2 rounded-xl text-[var(--lms-text-secondary)] hover:text-blue-500 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] transition-colors"
                  title="View Submissions"
                >
                  <Users size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => onEdit && onEdit(assignment)}
                  className="p-2 rounded-xl text-[var(--lms-text-secondary)] hover:text-[var(--lms-accent)] bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] transition-colors"
                  title="Edit Assignment"
                >
                  <Edit2 size={14} />
                </button>

                {isDraft && onPublish && (
                  <button
                    type="button"
                    onClick={() => onPublish(assignment._id)}
                    disabled={isPublishing}
                    className="flex items-center gap-1 py-1.5 px-2.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-colors"
                    title="Publish Assignment"
                  >
                    {isPublishing ? <Loader size={12} className="animate-spin" /> : <Send size={12} />}
                    <span>Publish</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDeleteConfirm(true)}
                  className="p-2 rounded-xl text-rose-500 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] hover:bg-rose-500/15 hover:border-rose-500/30 transition-colors"
                  title="Delete Assignment"
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

export default AssignmentCard;
