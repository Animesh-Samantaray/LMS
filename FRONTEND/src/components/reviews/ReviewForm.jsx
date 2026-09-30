import React, { useState, useEffect } from 'react';
import { Loader, AlertCircle } from 'lucide-react';
import StarRating from './StarRating';

const ReviewForm = ({
  initialRating = 5,
  initialComment = '',
  onSubmit,
  onCancel = null,
  isEditing = false,
  submitting = false,
  error = '',
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [clientError, setClientError] = useState('');

  useEffect(() => {
    setRating(initialRating || 5);
    setComment(initialComment || '');
    setClientError('');
  }, [initialRating, initialComment]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setClientError('');

    if (!rating || rating < 1 || rating > 5) {
      setClientError('Please select a star rating between 1 and 5.');
      return;
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length < 3) {
      setClientError('Review comment must be at least 3 characters.');
      return;
    }

    if (trimmedComment.length > 1000) {
      setClientError('Review comment cannot exceed 1000 characters.');
      return;
    }

    onSubmit({
      rating: Number(rating),
      comment: trimmedComment,
    });
  };

  const remainingChars = 1000 - comment.length;
  const isOverLimit = remainingChars < 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(error || clientError) && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error || clientError}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
          Your Rating <span className="text-rose-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <StarRating
            rating={rating}
            size={24}
            interactive={true}
            onChange={(val) => {
              setRating(val);
              setClientError('');
            }}
            disabled={submitting}
          />
          <span className="text-xs font-bold text-[var(--lms-text-primary)]">
            {rating} of 5 Star{rating > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="review-comment-field"
            className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider"
          >
            Your Feedback <span className="text-rose-500">*</span>
          </label>
          <span
            className={`text-[11px] font-semibold ${
              isOverLimit
                ? 'text-rose-500'
                : remainingChars < 50
                ? 'text-amber-500'
                : 'text-[var(--lms-text-muted)]'
            }`}
          >
            {remainingChars} characters left
          </span>
        </div>

        <textarea
          id="review-comment-field"
          rows={4}
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setClientError('');
          }}
          disabled={submitting}
          placeholder="Share your experience with this course, its lectures, assignments, and instructor..."
          className="w-full px-4 py-3 rounded-xl bg-[var(--lms-input-bg)] border border-[var(--lms-input-border)] text-sm text-[var(--lms-text-primary)] placeholder:text-[var(--lms-text-muted)] focus:outline-none focus:border-[var(--lms-accent)] focus:ring-2 focus:ring-[var(--lms-accent-subtle)] transition-all resize-y min-h-[100px] max-h-[300px]"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] transition-colors"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={submitting || isOverLimit || comment.trim().length < 3}
          className="lms-btn lms-btn-primary px-5 py-2 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting && <Loader size={14} className="animate-spin" />}
          <span>{isEditing ? 'Update Review' : 'Submit Review'}</span>
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
