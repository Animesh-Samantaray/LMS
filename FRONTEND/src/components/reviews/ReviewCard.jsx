import React from 'react';
import { User, Edit2, Trash2 } from 'lucide-react';
import StarRating from './StarRating';

const ReviewCard = ({
  review,
  isOwnReview = false,
  onEdit = null,
  onDelete = null,
  deleting = false,
}) => {
  if (!review) return null;

  const user = review.userId || {};
  const userName = user.name || 'Anonymous Learner';
  const profilePicture = user.profilePicture || user.profileImage || null;
  const rating = review.rating || 5;
  const comment = review.comment || '';
  const createdAt = review.createdAt ? new Date(review.createdAt) : null;
  const updatedAt = review.updatedAt ? new Date(review.updatedAt) : null;
  const isEdited = updatedAt && createdAt && updatedAt.getTime() - createdAt.getTime() > 1000;

  const formattedDate = createdAt
    ? createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        isOwnReview
          ? 'bg-[var(--lms-surface-elevated)] border-[var(--lms-accent)]/40 shadow-sm'
          : 'bg-[var(--lms-surface)] border-[var(--lms-border)] hover:border-[var(--lms-border-hover)]'
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-[var(--lms-accent-subtle)] text-[var(--lms-accent)] border border-[var(--lms-accent-border)] flex items-center justify-center overflow-hidden shrink-0 font-bold uppercase text-sm">
            {profilePicture ? (
              <img
                src={profilePicture}
                alt={userName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <span className={profilePicture ? 'hidden' : 'flex'}>
              {userName.charAt(0) || <User size={16} />}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-sm text-[var(--lms-text-primary)] truncate">
                {userName}
              </h4>
              {isOwnReview && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)]">
                  Your Review
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--lms-text-muted)] mt-0.5">
              <span>{formattedDate}</span>
              {isEdited && (
                <>
                  <span>•</span>
                  <span className="italic text-[11px]">Edited</span>
                </>
              )}
            </div>
          </div>
        </div>

        {isOwnReview && (onEdit || onDelete) && (
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(review)}
                disabled={deleting}
                className="p-1.5 rounded-lg text-[var(--lms-text-secondary)] hover:text-[var(--lms-accent)] hover:bg-[var(--lms-surface-subtle)] transition-colors"
                title="Edit review"
                aria-label="Edit review"
              >
                <Edit2 size={15} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(review)}
                disabled={deleting}
                className="p-1.5 rounded-lg text-[var(--lms-text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Delete review"
                aria-label="Delete review"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mb-2.5">
        <StarRating rating={rating} size={14} />
      </div>

      <p className="text-xs sm:text-sm text-[var(--lms-text-secondary)] leading-relaxed whitespace-pre-wrap break-words">
        {comment}
      </p>
    </div>
  );
};

export default ReviewCard;
