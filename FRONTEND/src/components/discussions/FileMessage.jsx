import React from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  File as GenericFileIcon,
} from 'lucide-react';

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImageFile = (mimeType, fileName = '') => {
  if (mimeType && mimeType.startsWith('image/')) return true;
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(fileName);
};

const FileMessage = ({ fileUrl, fileName, fileSize, fileMimeType, isOwn }) => {
  const isImg = isImageFile(fileMimeType, fileName);

  if (isImg) {
    return (
      <div className="space-y-2 max-w-sm">
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl overflow-hidden group relative border border-black/10 dark:border-white/10 shadow-sm"
        >
          <img
            src={fileUrl}
            alt={fileName || 'Shared image'}
            className="w-full max-h-72 object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            <ExternalLink size={20} />
          </div>
        </a>
        {fileName && (
          <div className="flex items-center justify-between text-[11px] opacity-80 px-1">
            <span className="truncate max-w-[200px]">{fileName}</span>
            {fileSize > 0 && <span>{formatFileSize(fileSize)}</span>}
          </div>
        )}
      </div>
    );
  }

  const getFileIcon = () => {
    if (fileName?.endsWith('.zip') || fileName?.endsWith('.rar')) {
      return <FileArchive size={24} className="text-purple-500" />;
    }
    if (fileName?.match(/\.(xls|xlsx|csv)$/)) {
      return <FileSpreadsheet size={24} className="text-emerald-500" />;
    }
    if (fileName?.match(/\.(js|jsx|ts|tsx|html|css|json|py)$/)) {
      return <FileCode size={24} className="text-blue-500" />;
    }
    return <FileText size={24} className="text-cyan-500" />;
  };

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        isOwn
          ? 'bg-white/10 border-white/20 text-white'
          : 'bg-[var(--lms-surface-subtle)] border-[var(--lms-border)] text-[var(--lms-text-primary)]'
      }`}
    >
      <div className="p-2.5 rounded-xl bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] shadow-sm shrink-0">
        {getFileIcon()}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold truncate">{fileName || 'Attachment'}</p>
        <p className="text-[10px] opacity-75">{formatFileSize(fileSize)}</p>
      </div>

      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        download={fileName}
        className="p-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white shadow-sm transition-colors shrink-0"
        title="Download / Open file"
      >
        <Download size={15} />
      </a>
    </div>
  );
};

export default FileMessage;
