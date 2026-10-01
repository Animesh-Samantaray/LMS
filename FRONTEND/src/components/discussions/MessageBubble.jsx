import React from 'react';
import { findStickerById } from '../../utils/stickers';
import FileMessage from './FileMessage';
import { Reply } from 'lucide-react';

const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const MessageBubble = ({ message, isOwn, showSenderInfo, onReply }) => {
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
      className={`flex items-end gap-2 group mb-2.5 ${
        isOwn ? 'justify-end' : 'justify-start'
      }`}
    >
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

      <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center mb-1 ${isOwn ? 'mr-2 order-first' : 'ml-2 order-last'}`}>
        <button 
          onClick={onReply}
          className="p-1.5 rounded-full hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-muted)] hover:text-cyan-600 transition-colors"
          title="Reply"
        >
          <Reply size={14} />
        </button>
      </div>
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
                    {message.parentMessageId && (
            <div 
              onClick={() => scrollToMessage(message.parentMessageId._id)}
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
