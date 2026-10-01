import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { stickerPacks } from '../../utils/stickers';

const StickerPicker = ({ onSelectSticker, onClose }) => {
  const [activePackId, setActivePackId] = useState(stickerPacks[0].id);

  const activePack = stickerPacks.find((p) => p.id === activePackId) || stickerPacks[0];

  return (
    <div className="w-80 max-h-80 flex flex-col rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] shadow-2xl overflow-hidden animate-scale-in">
      <div className="px-3.5 py-2.5 border-b border-[var(--lms-border)] bg-[var(--lms-surface)] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--lms-text-primary)]">
          <Sparkles size={14} className="text-cyan-500" />
          <span>Course Stickers</span>
        </div>
        <button
          onClick={onClose}
          className="text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] p-0.5 rounded-lg transition-colors"
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] overflow-x-auto">
        {stickerPacks.map((pack) => (
          <button
            key={pack.id}
            type="button"
            onClick={() => setActivePackId(pack.id)}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 transition-all ${
              activePackId === pack.id
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)]'
            }`}
          >
            <span>{pack.icon}</span>
            <span>{pack.name}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-3 gap-2.5">
          {activePack.stickers.map((sticker) => (
            <button
              key={sticker.id}
              type="button"
              onClick={() => onSelectSticker(sticker)}
              className={`group relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br ${sticker.bg} text-white shadow-md hover:scale-105 active:scale-95 transition-all duration-200 aspect-square`}
            >
              <span className="text-3xl filter drop-shadow group-hover:scale-110 transition-transform">
                {sticker.emoji}
              </span>
              <span className="text-[10px] font-bold mt-1 text-center truncate w-full filter drop-shadow">
                {sticker.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StickerPicker;
