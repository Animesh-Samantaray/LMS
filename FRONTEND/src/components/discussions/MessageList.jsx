import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, ArrowDown, Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';

const formatDateSeparator = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Yesterday';

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

const MessageList = ({ messages = [], currentUserId, loading, theme = 'dark', onReply }) => {
  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    const nearBottom = distanceToBottom < 100;
    setIsNearBottom(nearBottom);
    setShowScrollBottom(distanceToBottom > 200);
  };

  useEffect(() => {
    if (isNearBottom) {
      scrollToBottom(false);
    }
  }, [messages, isNearBottom]);

  const wallpaperUrl = theme === 'dark' ? '/chat-bg-dark.png' : '/chat-bg-light.png';

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto p-4 sm:p-6 relative bg-no-repeat bg-center bg-cover"
      style={{
        backgroundImage: `url(${wallpaperUrl})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}
    >
      <div className="min-h-full flex flex-col justify-end">
        {loading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="px-4 py-2 rounded-2xl bg-[var(--lms-surface)] border border-[var(--lms-border)] shadow-md text-xs font-semibold text-[var(--lms-text-muted)] flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
              Loading discussion messages...
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-3xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/10">
              <Sparkles size={28} />
            </div>
            <h4 className="text-base font-bold text-[var(--lms-text-primary)] mb-1">
              Start the conversation
            </h4>
            <p className="text-xs sm:text-sm text-[var(--lms-text-muted)] max-w-sm">
              Ask questions, collaborate on course projects, and share study insights with mentors and fellow learners!
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((msg, index) => {
              const msgSenderId = msg.senderId?._id || msg.senderId;
              const isOwn =
                msgSenderId &&
                currentUserId &&
                msgSenderId.toString() === currentUserId.toString();

              const prevMsg = messages[index - 1];
              const prevDate = prevMsg ? new Date(prevMsg.createdAt).toDateString() : null;
              const currDate = new Date(msg.createdAt).toDateString();
              const showDateSeparator = !prevMsg || prevDate !== currDate;

              const prevSenderId = prevMsg ? (prevMsg.senderId?._id || prevMsg.senderId)?.toString() : null;
              const showSenderInfo = !isOwn && (!prevMsg || prevSenderId !== msgSenderId?.toString() || showDateSeparator);

              return (
                <React.Fragment key={msg._id || index}>
                  {showDateSeparator && (
                    <div className="flex items-center justify-center my-4 select-none">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[var(--lms-surface-elevated)]/90 text-[var(--lms-text-secondary)] border border-[var(--lms-border)] shadow-sm backdrop-blur-md">
                        {formatDateSeparator(msg.createdAt)}
                      </span>
                    </div>
                  )}

                  <MessageBubble
                    message={msg}
                    isOwn={isOwn}
                    showSenderInfo={showSenderInfo}
                    onReply={() => onReply(msg)}
                  />
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="sticky bottom-4 float-right p-2.5 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30 transition-all hover:scale-105 active:scale-95 z-30"
          title="Scroll to latest messages"
        >
          <ArrowDown size={16} />
        </button>
      )}
    </div>
  );
};

export default MessageList;
