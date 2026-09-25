import React, { useState, useEffect } from 'react';
import { X, Upload, FileText, AlertCircle, Loader } from 'lucide-react';

const AssignmentModal = ({
  isOpen,
  isEdit = false,
  assignment = null,
  onClose,
  onSubmit,
  loading = false,
  error = '',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maximumMarks, setMaximumMarks] = useState(100);
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('draft');
  const [questionFile, setQuestionFile] = useState(null);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (assignment && isEdit) {
      setTitle(assignment.title || '');
      setDescription(assignment.description || '');
      setMaximumMarks(assignment.maximumMarks || 100);
      setStatus(assignment.status || 'draft');
      if (assignment.deadline) {
        const d = new Date(assignment.deadline);
        if (!isNaN(d.getTime())) {
          const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
          setDeadline(iso);
        } else {
          setDeadline('');
        }
      } else {
        setDeadline('');
      }
      setQuestionFile(null);
    } else {
      setTitle('');
      setDescription('');
      setMaximumMarks(100);
      setStatus('draft');
      setDeadline('');
      setQuestionFile(null);
    }
    setValidationError('');
  }, [assignment, isEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setValidationError('');
    if (!file) {
      setQuestionFile(null);
      return;
    }
    const maxSizeBytes = 100 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setValidationError('File size must not exceed 100 MB.');
      setQuestionFile(null);
      e.target.value = '';
      return;
    }
    setQuestionFile(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!title.trim()) {
      setValidationError('Assignment title is required.');
      return;
    }

    const marksNum = Number(maximumMarks);
    if (isNaN(marksNum) || marksNum < 1) {
      setValidationError('Maximum marks must be at least 1.');
      return;
    }

    if (!deadline) {
      setValidationError('Deadline is required.');
      return;
    }

    const deadlineDate = new Date(deadline);
    if (isNaN(deadlineDate.getTime())) {
      setValidationError('Please enter a valid deadline.');
      return;
    }

    if (deadlineDate <= new Date()) {
      setValidationError('Assignment deadline must be in the future.');
      return;
    }

    if (!isEdit && !questionFile) {
      setValidationError('Please upload a question file.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('maximumMarks', marksNum.toString());
    formData.append('deadline', deadlineDate.toISOString());
    formData.append('status', status);

    if (questionFile) {
      formData.append('questionFile', questionFile);
    }

    onSubmit(formData);
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-[var(--lms-surface-elevated)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--lms-border)] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
              {isEdit ? 'Edit Assignment' : 'Create Assignment'}
            </h3>
            <p className="text-[11px] text-[var(--lms-text-muted)]">
              Upload the file containing the assignment questions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-bold text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {(validationError || error) && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-500 font-medium">
              <AlertCircle size={14} className="shrink-0" />
              <span>{validationError || error}</span>
            </div>
          )}

          <form id="assignment-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                Assignment Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)]"
                placeholder="e.g. Midterm Project: REST API Design"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                Description / Instructions
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)] resize-none"
                placeholder="Brief instructions or notes for the assignment..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                  Maximum Marks <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={maximumMarks}
                  onChange={(e) => setMaximumMarks(e.target.value)}
                  className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)]"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                Deadline <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                Question File {!isEdit && <span className="text-rose-500">*</span>}
              </label>

              {isEdit && assignment?.questionFile?.originalName && !questionFile && (
                <div className="mb-2 p-3 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText size={16} className="text-emerald-500 shrink-0" />
                    <div className="truncate">
                      <span className="font-semibold text-[var(--lms-text-primary)] block truncate">
                        Current: {assignment.questionFile.originalName}
                      </span>
                      {assignment.questionFile.fileSize ? (
                        <span className="text-[10px] text-[var(--lms-text-muted)]">
                          {formatFileSize(assignment.questionFile.fileSize)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-[var(--lms-text-muted)] shrink-0">
                    Keep or replace below
                  </span>
                </div>
              )}

              <div className="relative border-2 border-dashed border-[var(--lms-border)] hover:border-[var(--lms-accent)] rounded-2xl p-5 transition-colors text-center bg-[var(--lms-bg)]">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpeg,.jpg,.png"
                />
                <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                  <div className="w-10 h-10 rounded-full bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] flex items-center justify-center">
                    <Upload size={18} />
                  </div>
                  <p className="text-xs font-bold text-[var(--lms-text-primary)]">
                    {questionFile ? questionFile.name : 'Upload the file containing the assignment questions.'}
                  </p>
                  <p className="text-[10px] text-[var(--lms-text-muted)]">
                    {questionFile
                      ? `File size: ${formatFileSize(questionFile.size)}`
                      : 'PDF, Word, Excel, PowerPoint, Text, ZIP up to 100 MB'}
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 border-t border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold border border-[var(--lms-border)] text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="assignment-form"
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--lms-accent)] text-white hover:opacity-90 flex items-center justify-center shadow-sm transition-opacity"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <Loader size={14} className="animate-spin" />
                {isEdit ? 'Saving...' : 'Creating...'}
              </span>
            ) : isEdit ? (
              'Save Changes'
            ) : (
              'Create Assignment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentModal;
