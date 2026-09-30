import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import StarRating from './StarRating';

const ReviewSummary = ({ summary, loading }) => {
  if (loading) {
    return (
      <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-6 sm:p-8 animate-pulse">
        <div className="h-6 bg-[var(--lms-surface-subtle)] rounded w-48 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-center">
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-20 bg-[var(--lms-surface-subtle)] rounded-xl"></div>
            <div className="h-5 w-28 bg-[var(--lms-surface-subtle)] rounded"></div>
            <div className="h-4 w-24 bg-[var(--lms-surface-subtle)] rounded"></div>
          </div>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((s) => (
              <div key={s} className="h-4 bg-[var(--lms-surface-subtle)] rounded-full w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const averageRating = Number(summary?.averageRating || 0);
  const totalReviews = Number(summary?.totalReviews || 0);
  const distribution = summary?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--lms-border)]">
        <h2 className="text-xl font-bold text-[var(--lms-text-primary)] flex items-center gap-2">
          <Star size={20} className="text-amber-400 fill-amber-400" />
          <span>Student Feedback & Ratings</span>
        </h2>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] border border-[var(--lms-border)]">
          {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
        </span>
      </div>

      {totalReviews === 0 ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <MessageSquare size={22} />
          </div>
          <h3 className="text-base font-bold text-[var(--lms-text-primary)] mb-1">No reviews yet</h3>
          <p className="text-xs text-[var(--lms-text-secondary)] max-w-sm mx-auto">
            Be the first student to complete lessons and share your learning experience!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 items-center">
          <div className="flex flex-col items-center justify-center text-center p-4 rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]">
            <span className="text-4xl sm:text-5xl font-extrabold text-[var(--lms-text-primary)] tracking-tight">
              {averageRating.toFixed(1)}
            </span>
            <div className="my-2">
              <StarRating rating={averageRating} size={18} />
            </div>
            <span className="text-xs font-medium text-[var(--lms-text-muted)]">
              Course Rating ({totalReviews} {totalReviews === 1 ? 'rating' : 'ratings'})
            </span>
          </div>

          <div className="space-y-2.5">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = Number(distribution[stars] || 0);
              const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <div className="w-12 flex items-center gap-1 font-semibold text-[var(--lms-text-secondary)] shrink-0">
                    <span>{stars}</span>
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                  </div>

                  <div className="flex-1 h-2.5 bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <div className="w-12 text-right font-medium text-[var(--lms-text-muted)] shrink-0">
                    {percentage}%
                  </div>

                  <div className="w-8 text-right font-medium text-[var(--lms-text-secondary)] shrink-0">
                    ({count})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSummary;
