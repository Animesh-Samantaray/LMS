import React, { useState, useRef, useEffect } from 'react';
import {
  Smile,
  Paperclip,
  Send,
  Sparkles,
  Loader,
  X,
  FileText,
} from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import StickerPicker from './StickerPicker';
import AttachmentMenu from './AttachmentMenu';

const MessageComposer = ({
  onSendMessage,
  onSendSticker,
  onSendFile,
  sending,
  uploading,
}) => {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showSticker, setShowSticker] = useState(false);
  const [showAttachment, setShowAttachment] = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const emojiRef = useRef(null);
  const stickerRef = useRef(null);
  const attachRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
      if (stickerRef.current && !stickerRef.current.contains(e.target)) {
        setShowSticker(false);
      }
      if (attachRef.current && !attachRef.current.contains(e.target)) {
        setShowAttachment(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowEmoji(false);
        setShowSticker(false);
        setShowAttachment(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSend = async (e) => {
    e?.preventDefault();

    if (pendingFile) {
      await onSendFile(pendingFile, text.trim());
      setPendingFile(null);
      setText('');
      return;
    }

    if (!text.trim() || sending) return;
    const msgToSend = text;
    setText('');
    await onSendMessage(msgToSend);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDownInput = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSelectSticker = async (sticker) => {
    setShowSticker(false);
    await onSendSticker(sticker);
  };

  const handleSelectFile = (file) => {
    setPendingFile(file);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="p-3 sm:p-4 border-t border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] relative z-20">
      {pendingFile && (
        <div className="mb-3 p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-cyan-500 text-white shadow-sm">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[var(--lms-text-primary)] truncate">
                {pendingFile.name}
              </p>
              <p className="text-[10px] text-[var(--lms-text-muted)]">
                {(pendingFile.size / 1024).toFixed(1)} KB • Ready to send
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPendingFile(null)}
            className="p-1 rounded-lg text-[var(--lms-text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <form onSubmit={handleSend} className="flex items-end gap-2 relative">
        <div className="flex items-center gap-1 shrink-0 pb-1">
          <div className="relative" ref={emojiRef}>
            <button
              type="button"
              onClick={() => {
                setShowEmoji(!showEmoji);
                setShowSticker(false);
                setShowAttachment(false);
              }}
              className={`p-2 rounded-xl border transition-colors ${
                showEmoji
                  ? 'bg-cyan-600 text-white border-cyan-600'
                  : 'border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface)]'
              }`}
              title="Add Emoji"
            >
              <Smile size={18} />
            </button>

            {showEmoji && (
              <div className="absolute bottom-12 left-0 z-50">
                <EmojiPicker
                  onSelectEmoji={handleSelectEmoji}
                  onClose={() => setShowEmoji(false)}
                />
              </div>
            )}
          </div>

          <div className="relative" ref={stickerRef}>
            <button
              type="button"
              onClick={() => {
                setShowSticker(!showSticker);
                setShowEmoji(false);
                setShowAttachment(false);
              }}
              className={`p-2 rounded-xl border transition-colors ${
                showSticker
                  ? 'bg-cyan-600 text-white border-cyan-600'
                  : 'border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface)]'
              }`}
              title="Course Stickers"
            >
              <Sparkles size={18} />
            </button>

            {showSticker && (
              <div className="absolute bottom-12 left-0 z-50">
                <StickerPicker
                  onSelectSticker={handleSelectSticker}
                  onClose={() => setShowSticker(false)}
                />
              </div>
            )}
          </div>

          <div className="relative" ref={attachRef}>
            <button
              type="button"
              onClick={() => {
                setShowAttachment(!showAttachment);
                setShowEmoji(false);
                setShowSticker(false);
              }}
              className={`p-2 rounded-xl border transition-colors ${
                showAttachment
                  ? 'bg-cyan-600 text-white border-cyan-600'
                  : 'border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface)]'
              }`}
              title="Attach File"
            >
              <Paperclip size={18} />
            </button>

            {showAttachment && (
              <div className="absolute bottom-12 left-0 z-50">
                <AttachmentMenu
                  onSelectFile={handleSelectFile}
                  onClose={() => setShowAttachment(false)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 rounded-2xl transition-all p-1.5 flex items-end">
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDownInput}
            placeholder={
              pendingFile
                ? 'Add an optional caption...'
                : 'Type a message (Enter to send, Shift+Enter for newline)...'
            }
            className="w-full max-h-32 px-2.5 py-1 text-xs sm:text-sm bg-transparent text-[var(--lms-text-primary)] placeholder:text-[var(--lms-text-muted)] focus:outline-none resize-none"
            style={{ minHeight: '26px' }}
          />
        </div>

        <button
          type="submit"
          disabled={(!text.trim() && !pendingFile) || sending || uploading}
          className="p-2.5 sm:px-4 sm:py-2.5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/25 transition-all shrink-0 active:scale-95"
          title="Send message"
        >
          {sending || uploading ? (
            <Loader size={17} className="animate-spin" />
          ) : (
            <>
              <Send size={16} />
              <span className="hidden sm:inline">Send</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageComposer;
