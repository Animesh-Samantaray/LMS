import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

const ClearDiscussionDialog = ({ isOpen, onClose, onConfirm, clearing, courseTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] shadow-2xl p-6 relative animate-scale-in">
        <button
          onClick={onClose}
          disabled={clearing}
          className="absolute top-4 right-4 text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] transition-colors p-1 rounded-lg"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
          <AlertTriangle size={24} />
        </div>

        <h3 className="text-lg font-bold text-[var(--lms-text-primary)] mb-2">
          Clear Course Discussion?
        </h3>

        <p className="text-sm text-[var(--lms-text-secondary)] leading-relaxed mb-6">
          Are you sure you want to delete all messages in{' '}
          <span className="font-bold text-[var(--lms-text-primary)]">
            "{courseTitle || 'this course discussion'}"
          </span>
          ? This action will remove the entire message history for all members and cannot be undone.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={clearing}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={clearing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
          >
            <Trash2 size={16} />
            {clearing ? 'Clearing Messages...' : 'Clear All Messages'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClearDiscussionDialog;
