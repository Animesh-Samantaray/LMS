import React from 'react';
import { AlertTriangle, Trash2, X, Users, User } from 'lucide-react';

const DeleteMessageDialog = ({
  isOpen,
  onClose,
  onConfirm,
  isDeleting = false,
  canDeleteForEveryone = false,
  initialDeleteType = null, // 'me' | 'everyone' | null
}) => {
  if (!isOpen) return null;

  const isEveryoneChoice = initialDeleteType === 'everyone';
  const isMeChoice = initialDeleteType === 'me';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] shadow-2xl p-6 relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] transition-colors p-1 rounded-lg"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mb-4">
          <Trash2 size={24} />
        </div>

        <h3 className="text-lg font-bold text-[var(--lms-text-primary)] mb-2">
          {isEveryoneChoice
            ? 'Delete message for everyone?'
            : isMeChoice
            ? 'Delete message for me?'
            : 'Delete message?'}
        </h3>

        <p className="text-sm text-[var(--lms-text-secondary)] leading-relaxed mb-6">
          {isEveryoneChoice ? (
            <>
              This message will be deleted for all participants in this chat. A
              placeholder will show{' '}
              <span className="font-semibold text-[var(--lms-text-primary)] italic">
                “This message was deleted”
              </span>
              .
            </>
          ) : isMeChoice ? (
            'This message will only be removed from your chat view. Other participants will still be able to see the message.'
          ) : (
            'Select whether you want to delete this message only for yourself or for all participants in this chat.'
          )}
        </p>

        {/* If a specific type was chosen directly (Delete for Everyone or Delete for Me) */}
        {isEveryoneChoice || isMeChoice ? (
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(isEveryoneChoice ? 'everyone' : 'me')}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
            >
              <Trash2 size={15} />
              {isDeleting
                ? 'Deleting...'
                : isEveryoneChoice
                ? 'Delete for Everyone'
                : 'Delete for Me'}
            </button>
          </div>
        ) : (
          /* If opened generally with both options displayed */
          <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm('me')}
              disabled={isDeleting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface)] border border-[var(--lms-border)] text-[var(--lms-text-primary)] transition-all disabled:opacity-50"
            >
              <User size={15} />
              Delete for Me
            </button>
            {canDeleteForEveryone && (
              <button
                type="button"
                onClick={() => onConfirm('everyone')}
                disabled={isDeleting}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
              >
                <Users size={15} />
                Delete for Everyone
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteMessageDialog;
