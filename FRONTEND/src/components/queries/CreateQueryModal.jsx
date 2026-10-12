import React, { useState } from 'react';
import { Send, AlertCircle, X, Sparkles } from 'lucide-react';
import courseQueryService from '../../services/courseQuery.service';

const CreateQueryModal = ({ isOpen, onClose, courseId, courseTitle, onCreated }) => {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Please provide both a subject and a detailed question.');
      return;
    }
    try {
      setSubmitting(true);
      setError('');
      const res = await courseQueryService.createQuery({
        courseId,
        subject: subject.trim(),
        description: description.trim(),
      });
      if (res?.success) {
        setSubject('');
        setDescription('');
        if (onCreated) onCreated(res.data);
        onClose();
      } else {
        setError(res?.message || 'Failed to submit query.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to submit question.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl rounded-3xl bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 border-b border-[var(--lms-border)] flex items-center justify-between bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles size={11} /> Course Q&A
            </div>
            <h2 className="text-lg sm:text-xl font-black text-[var(--lms-text-primary)]">
              Ask a Question
            </h2>
            {courseTitle && (
              <p className="text-xs text-[var(--lms-text-muted)] truncate max-w-md mt-0.5">
                For course: <span className="font-semibold text-indigo-500">{courseTitle}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-subtle)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)] mb-1.5">
              Subject <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={200}
              placeholder="e.g. Need clarification on lesson 3 React hook lifecycle"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] text-sm text-[var(--lms-text-primary)] placeholder:text-[var(--lms-text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
            />
            <span className="text-[10px] text-[var(--lms-text-muted)] block text-right mt-1">
              {subject.length}/200
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)] mb-1.5">
              Question Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              maxLength={10000}
              placeholder="Explain what you are trying to understand, steps you took, or error messages encountered..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] text-sm text-[var(--lms-text-primary)] placeholder:text-[var(--lms-text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium leading-relaxed resize-none"
            />
            <span className="text-[10px] text-[var(--lms-text-muted)] block text-right mt-1">
              {description.length}/10000
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[var(--lms-border)]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-xs font-bold text-[var(--lms-text-secondary)] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !subject.trim() || !description.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white text-xs font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={13} className={submitting ? 'animate-pulse' : ''} />
              <span>{submitting ? 'Submitting...' : 'Post Question'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQueryModal;
