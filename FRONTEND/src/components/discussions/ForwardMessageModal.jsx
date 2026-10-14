import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Forward,
  Search,
  Check,
  Users,
  MessageSquare,
  FileText,
  Sparkles,
  Loader2,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';
import { findStickerById } from '../../utils/stickers';

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0]?.[0] || '';
  const last = parts[parts.length - 1]?.[0] || '';
  return (first + last).toUpperCase() || '?';
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
  const safeName = typeof name === 'string' ? name : '';
  let hash = 0;
  for (let i = 0; i < safeName.length; i++) {
    hash = safeName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const formatFileSize = (bytes) => {
  const num = typeof bytes === 'number' ? bytes : Number(bytes);
  if (!num || isNaN(num) || num <= 0) return '';
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
};

const isImageFile = (mimeType, fileName = '') => {
  if (typeof mimeType === 'string' && mimeType.startsWith('image/')) return true;
  const safeName = typeof fileName === 'string' ? fileName : '';
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(safeName);
};

const ForwardMessageModal = ({
  isOpen,
  onClose,
  message,
  sourceType = 'discussion',
  discussions = [],
  directConversations = [],
  onConfirmForward,
  isForwarding = false,
}) => {
  // Hooks must ALWAYS be called at top-level unconditionally
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'groups' | 'direct'
  const [selectedDiscussions, setSelectedDiscussions] = useState([]);
  const [selectedDirectChats, setSelectedDirectChats] = useState([]);

  // Reset selections & search when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setActiveTab('all');
      setSelectedDiscussions([]);
      setSelectedDirectChats([]);
    }
  }, [isOpen, message?._id]);

  // Filter discussions unconditionally
  const filteredDiscussions = useMemo(() => {
    if (!Array.isArray(discussions)) return [];
    const q = searchQuery.toLowerCase().trim();
    return discussions.filter((d) => {
      if (!d) return false;
      const title = (d.courseId?.title || 'Course Discussion').toString();
      const category = (d.courseId?.category || '').toString();
      return !q || title.toLowerCase().includes(q) || category.toLowerCase().includes(q);
    });
  }, [discussions, searchQuery]);

  // Filter direct conversations unconditionally
  const filteredDirectChats = useMemo(() => {
    if (!Array.isArray(directConversations)) return [];
    const q = searchQuery.toLowerCase().trim();
    return directConversations.filter((c) => {
      if (!c) return false;
      const name = (c.otherParticipant?.name || '').toString();
      const email = (c.otherParticipant?.email || '').toString();
      const role = (c.otherParticipant?.role || '').toString();
      return (
        !q ||
        name.toLowerCase().includes(q) ||
        email.toLowerCase().includes(q) ||
        role.toLowerCase().includes(q)
      );
    });
  }, [directConversations, searchQuery]);

  // Safe early exit AFTER hooks have been declared
  if (!isOpen || !message) return null;

  const toggleDiscussion = (id) => {
    if (!id) return;
    setSelectedDiscussions((prev) =>
      prev.includes(id) ? prev.filter((dId) => dId !== id) : [...prev, id]
    );
  };

  const toggleDirectChat = (id) => {
    if (!id) return;
    setSelectedDirectChats((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const totalSelected = selectedDiscussions.length + selectedDirectChats.length;

  const handleClearSelection = () => {
    setSelectedDiscussions([]);
    setSelectedDirectChats([]);
  };

  const handleForward = async () => {
    if (totalSelected === 0 || isForwarding) return;
    try {
      await onConfirmForward({
        targetDiscussionIds: selectedDiscussions,
        targetConversationIds: selectedDirectChats,
      });
    } catch (err) {
      console.error('Failed to forward message:', err);
    }
  };

  // Message preview rendering
  const renderMessagePreview = () => {
    if (!message) return null;

    const isSticker = message.type === 'sticker';
    const isFile = message.type === 'file';

    if (isSticker) {
      const sticker = message.stickerId ? findStickerById(message.stickerId) : null;
      return (
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xl shrink-0">
            {sticker?.emoji || '🎨'}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold text-[var(--lms-text-primary)] block truncate">
              {sticker?.label || message.content || 'Sticker'}
            </span>
            <span className="text-[10px] text-[var(--lms-text-muted)]">Sticker</span>
          </div>
        </div>
      );
    }

    if (isFile) {
      const isImg = isImageFile(message.fileMimeType, message.fileName);
      return (
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]">
          {isImg && message.fileUrl ? (
            <img
              src={message.fileUrl}
              alt={message.fileName || 'Preview'}
              className="w-10 h-10 rounded-xl object-cover border border-[var(--lms-border)] shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <FileText size={18} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-[var(--lms-text-primary)] block truncate">
              {message.fileName || 'Attachment'}
            </span>
            <div className="flex items-center gap-2 text-[10px] text-[var(--lms-text-muted)]">
              {message.fileSize > 0 && <span>{formatFileSize(message.fileSize)}</span>}
              {message.content && <span className="truncate italic">"{message.content}"</span>}
            </div>
          </div>
        </div>
      );
    }

    const contentText =
      typeof message.content === 'string'
        ? message.content
        : message.content
        ? JSON.stringify(message.content)
        : 'Message content';

    return (
      <div className="p-2.5 rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]">
        <p className="text-xs text-[var(--lms-text-secondary)] line-clamp-2 leading-relaxed">
          {contentText}
        </p>
      </div>
    );
  };

  const renderRoleBadge = (role) => {
    if (role === 'Instructor') {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <GraduationCap size={9} />
          Instructor
        </span>
      );
    }
    if (role === 'Admin') {
      return (
        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          <ShieldCheck size={9} />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
        Student
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-transparent animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--lms-border)] bg-[var(--lms-surface)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shadow-sm">
              <Forward size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--lms-text-primary)] leading-tight">
                Forward Message
              </h3>
              <p className="text-xs text-[var(--lms-text-muted)]">
                Select one or multiple chats
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isForwarding}
            className="p-1.5 rounded-xl text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-subtle)] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Preview */}
        <div className="px-4 sm:px-5 pt-3 pb-2 shrink-0 border-b border-[var(--lms-border)]/50 bg-[var(--lms-surface-elevated)]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">
              Message Preview
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-cyan-600 dark:text-cyan-400">
              <Sparkles size={11} /> Will show as "Forwarded"
            </span>
          </div>
          {renderMessagePreview()}
        </div>

        {/* Search & Tabs */}
        <div className="px-4 sm:px-5 pt-3 pb-2 shrink-0 space-y-2.5">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--lms-text-muted)] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search course groups or contacts..."
              className="w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm bg-[var(--lms-surface)] border border-[var(--lms-border)] text-[var(--lms-text-primary)] placeholder-[var(--lms-text-muted)] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] p-0.5 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-[var(--lms-surface)] text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]'
              }`}
            >
              All ({filteredDiscussions.length + filteredDirectChats.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('groups')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'groups'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-[var(--lms-surface)] text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]'
              }`}
            >
              <Users size={12} />
              Course Groups ({filteredDiscussions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('direct')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'direct'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-[var(--lms-surface)] text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]'
              }`}
            >
              <MessageSquare size={12} />
              Direct Chats ({filteredDirectChats.length})
            </button>
          </div>
        </div>

        {/* Recipient Selection List */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-2 space-y-4">
          {/* Course Groups */}
          {(activeTab === 'all' || activeTab === 'groups') && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider px-1">
                Course Groups ({filteredDiscussions.length})
              </div>
              {filteredDiscussions.length === 0 ? (
                <div className="p-3 text-center text-xs text-[var(--lms-text-muted)] bg-[var(--lms-surface)] rounded-xl border border-[var(--lms-border)]">
                  No course groups match your search
                </div>
              ) : (
                filteredDiscussions.map((disc) => {
                  if (!disc?._id) return null;
                  const isSelected = selectedDiscussions.includes(disc._id);
                  const title = disc.courseId?.title || 'Course Discussion';
                  const thumbnail = disc.courseId?.thumbnail;
                  const memberCount = disc.memberCount || 0;
                  const category = disc.courseId?.category || '';

                  return (
                    <div
                      key={disc._id}
                      onClick={() => toggleDiscussion(disc._id)}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500/50 shadow-sm'
                          : 'bg-[var(--lms-surface)] border-[var(--lms-border)] hover:bg-[var(--lms-surface-subtle)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-cyan-500/20 bg-slate-800 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Users size={16} className="text-cyan-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-[var(--lms-text-primary)] truncate">
                            {title}
                          </h4>
                          <span className="text-[11px] text-[var(--lms-text-muted)] truncate block">
                            {memberCount} member{memberCount === 1 ? '' : 's'}
                            {category ? ` • ${category}` : ''}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ml-3 ${
                          isSelected
                            ? 'bg-cyan-600 border-cyan-600 text-white'
                            : 'border-[var(--lms-border)] bg-[var(--lms-surface-subtle)]'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Direct Chats */}
          {(activeTab === 'all' || activeTab === 'direct') && (
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider px-1">
                Direct Chats ({filteredDirectChats.length})
              </div>
              {filteredDirectChats.length === 0 ? (
                <div className="p-3 text-center text-xs text-[var(--lms-text-muted)] bg-[var(--lms-surface)] rounded-xl border border-[var(--lms-border)]">
                  No direct chat contacts match your search
                </div>
              ) : (
                filteredDirectChats.map((conv) => {
                  if (!conv?._id) return null;
                  const isSelected = selectedDirectChats.includes(conv._id);
                  const other = conv.otherParticipant || {};
                  const name = other.name || 'Direct Contact';
                  const role = other.role || 'Student';

                  return (
                    <div
                      key={conv._id}
                      onClick={() => toggleDirectChat(conv._id)}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500/50 shadow-sm'
                          : 'bg-[var(--lms-surface)] border-[var(--lms-border)] hover:bg-[var(--lms-surface-subtle)]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-white text-xs font-bold border border-cyan-500/20 shadow-sm ${
                            other.profileImage ? 'bg-slate-700' : getAvatarBg(name)
                          }`}
                        >
                          {other.profileImage ? (
                            <img
                              src={other.profileImage}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getInitials(name)
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs sm:text-sm font-bold text-[var(--lms-text-primary)] truncate">
                              {name}
                            </h4>
                            {renderRoleBadge(role)}
                          </div>
                          <span className="text-[11px] text-[var(--lms-text-muted)] truncate block">
                            {other.email || 'Private direct conversation'}
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all shrink-0 ml-3 ${
                          isSelected
                            ? 'bg-cyan-600 border-cyan-600 text-white'
                            : 'border-[var(--lms-border)] bg-[var(--lms-surface-subtle)]'
                        }`}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--lms-border)] bg-[var(--lms-surface)] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--lms-text-primary)]">
              {totalSelected} selected
            </span>
            {totalSelected > 0 && (
              <button
                type="button"
                onClick={handleClearSelection}
                disabled={isForwarding}
                className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-semibold cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isForwarding}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleForward}
              disabled={totalSelected === 0 || isForwarding}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white shadow-md shadow-cyan-600/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isForwarding ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Forwarding...
                </>
              ) : (
                <>
                  <Forward size={15} />
                  Forward ({totalSelected})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForwardMessageModal;
