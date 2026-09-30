import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({
  rating = 0,
  maxStars = 5,
  size = 16,
  interactive = false,
  onChange = () => {},
  disabled = false,
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      onMouseLeave={interactive && !disabled ? () => setHoverRating(0) : undefined}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`Rating: ${rating} out of ${maxStars} stars`}
    >
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= displayRating;
        const isHalf = !isFilled && starValue - 0.5 <= displayRating;

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              disabled={disabled}
              onClick={() => !disabled && onChange(starValue)}
              onMouseEnter={() => !disabled && setHoverRating(starValue)}
              onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  onChange(Math.min(maxStars, rating + 1));
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  onChange(Math.max(1, rating - 1));
                }
              }}
              className={`p-1 rounded-lg transition-transform focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)] ${
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-125'
              }`}
              role="radio"
              aria-checked={rating === starValue}
              aria-label={`${starValue} Star${starValue > 1 ? 's' : ''}`}
            >
              <Star
                size={size}
                className={
                  isFilled
                    ? 'text-amber-400 fill-amber-400 transition-colors'
                    : 'text-[var(--lms-text-muted)] hover:text-amber-300 transition-colors'
                }
              />
            </button>
          );
        }

        return (
          <span key={starValue} className="relative inline-flex items-center">
            <Star
              size={size}
              className={
                isFilled
                  ? 'text-amber-400 fill-amber-400 shrink-0'
                  : 'text-[var(--lms-text-muted)]/40 shrink-0'
              }
            />
            {isHalf && (
              <span className="absolute inset-0 overflow-hidden w-1/2">
                <Star size={size} className="text-amber-400 fill-amber-400 shrink-0" />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
