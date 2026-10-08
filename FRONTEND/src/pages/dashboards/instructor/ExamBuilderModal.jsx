import React, { useState } from 'react';
import { Calendar, Clock, AlertCircle, Save, X } from 'lucide-react';
import examService from '../../../services/exam.service';

export const ExamBuilderModal = ({ isOpen, onClose, courseId, exam = null, onSaved }) => {
  const [formData, setFormData] = useState({
    title: exam?.title || '',
    description: exam?.description || '',
    duration: exam?.duration || 60,
    startTime: exam?.startTime ? new Date(exam.startTime).toISOString().slice(0, 16) : '',
    maxAttempts: exam?.maxAttempts || 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.startTime) {
      setError('Start time is required');
      return;
    }

    const start = new Date(formData.startTime);
    if (Number.isNaN(start.getTime())) {
      setError('Valid start time is required');
      return;
    }

    const durationMinutes = Number(formData.duration) || 60;
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    try {
      setLoading(true);
      setError('');

      if (exam?._id) {
        await examService.updateExam(exam._id, {
          ...formData,
          duration: durationMinutes,
          startTime: start,
          endTime: end,
        });
      } else {
        await examService.createExam(courseId, {
          ...formData,
          duration: durationMinutes,
          startTime: start,
          endTime: end,
        });
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  const calculatedEndTimeStr = formData.startTime && formData.duration
    ? new Date(new Date(formData.startTime).getTime() + (Number(formData.duration) || 0) * 60 * 1000).toLocaleString()
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="lms-glass-card w-full max-w-xl p-6 rounded-2xl border border-[var(--lms-border)] shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-hover)] transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-bold text-[var(--lms-text-primary)] mb-4">
          {exam ? 'Edit Examination' : 'Create New Examination'}
        </h2>

        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2 mb-4">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider text-[10px] mb-1">
              Exam Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Midterm Comprehensive Assessment"
              className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-3.5 py-2.5 text-[var(--lms-text-primary)] font-semibold focus:outline-none focus:border-[var(--lms-accent)]"
            />
          </div>

          <div>
            <label className="block font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider text-[10px] mb-1">
              Description / Instructions
            </label>
            <textarea
              rows="3"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Instructions for students..."
              className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl p-3 text-[var(--lms-text-primary)] focus:outline-none focus:border-[var(--lms-accent)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider text-[10px] mb-1">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-3 py-2 text-[var(--lms-text-primary)] font-semibold focus:outline-none focus:border-[var(--lms-accent)]"
              />
            </div>

            <div>
              <label className="block font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider text-[10px] mb-1">
                Max Attempts Allowed
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.maxAttempts}
                onChange={(e) => setFormData({ ...formData, maxAttempts: Number(e.target.value) })}
                className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-3 py-2 text-[var(--lms-text-primary)] font-semibold focus:outline-none focus:border-[var(--lms-accent)]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider text-[10px] mb-1">
              Start Time
            </label>
            <input
              type="datetime-local"
              required
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-3 py-2 text-[var(--lms-text-primary)] font-semibold focus:outline-none focus:border-[var(--lms-accent)]"
            />
            {calculatedEndTimeStr && (
              <p className="mt-1.5 text-[11px] text-[var(--lms-text-muted)] flex items-center gap-1">
                <Clock size={12} className="text-[var(--lms-accent)]" /> Auto-calculated End Time: <span className="font-semibold text-[var(--lms-text-primary)]">{calculatedEndTimeStr}</span>
              </p>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--lms-border)]">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-4 rounded-xl border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] font-bold text-[var(--lms-text-secondary)] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-5 rounded-xl bg-[var(--lms-accent)] hover:bg-[var(--lms-accent-hover)] text-white font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={14} /> Save Exam
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
