import React from 'react';
import { MessageSquare, RefreshCw } from 'lucide-react';
import DiscussionSearch from './DiscussionSearch';
import DiscussionList from './DiscussionList';
import NotificationPermissionControl from './NotificationPermissionControl';

const DiscussionSidebar = ({
  discussions = [],
  selectedDiscussion,
  onSelectDiscussion,
  loading,
  error,
  onRefresh,
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  user,
}) => {
  const filteredDiscussions = discussions.filter((disc) => {
    const title = disc.courseId?.title || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase().trim());

    if (!matchesSearch) return false;

    if (filterType === 'recent') {
      return Boolean(disc.lastMessage);
    }

    return true;
  });

  return (
    <div className="w-full h-full flex flex-col bg-[var(--lms-surface-elevated)] border-r border-[var(--lms-border)] overflow-hidden">
      <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--lms-border)] bg-[var(--lms-surface)] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-sm shadow-cyan-500/20 shrink-0">
            <MessageSquare size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[var(--lms-text-primary)] leading-tight truncate">
              Discussions
            </h2>
            <p className="text-[11px] text-[var(--lms-text-muted)] truncate font-medium">
              Course conversations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <NotificationPermissionControl />
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-full border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface)] text-[var(--lms-text-secondary)] hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            title="Refresh discussions"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <DiscussionSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div className="px-3 py-2 border-b border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            filterType === 'all'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)]'
          }`}
        >
          All ({discussions.length})
        </button>
        <button
          onClick={() => setFilterType('recent')}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
            filterType === 'recent'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)]'
          }`}
        >
          Active Chat
        </button>
      </div>

      <DiscussionList
        discussions={filteredDiscussions}
        selectedDiscussion={selectedDiscussion}
        onSelectDiscussion={onSelectDiscussion}
        loading={loading}
        error={error}
        onRetry={onRefresh}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default DiscussionSidebar;
