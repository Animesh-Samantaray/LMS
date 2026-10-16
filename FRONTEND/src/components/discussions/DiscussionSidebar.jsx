import React from 'react';
import { MessageSquare, RefreshCw, BookOpen, User, Archive, ArrowLeft } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import DiscussionSearch from './DiscussionSearch';
import DiscussionList from './DiscussionList';
import DirectConversationListItem from './DirectConversationListItem';
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
  sidebarTab = 'groups',
  setSidebarTab,
  directConversations = [],
  archivedDirectConversations = [],
  directSubView = 'active',
  setDirectSubView,
  onArchiveConversation,
  onUnarchiveConversation,
  onArchiveDiscussion,
  onUnarchiveDiscussion,
  activeDirectChat,
  onSelectDirectChat,
}) => {
  const query = searchQuery.toLowerCase().trim();

  const activeDiscussions = discussions.filter((d) => !d.isArchived);
  const archivedDiscussions = discussions.filter((d) => Boolean(d.isArchived));

  // Filter group discussions
  const filteredDiscussions = discussions.filter((disc) => {
    const courseTitle = (disc.courseId?.title || '').toLowerCase();
    const creatorName = (disc.courseId?.createdBy?.name || '').toLowerCase();
    const senderName = (disc.lastMessage?.sender?.name || '').toLowerCase();

    const matchesSearch =
      !query ||
      courseTitle.includes(query) ||
      creatorName.includes(query) ||
      senderName.includes(query);

    if (!matchesSearch) return false;

    if (filterType === 'archived') {
      return Boolean(disc.isArchived);
    }

    if (filterType === 'recent') {
      return !disc.isArchived && Boolean(disc.lastMessage);
    }

    // Default 'all' shows active unarchived discussions
    return !disc.isArchived;
  });

  // Filter active direct conversations
  const filteredActiveDirect = directConversations.filter((conv) => {
    const targetName = (conv.otherParticipant?.name || '').toLowerCase();
    const targetEmail = (conv.otherParticipant?.email || '').toLowerCase();
    const lastMsg = (conv.lastMessage?.content || '').toLowerCase();

    return (
      !query ||
      targetName.includes(query) ||
      targetEmail.includes(query) ||
      lastMsg.includes(query)
    );
  });

  // Filter archived direct conversations
  const filteredArchivedDirect = archivedDirectConversations.filter((conv) => {
    const targetName = (conv.otherParticipant?.name || '').toLowerCase();
    const targetEmail = (conv.otherParticipant?.email || '').toLowerCase();
    const lastMsg = (conv.lastMessage?.content || '').toLowerCase();

    return (
      !query ||
      targetName.includes(query) ||
      targetEmail.includes(query) ||
      lastMsg.includes(query)
    );
  });

  const totalDirectUnread = directConversations.reduce(
    (sum, c) => sum + (c.unreadCount || 0),
    0
  );

  const displayedDirectList =
    directSubView === 'archived' ? filteredArchivedDirect : filteredActiveDirect;

  return (
    <div className="w-full h-full flex flex-col bg-[var(--lms-surface-elevated)] border-r border-[var(--lms-border)] overflow-hidden">
      {/* Top Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--lms-border)] bg-[var(--lms-surface)] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-sm shadow-cyan-500/20 shrink-0">
            <MessageSquare size={18} />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-[var(--lms-text-primary)] leading-tight truncate">
              Messaging
            </h2>
            <p className="text-[11px] text-[var(--lms-text-muted)] truncate font-medium">
              Group & Direct Chats
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <NotificationPermissionControl />
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-full border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface)] text-[var(--lms-text-secondary)] hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
            title="Refresh"
            aria-label="Refresh"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Primary Category Switcher: Course Groups vs Direct Messages */}
      <div className="flex border-b border-[var(--lms-border)] bg-[var(--lms-surface)] shrink-0">
        <button
          onClick={() => setSidebarTab && setSidebarTab('groups')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            sidebarTab === 'groups'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-subtle)]'
          }`}
        >
          <BookOpen size={14} />
          <span>Course Groups</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] border border-[var(--lms-border)]">
            {activeDiscussions.length}
          </span>
        </button>

        <button
          onClick={() => setSidebarTab && setSidebarTab('direct')}
          className={`flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
            sidebarTab === 'direct'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-subtle)]'
          }`}
        >
          <User size={14} />
          <span>Direct Chats</span>
          {totalDirectUnread > 0 ? (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-500 text-white font-extrabold shadow-sm">
              {totalDirectUnread}
            </span>
          ) : (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] border border-[var(--lms-border)]">
              {directConversations.length}
            </span>
          )}
        </button>
      </div>

      {/* Search Input */}
      <DiscussionSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        placeholder={
          sidebarTab === 'groups'
            ? filterType === 'archived'
              ? 'Search archived groups...'
              : 'Search course discussions...'
            : directSubView === 'archived'
            ? 'Search archived chats...'
            : 'Search direct chats...'
        }
      />

      {/* Filter Chips for Course Groups */}
      {sidebarTab === 'groups' && (
        <div className="px-3 py-2 border-b border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] flex items-center gap-1.5 shrink-0 overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)]'
            }`}
          >
            All ({activeDiscussions.length})
          </button>

          <button
            onClick={() => setFilterType('recent')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'recent'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)]'
            }`}
          >
            Active Chat
          </button>

          <button
            onClick={() => setFilterType('archived')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              filterType === 'archived'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)]'
            }`}
          >
            <Archive size={12} />
            <span>Archived</span>
            {archivedDiscussions.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filterType === 'archived'
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                }`}
              >
                {archivedDiscussions.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Sub-navigation Filter for Direct Chats: Active vs Archived */}
      {sidebarTab === 'direct' && (
        <div className="px-3 py-2 border-b border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setDirectSubView && setDirectSubView('active')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              directSubView === 'active'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)]'
            }`}
          >
            <span>All</span>
            <span className="opacity-80">({directConversations.length})</span>
          </button>

          <button
            onClick={() => setDirectSubView && setDirectSubView('archived')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              directSubView === 'archived'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)]'
            }`}
          >
            <Archive size={12} />
            <span>Archived</span>
            {archivedDirectConversations.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  directSubView === 'archived'
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                }`}
              >
                {archivedDirectConversations.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* When in Archived sub-view, display a contextual header banner */}
      {sidebarTab === 'direct' && directSubView === 'archived' && (
        <div className="px-3.5 py-2 bg-amber-500/5 dark:bg-amber-950/20 border-b border-amber-500/20 flex items-center justify-between text-xs shrink-0">
          <button
            onClick={() => setDirectSubView && setDirectSubView('active')}
            className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Active Chats</span>
          </button>
          <span className="text-[11px] text-[var(--lms-text-muted)] font-medium">
            Archived conversations
          </span>
        </div>
      )}

      {/* List Area */}
      {sidebarTab === 'groups' ? (
        <DiscussionList
          discussions={filteredDiscussions}
          selectedDiscussion={!activeDirectChat ? selectedDiscussion : null}
          onSelectDiscussion={onSelectDiscussion}
          loading={loading}
          error={error}
          onRetry={onRefresh}
          searchQuery={searchQuery}
          filterType={filterType}
          onArchive={onArchiveDiscussion}
          onUnarchive={onUnarchiveDiscussion}
        />
      ) : (
        <div className="flex-1 overflow-y-auto lms-scrollbar">
          {displayedDirectList.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[var(--lms-text-muted)] h-full">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border ${
                  directSubView === 'archived'
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                    : 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20'
                }`}
              >
                {directSubView === 'archived' ? (
                  <Archive size={22} />
                ) : (
                  <MessageSquare size={22} />
                )}
              </div>
              <p className="text-sm font-semibold text-[var(--lms-text-primary)] mb-1">
                {directSubView === 'archived'
                  ? searchQuery
                    ? 'No archived chats match'
                    : 'No archived chats'
                  : searchQuery
                  ? 'No direct chats found'
                  : 'No direct chats yet'}
              </p>
              <p className="text-xs text-[var(--lms-text-secondary)] max-w-xs leading-relaxed">
                {directSubView === 'archived'
                  ? searchQuery
                    ? 'Try a different search keyword.'
                    : 'Conversations you archive will be stored here safely without deleting any history.'
                  : searchQuery
                  ? 'Try a different search query.'
                  : 'Open any group discussion, click Members in the header, and select Chat beside any member.'}
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {displayedDirectList.map((conv) => (
                <DirectConversationListItem
                  key={conv._id}
                  conversation={conv}
                  isArchived={directSubView === 'archived'}
                  onArchive={onArchiveConversation}
                  onUnarchive={onUnarchiveConversation}
                  isSelected={
                    activeDirectChat?.conversation?._id?.toString() ===
                    conv._id?.toString()
                  }
                  onSelect={onSelectDirectChat}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      )}
    </div>
  );
};

export default DiscussionSidebar;