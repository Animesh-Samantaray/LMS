import React from 'react';
import { MessageSquare, Search, RefreshCw, AlertCircle } from 'lucide-react';
import DiscussionListItem from './DiscussionListItem';

const DiscussionList = ({
  discussions = [],
  selectedDiscussion,
  onSelectDiscussion,
  loading,
  error,
  onRetry,
  searchQuery,
}) => {
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="flex items-center gap-3 p-3 rounded-xl animate-pulse bg-[var(--lms-surface-subtle)]"
          >
            <div className="w-12 h-12 rounded-2xl bg-[var(--lms-border)] shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-[var(--lms-border)] rounded w-3/4" />
              <div className="h-3 bg-[var(--lms-border)] rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={36} className="text-rose-500 mb-2" />
        <p className="text-sm font-semibold text-[var(--lms-text-primary)] mb-1">
          Failed to load discussions
        </p>
        <p className="text-xs text-[var(--lms-text-muted)] mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <RefreshCw size={13} />
          Retry
        </button>
      </div>
    );
  }

  if (discussions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {searchQuery ? (
          <>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mb-3 border border-cyan-500/20">
              <Search size={22} />
            </div>
            <p className="text-sm font-semibold text-[var(--lms-text-primary)] mb-1">
              No matching courses found
            </p>
            <p className="text-xs text-[var(--lms-text-muted)]">
              Try searching with a different course title.
            </p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mb-3 border border-cyan-500/20">
              <MessageSquare size={22} />
            </div>
            <p className="text-sm font-semibold text-[var(--lms-text-primary)] mb-1">
              No discussions available
            </p>
            <p className="text-xs text-[var(--lms-text-muted)]">
              When you enroll in courses or create them, their discussions will appear here.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-[var(--lms-border)]">
      {discussions.map((disc) => (
        <DiscussionListItem
          key={disc._id}
          discussion={disc}
          isSelected={selectedDiscussion?._id === disc._id}
          onSelect={onSelectDiscussion}
        />
      ))}
    </div>
  );
};

export default DiscussionList;
