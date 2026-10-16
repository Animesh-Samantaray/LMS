import React from 'react';
import { BookOpen, FileText, Image as ImageIcon, Sparkles, Archive, ArchiveRestore } from 'lucide-react';
import { motion } from 'framer-motion';
import { chatItemVariants } from '../../utils/motion';

const formatMessageTime = (dateStr) => {
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

const DiscussionListItem = ({
  discussion,
  isSelected,
  onSelect,
  isArchived = false,
  onArchive,
  onUnarchive,
}) => {
  const course = discussion.courseId || {};
  const lastMsg = discussion.lastMessage;
  const isItemArchived = isArchived || discussion.isArchived;

  const getPreviewText = () => {
    if (!lastMsg) return 'No messages yet. Start the conversation!';
    const sender = lastMsg.sender?.name ? `${lastMsg.sender.name}: ` : '';

    if (lastMsg.type === 'sticker') {
      return `${sender}🎨 [Sticker]`;
    }
    if (lastMsg.type === 'file') {
      return `${sender}📎 ${lastMsg.fileName || 'Attachment'}`;
    }
    return `${sender}${lastMsg.content || ''}`;
  };

  return (
    <motion.div
      layout
      variants={chatItemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onClick={() => onSelect(discussion)}
      className={`group relative flex items-center gap-3 px-3.5 py-3 cursor-pointer transition-all border-b border-[var(--lms-border)] ${
        isSelected
          ? 'bg-cyan-500/15 dark:bg-cyan-950/40 border-l-4 border-l-cyan-500'
          : 'hover:bg-[var(--lms-surface-subtle)]'
      }`}
    >
      <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-gradient-to-br from-cyan-600 to-teal-800 flex items-center justify-center text-white font-bold shadow-sm border border-cyan-500/20">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title || 'Course'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <BookOpen size={22} className="text-cyan-200" />
        )}
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
              {course.title || 'Untitled Course'}
            </h4>
            {isItemArchived && (
              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20 shrink-0">
                Archived
              </span>
            )}
          </div>
          <span className="text-[11px] text-[var(--lms-text-muted)] shrink-0 font-medium">
            {formatMessageTime(lastMsg?.createdAt || discussion.updatedAt)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-[var(--lms-text-muted)] truncate flex-1">
            {getPreviewText()}
          </p>

          <div className="flex items-center gap-1.5 shrink-0">
            {discussion.unreadCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-500 text-white shadow-sm shrink-0">
                {discussion.unreadCount}
              </span>
            )}
            {discussion.memberCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--lms-surface-subtle)] text-[var(--lms-text-muted)] border border-[var(--lms-border)] shrink-0">
                {discussion.memberCount} members
              </span>
            )}

            {/* Archive / Unarchive Quick Action */}
            {isItemArchived ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUnarchive && onUnarchive(discussion._id);
                }}
                className="p-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer shadow-2xs"
                title="Unarchive group discussion"
                aria-label="Unarchive group discussion"
              >
                <ArchiveRestore size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive && onArchive(discussion._id);
                }}
                className="p-1.5 rounded-lg border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] text-[var(--lms-text-muted)] hover:text-cyan-500 hover:border-cyan-500/30 hover:bg-cyan-500/10 transition-all cursor-pointer shadow-2xs"
                title="Archive group discussion"
                aria-label="Archive group discussion"
              >
                <Archive size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscussionListItem;
