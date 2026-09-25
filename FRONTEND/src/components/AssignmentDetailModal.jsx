import React from 'react';
import { X, FileText, Calendar, Award, ExternalLink, Globe, Clock, User } from 'lucide-react';

const AssignmentDetailModal = ({
  isOpen,
  assignment,
  onClose,
}) => {
  if (!isOpen || !assignment) return null;

  const isDraft = assignment.status === 'draft';
  const deadlineDate = assignment.deadline ? new Date(assignment.deadline) : null;
  const createdDate = assignment.createdAt ? new Date(assignment.createdAt) : null;
  const isPastDeadline = deadlineDate ? deadlineDate < new Date() : false;

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const creatorName = assignment.createdBy?.name || 'Instructor';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--lms-surface-elevated)] rounded-3xl w-full max-w-xl shadow-2xl border border-[var(--lms-border)] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
                Assignment Details
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
          <button
            onClick={onClose}
            className="text-xs font-bold text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[var(--lms-text-primary)] mb-2">
              {assignment.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--lms-text-muted)]">
              <div className="flex items-center gap-1.5">
                <User size={13} />
                <span>Created by <span className="font-semibold text-[var(--lms-text-primary)]">{creatorName}</span></span>
              </div>
              {createdDate && (
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  <span>Posted on {createdDate.toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                <Award size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] block">
                  Maximum Marks
                </span>
                <span className="text-base font-extrabold text-[var(--lms-text-primary)]">
                  {assignment.maximumMarks}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPastDeadline ? "bg-rose-500/15 text-rose-500" : "bg-blue-500/15 text-blue-500"}`}>
                <Calendar size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] block">
                  Deadline
                </span>
                <span className={`text-xs sm:text-sm font-bold ${isPastDeadline ? "text-rose-500" : "text-[var(--lms-text-primary)]"}`}>
                  {deadlineDate ? deadlineDate.toLocaleString() : 'No deadline'}
                </span>
              </div>
            </div>
          </div>

          {assignment.description && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)] mb-2">
                Instructions / Description
              </h4>
              <div className="p-4 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl text-xs sm:text-sm text-[var(--lms-text-secondary)] whitespace-pre-wrap leading-relaxed">
                {assignment.description}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)] mb-2">
              Assignment Question File
            </h4>
            {assignment.questionFile?.url ? (
              <div className="p-4 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-xs sm:text-sm text-[var(--lms-text-primary)] truncate">
                      {assignment.questionFile.originalName || 'Assignment Questions'}
                    </p>
                    {assignment.questionFile.fileSize > 0 && (
                      <p className="text-[10px] text-[var(--lms-text-muted)] mt-0.5">
                        {formatFileSize(assignment.questionFile.fileSize)}
                      </p>
                    )}
                  </div>
                </div>

                <a
                  href={assignment.questionFile.url}
                  target="_blank"
                  rel="noreferrer"
                  className="lms-btn lms-btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center"
                >
                  <ExternalLink size={14} /> Open Question File
                </a>
              </div>
            ) : (
              <p className="text-xs text-[var(--lms-text-muted)] italic">
                No question file attached.
              </p>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold border border-[var(--lms-border)] text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface)] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetailModal;
