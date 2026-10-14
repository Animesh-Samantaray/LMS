import React from 'react';
import { User, Lock } from 'lucide-react';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return 'Yesterday';
  }

  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarBg = (name = '') => {
  const colors = [
    'bg-gradient-to-br from-indigo-500 to-purple-600',
    'bg-gradient-to-br from-cyan-500 to-blue-600',
    'bg-gradient-to-br from-emerald-500 to-teal-600',
    'bg-gradient-to-br from-rose-500 to-pink-600',
    'bg-gradient-to-br from-amber-500 to-orange-600',
    'bg-gradient-to-br from-violet-500 to-fuchsia-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const DirectConversationListItem = ({
  conversation,
  isSelected,
  onSelect,
}) => {
  const otherUser = conversation.otherParticipant || {};
  const lastMsg = conversation.lastMessage;
  const targetName = otherUser.name || 'Member';

  return (
    <div
      onClick={() => onSelect(conversation)}
      className={`group relative flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-all border-b border-[var(--lms-border)] ${
        isSelected
          ? 'bg-cyan-500/15 dark:bg-cyan-950/40 border-l-4 border-l-cyan-500'
          : 'hover:bg-[var(--lms-surface-subtle)]'
      }`}
    >
      <div className="relative shrink-0">
        <div
          className={`w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center text-white font-bold text-xs shadow-sm border border-cyan-500/20 ${
            otherUser.profileImage ? 'bg-slate-700' : getAvatarBg(targetName)
          }`}
        >
          {otherUser.profileImage ? (
            <img
              src={otherUser.profileImage}
              alt={targetName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{getInitials(targetName)}</span>
          )}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[var(--lms-surface)]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1.5 truncate">
            <h4
              className={`text-sm font-semibold truncate ${
                isSelected
                  ? 'text-cyan-700 dark:text-cyan-300 font-bold'
                  : 'text-[var(--lms-text-primary)]'
              }`}
            >
              {targetName}
            </h4>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold border border-cyan-500/20 shrink-0">
              {otherUser.role || 'Member'}
            </span>
          </div>
          <span className="text-[11px] text-[var(--lms-text-muted)] shrink-0 font-medium">
            {formatTime(lastMsg?.createdAt || conversation.updatedAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-[var(--lms-text-muted)] truncate flex-1">
            {lastMsg?.content || 'No messages yet'}
          </p>
          {conversation.unreadCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500 text-white shadow-sm shrink-0">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DirectConversationListItem;
