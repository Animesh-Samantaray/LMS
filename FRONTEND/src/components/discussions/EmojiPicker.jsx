import React from 'react';
import { X } from 'lucide-react';

const emojiCategories = [
  {
    name: 'Frequent & Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋', '😎', '🤓', '🧐', '🤩', '🥳', '😏', '🤔', '🤫', '🫡', '🤝', '🙌', '👏', '🔥', '✨'],
  },
  {
    name: 'Gestures & Learning',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '💪', '🙏', '💡', '📚', '📖', '📝', '✏️', '🎓', '🏆', '🎯', '💯', '🚀', '💻', '🖥️', '📊', '📈', '📌', '🧠', '⭐', '🌟', '🎉', '🎊', '☕', '⚡', '❤️'],
  },
  {
    name: 'Symbols & Moods',
    emojis: ['✅', '❌', '❓', '❗', '💬', '💭', '🔔', '📣', '🕒', '⏳', '🔑', '🔒', '🛠️', '⚙️', '🔍', '💡', '🌈', '☀️', '☕', '🥪', '🍎', '🧩', '🎨', '🎵', '🕹️', '🛡️', '🏷️', '📢', '🌐', '🚀'],
  },
];

const EmojiPicker = ({ onSelectEmoji, onClose }) => {
  return (
    <div className="w-80 max-h-72 flex flex-col rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] shadow-2xl overflow-hidden animate-scale-in">
      <div className="px-3.5 py-2.5 border-b border-[var(--lms-border)] bg-[var(--lms-surface)] flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--lms-text-primary)]">
          Select Emoji
        </span>
        <button
          onClick={onClose}
          className="text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] p-0.5 rounded-lg transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {emojiCategories.map((cat) => (
          <div key={cat.name}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] mb-1.5">
              {cat.name}
            </p>
            <div className="grid grid-cols-6 gap-1.5">
              {cat.emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => onSelectEmoji(emoji)}
                  className="w-10 h-10 rounded-xl hover:bg-[var(--lms-surface-subtle)] hover:scale-110 flex items-center justify-center text-xl transition-all select-none"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
