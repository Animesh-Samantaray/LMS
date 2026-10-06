import React, { useState } from 'react';
import { X, Image as ImageIcon, FileText, Download, Play } from 'lucide-react';

const formatBytes = (bytes) => {
  if (bytes === 0 || !bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const SharedMediaPanel = ({ isOpen, onClose, messages }) => {
  const [activeTab, setActiveTab] = useState('media');
  const [previewImage, setPreviewImage] = useState(null);

  if (!isOpen) return null;

  const mediaMessages = messages.filter(
    (m) =>
      m.fileUrl &&
      m.type === 'file' &&
      (m.fileMimeType?.startsWith('image/') || m.fileMimeType?.startsWith('video/'))
  );

  const fileMessages = messages.filter(
    (m) =>
      m.fileUrl &&
      m.type === 'file' &&
      !m.fileMimeType?.startsWith('image/') &&
      !m.fileMimeType?.startsWith('video/')
  );

  return (
    <>
      <div className="w-full sm:w-80 h-full bg-[var(--lms-surface)] border-l border-[var(--lms-border)] flex flex-col z-30 shrink-0 shadow-xl absolute sm:relative right-0 top-0">
        <div className="h-16 px-4 flex items-center justify-between border-b border-[var(--lms-border)] shrink-0 bg-[var(--lms-surface-elevated)]">
          <h3 className="font-bold text-[var(--lms-text-primary)]">Media, Links & Files</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)] hover:text-[var(--lms-text-primary)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex p-2 gap-1 border-b border-[var(--lms-border)] shrink-0 bg-[var(--lms-surface)]">
          <button
            onClick={() => setActiveTab('media')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'media'
                ? 'bg-[var(--lms-accent)] text-white'
                : 'text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)]'
            }`}
          >
            Media ({mediaMessages.length})
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'files'
                ? 'bg-[var(--lms-accent)] text-white'
                : 'text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)]'
            }`}
          >
            Files ({fileMessages.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 lms-scrollbar">
          {activeTab === 'media' && (
            <div className="grid grid-cols-3 gap-2">
              {mediaMessages.length === 0 ? (
                <div className="col-span-3 text-center py-10 text-[var(--lms-text-muted)]">
                  <ImageIcon size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-medium">No media shared yet.</p>
                </div>
              ) : (
                mediaMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className="aspect-square bg-[var(--lms-surface-subtle)] rounded-lg overflow-hidden relative group cursor-pointer border border-[var(--lms-border)]"
                    onClick={() => {
                      if (msg.fileMimeType?.startsWith('image/')) {
                        setPreviewImage(msg.fileUrl);
                      }
                    }}
                  >
                    {msg.fileMimeType?.startsWith('video/') ? (
                      <>
                        <video src={msg.fileUrl} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Play size={20} className="text-white opacity-80" />
                        </div>
                      </>
                    ) : (
                      <img
                        src={msg.fileUrl}
                        alt="Media"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="space-y-3">
              {fileMessages.length === 0 ? (
                <div className="text-center py-10 text-[var(--lms-text-muted)]">
                  <FileText size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-medium">No files shared yet.</p>
                </div>
              ) : (
                fileMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] hover:border-[var(--lms-accent)]/30 transition-colors"
                  >
                    <div className="w-10 h-10 shrink-0 rounded-lg bg-[var(--lms-accent)]/10 text-[var(--lms-accent)] flex items-center justify-center">
                      <FileText size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[var(--lms-text-primary)] truncate">
                        {msg.fileName || 'Document'}
                      </p>
                      <p className="text-[10px] text-[var(--lms-text-muted)] mt-0.5 uppercase tracking-wider">
                        {msg.fileMimeType?.split('/')[1] || 'FILE'} • {formatBytes(msg.fileSize)}
                      </p>
                      {msg.senderId?.name && (
                        <p className="text-[10px] text-[var(--lms-text-secondary)] mt-1 truncate">
                          Sent by {msg.senderId.name}
                        </p>
                      )}
                    </div>
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-[var(--lms-text-secondary)] hover:text-[var(--lms-accent)] transition-colors rounded-lg hover:bg-[var(--lms-surface)] shrink-0"
                    >
                      <Download size={14} />
                    </a>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-xl transition-all"
          >
            <X size={24} />
          </button>
          <img
            src={previewImage}
            alt="Preview"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}
    </>
  );
};

export default SharedMediaPanel;
