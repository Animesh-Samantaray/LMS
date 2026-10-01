import React from 'react';
import { Search, X } from 'lucide-react';

const DiscussionSearch = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="p-3 border-b border-[var(--lms-border)] bg-[var(--lms-surface-elevated)]">
      <div className="relative flex items-center">
        <Search
          size={16}
          className="absolute left-3.5 text-cyan-600 dark:text-cyan-400 pointer-events-none"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search or start new chat"
          className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] text-[var(--lms-text-primary)] placeholder:text-[var(--lms-text-muted)] focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 p-0.5 rounded-full text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-border)] transition-colors"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default DiscussionSearch;
