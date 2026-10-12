import React from 'react';
import { HelpCircle, RefreshCw, MessageSquare } from 'lucide-react';
import QueryCard from './QueryCard';

const QueryList = ({
  queries = [],
  loading = false,
  error = null,
  onRetry,
  onSelectQuery,
  selectedQueryId,
  showCourse = true,
  showStudent = true,
  emptyTitle = 'No queries found',
  emptyDescription = 'Questions asked by learners will appear here.',
  actionButton = null,
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-surface)] animate-pulse space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-5 w-24 bg-[var(--lms-surface-subtle)] rounded-full" />
              <div className="h-4 w-12 bg-[var(--lms-surface-subtle)] rounded-md" />
            </div>
            <div className="h-5 w-3/4 bg-[var(--lms-surface-subtle)] rounded-lg" />
            <div className="h-4 w-full bg-[var(--lms-surface-subtle)] rounded-lg" />
            <div className="h-4 w-1/2 bg-[var(--lms-surface-subtle)] rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
          <HelpCircle size={24} />
        </div>
        <h3 className="text-base font-bold text-[var(--lms-text-primary)]">Failed to load queries</h3>
        <p className="text-xs text-[var(--lms-text-muted)] max-w-sm mx-auto">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--lms-surface)] border border-[var(--lms-border)] text-xs font-bold hover:bg-[var(--lms-surface-hover)] transition-all shadow-sm"
          >
            <RefreshCw size={13} />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  if (queries.length === 0) {
    return (
      <div className="p-10 rounded-2xl border border-dashed border-[var(--lms-border)] bg-[var(--lms-surface)] text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
          <MessageSquare size={26} />
        </div>
        <h3 className="text-base font-bold text-[var(--lms-text-primary)]">{emptyTitle}</h3>
        <p className="text-xs text-[var(--lms-text-muted)] max-w-md mx-auto leading-relaxed">
          {emptyDescription}
        </p>
        {actionButton && <div className="pt-2">{actionButton}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {queries.map((query) => (
        <QueryCard
          key={query._id}
          query={query}
          onClick={onSelectQuery}
          isSelected={selectedQueryId === query._id}
          showCourse={showCourse}
          showStudent={showStudent}
        />
      ))}
    </div>
  );
};

export default QueryList;
