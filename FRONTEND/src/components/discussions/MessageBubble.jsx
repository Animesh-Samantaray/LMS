import React from 'react';
import { findStickerById } from '../../utils/stickers';
import FileMessage from './FileMessage';
import { Reply, MoreVertical, CornerUpLeft, CheckSquare, Trash2, SmilePlus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MessageBubble = ({ message, isOwn, showSenderInfo, onReply, onReact, onDelete, onSelect, selectionMode = false, selected = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showExpandedEmojis, setShowExpandedEmojis] = useState(false);
  const menuRef = useRef(null);
  const emojiGridRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
      if (emojiGridRef.current && !emojiGridRef.current.contains(e.target)) {
        setShowExpandedEmojis(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const sender = message.senderId || {};
  const isSticker = message.type === 'sticker';
  const isFile = message.type === 'file';

  const scrollToMessage = (msgId) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-cyan-500/20', 'transition-colors', 'duration-500');
      setTimeout(() => {
        el.classList.remove('bg-cyan-500/20');
      }, 2000);
    }
  };

  const renderContent = () => {
    if (isSticker) {
      const sticker = findStickerById(message.stickerId);
      if (sticker) {
        return (
          <div className="flex flex-col items-center p-2">
            <div
              className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${sticker.bg} flex flex-col items-center justify-center p-3 text-white shadow-lg shadow-cyan-900/20`}
            >
              <span className="text-4xl filter drop-shadow animate-bounce">
                {sticker.emoji}
              </span>
              <span className="text-[11px] font-bold mt-1 text-center truncate w-full filter drop-shadow">
                {sticker.label}
              </span>
            </div>
          </div>
        );
      }
      return (
        <span className="text-2xl select-none">
          {message.content || '🎨 [Sticker]'}
        </span>
      );
    }

    if (isFile) {
      return (
        <div className="space-y-1.5">
          <FileMessage
            fileUrl={message.fileUrl}
            fileName={message.fileName}
            fileSize={message.fileSize}
            fileMimeType={message.fileMimeType}
            isOwn={isOwn}
          />
          {message.content && (
            <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed pt-1">
              {message.content}
            </p>
          )}
        </div>
      );
    }

    return (
      <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
        {message.content}
      </p>
    );
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : 'U';
  };

  return (
    <div
      id={`msg-${message._id}`}
      onClick={selectionMode ? () => onSelect?.(message._id) : undefined}
      className={`flex items-end gap-2 group mb-2.5 ${selectionMode ? 'cursor-pointer' : ''} ${
        isOwn ? 'justify-end' : 'justify-start'
      }`}
    >
      {selectionMode && <input type="checkbox" checked={selected} onChange={() => onSelect?.(message._id)} onClick={(event) => event.stopPropagation()} aria-label="Select message" className="mb-2 accent-cyan-600" />}
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-cyan-600/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden mb-1">
          {sender.profileImage ? (
            <img
              src={sender.profileImage}
              alt={sender.name || 'User'}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(sender.name)
          )}
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-[70%] md:max-w-[60%] flex flex-col ${
          isOwn ? 'items-end' : 'items-start'
        }`}
      >
        {!isOwn && showSenderInfo && (
          <div className="flex items-center gap-2 px-1 mb-1">
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
              {sender.name || 'User'}
            </span>
            {sender.role && sender.role !== 'Student' && (
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 uppercase tracking-wider">
                {sender.role}
              </span>
            )}
          </div>
        )}


        <div
          className={`relative p-3 rounded-2xl shadow-sm transition-all ${
            isOwn
              ? isSticker
                ? 'bg-transparent shadow-none p-1'
                : 'bg-gradient-to-r from-cyan-600 to-teal-700 text-white rounded-br-xs border border-cyan-500/30 shadow-cyan-900/10'
              : isSticker
              ? 'bg-transparent shadow-none p-1'
              : 'bg-[var(--lms-surface-elevated)] text-[var(--lms-text-primary)] rounded-bl-xs border border-[var(--lms-border)]'
          }`}
        >
          <div className={`${selectionMode ? 'hidden' : 'opacity-0 group-hover:opacity-100'} transition-opacity absolute -top-4 ${isOwn ? 'right-0' : 'left-0'} z-50 flex items-center`}>
            <div className="flex items-center bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-full px-2 py-1 shadow-md gap-1 relative">
              <button onClick={() => { onReact && onReact('👍'); setShowMenu(false); }} className="p-1 hover:bg-[var(--lms-surface-subtle)] rounded-full transition-colors text-base leading-none">👍</button>
              <button onClick={() => { onReact && onReact('❤️'); setShowMenu(false); }} className="p-1 hover:bg-[var(--lms-surface-subtle)] rounded-full transition-colors text-base leading-none">❤️</button>
              <button onClick={() => { onReact && onReact('😂'); setShowMenu(false); }} className="p-1 hover:bg-[var(--lms-surface-subtle)] rounded-full transition-colors text-base leading-none">😂</button>
              <button onClick={() => setShowExpandedEmojis(!showExpandedEmojis)} className="p-1 hover:bg-[var(--lms-surface-subtle)] rounded-full transition-colors text-[var(--lms-text-muted)] hover:text-cyan-600"><SmilePlus size={16} /></button>
              
              {showExpandedEmojis && (
                <div ref={emojiGridRef} className={`absolute top-full mt-2 ${isOwn ? 'right-0' : 'left-0'} p-2 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl shadow-xl z-50 grid grid-cols-5 gap-1 w-max`}>
                  {['👍','❤️','😂','😮','😢','🎉','🔥','👏','🙌','💯','🙏','🤩','🚀','🤔','😎'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => { onReact && onReact(emoji); setShowExpandedEmojis(false); }}
                      className="p-1.5 hover:bg-[var(--lms-surface-subtle)] rounded-lg transition-colors text-xl leading-none"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <div className="w-px h-4 bg-[var(--lms-border)] mx-1"></div>
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full hover:bg-[var(--lms-surface-subtle)] text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] transition-colors"
              >
                <MoreVertical size={16} />
              </button>
            </div>
            
            {showMenu && (
              <div 
                ref={menuRef}
                onMouseDown={(event) => event.stopPropagation()}
                className={`absolute top-full mt-2 ${isOwn ? 'right-0' : 'left-0'} w-48 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl shadow-xl py-2 z-50`}
              >
                <button 
                  onClick={() => { setShowMenu(false); onReply && onReply(); }}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)] hover:text-[var(--lms-text-primary)] flex items-center gap-3 transition-colors"
                >
                  <CornerUpLeft size={16} /> Quote in reply
                </button>
                <button 
                  onClick={() => { setShowMenu(false); onSelect?.(message._id, true); }}
                  className="w-full text-left px-4 py-2 text-sm text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)] hover:text-[var(--lms-text-primary)] flex items-center gap-3 transition-colors"
                >
                  <CheckSquare size={16} /> Select multiple
                </button>
                {isOwn && (
                  <button 
                    onClick={() => { setShowMenu(false); onDelete && onDelete(); }}
                    className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-500/10 flex items-center gap-3 transition-colors"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </div>
            )}
          </div>

                    {message.parentMessageId && (
            <div 
              onClick={() => scrollToMessage(message.parentMessageId._id || message.parentMessageId)}
              className={`mb-2 p-2 rounded-lg border-l-4 cursor-pointer hover:opacity-90 transition-opacity ${
                isOwn ? 'bg-black/10 border-white/50 text-white/90' : 'bg-black/5 dark:bg-white/5 border-cyan-500 text-[var(--lms-text-secondary)]'
              }`}
            >
              <div className="flex items-center gap-1 mb-1">
                <span className="text-[10px] font-bold">{message.parentMessageId.senderId?.name || 'User'}</span>
              </div>
              <div className="text-[11px] line-clamp-1 opacity-90 italic">
                {message.parentMessageId.type === 'text' ? message.parentMessageId.content : message.parentMessageId.type === 'file' ? `📄 ${message.parentMessageId.fileName}` : '✨ Sticker'}
              </div>
            </div>
          )}

          {renderContent()}

          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-2 -mb-5 relative z-10 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              {Array.from(new Set(message.reactions.map(r => r.emoji))).map(emoji => (
                <button
                  key={emoji}
                  onClick={() => onReact && onReact(emoji)}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs border bg-[var(--lms-surface)] text-[var(--lms-text-primary)] border-[var(--lms-border)] shadow-sm hover:bg-[var(--lms-surface-subtle)] transition-colors`}
                >
                  <span>{emoji}</span>
                  <span className="text-[10px] opacity-70">
                    {message.reactions.filter(r => r.emoji === emoji).length}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div
            className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${
              isOwn ? 'text-white/80' : 'text-[var(--lms-text-muted)]'
            }`}
          >
            <span>{formatTime(message.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
