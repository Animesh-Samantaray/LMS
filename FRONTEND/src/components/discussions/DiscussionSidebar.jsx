import React from 'react';
import { MessageSquare, RefreshCw, BookOpen, User } from 'lucide-react';
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
  activeDirectChat,
  onSelectDirectChat,
}) => {
  const query = searchQuery.toLowerCase().trim();

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

    if (filterType === 'recent') {
      return Boolean(disc.lastMessage);
    }

    return true;
  });

  // Filter direct conversations
  const filteredDirect = directConversations.filter((conv) => {
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
            {discussions.length}
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
            ? 'Search course discussions...'
            : 'Search direct chats...'
        }
      />

      {/* Filter Chips for Course Groups */}
      {sidebarTab === 'groups' && (
        <div className="px-3 py-2 border-b border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)]'
            }`}
          >
            All ({discussions.length})
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
        />
      ) : (
        <div className="flex-1 overflow-y-auto lms-scrollbar">
          {filteredDirect.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-[var(--lms-text-muted)] h-full">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-500 mb-3 border border-cyan-500/20">
                <MessageSquare size={22} />
              </div>
              <p className="text-sm font-semibold text-[var(--lms-text-primary)] mb-1">
                {searchQuery ? 'No direct chats found' : 'No direct chats yet'}
              </p>
              <p className="text-xs text-[var(--lms-text-secondary)] max-w-xs leading-relaxed">
                {searchQuery
                  ? 'Try a different search query.'
                  : 'Open any group discussion, click Members in the header, and select Chat beside any member.'}
              </p>
            </div>
          ) : (
            filteredDirect.map((conv) => (
              <DirectConversationListItem
                key={conv._id}
                conversation={conv}
                isSelected={
                  activeDirectChat?.conversation?._id?.toString() ===
                  conv._id?.toString()
                }
                onSelect={onSelectDirectChat}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DiscussionSidebar;