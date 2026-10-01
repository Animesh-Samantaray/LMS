import React, { useRef } from 'react';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  Paperclip,
  X,
  FileArchive,
} from 'lucide-react';

const AttachmentMenu = ({ onSelectFile, onClose }) => {
  const fileInputRef = useRef(null);

  const handleTriggerInput = (acceptTypes) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = acceptTypes;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelectFile(file);
      onClose();
    }
  };

  const options = [
    {
      label: 'Photos & Images',
      icon: ImageIcon,
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      accept: 'image/png,image/jpeg,image/jpg,image/webp,image/gif',
    },
    {
      label: 'Document (PDF, Word)',
      icon: FileText,
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      accept: '.pdf,.doc,.docx,.txt',
    },
    {
      label: 'Spreadsheet & Slides',
      icon: FileSpreadsheet,
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      accept: '.xls,.xlsx,.ppt,.pptx,.csv',
    },
    {
      label: 'Archive (ZIP)',
      icon: FileArchive,
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      accept: '.zip,.rar,.tar',
    },
  ];

  return (
    <div className="w-64 rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] shadow-2xl p-2 animate-scale-in">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] flex items-center justify-between">
        <span>Share Learning File</span>
        <button
          onClick={onClose}
          className="text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)]"
        >
          <X size={13} />
        </button>
      </div>

      <div className="space-y-1">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => handleTriggerInput(opt.accept)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-subtle)] transition-colors text-left"
            >
              <div className={`p-2 rounded-xl border ${opt.color}`}>
                <Icon size={16} />
              </div>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AttachmentMenu;
