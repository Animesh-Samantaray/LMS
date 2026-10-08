import React, { useState } from 'react';
import { Plus, Trash2, Edit2, CheckCircle2, AlertCircle, Save, X } from 'lucide-react';
import examService from '../../../services/exam.service';

export const QuestionEditorModal = ({ isOpen, onClose, examId, question = null, onSaved }) => {
  const [formData, setFormData] = useState({
    question: question?.question || '',
    marks: question?.marks || 1,
    order: question?.order || 1,
    correctOption: question?.correctOption || 'A',
    options: question?.options || [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleOptionChange = (key, text) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt) => (opt.key === key ? { ...opt, text } : opt)),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim()) {
      setError('Question text is required');
      return;
    }

    if (formData.options.some((opt) => !opt.text.trim())) {
      setError('All 4 option texts are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (question?._id) {
        await examService.updateQuestion(question._id, formData);
      } else {
        await examService.createQuestion(examId, formData);
      }

      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save question');
    } finally {
      setLoading(false);
    }
  };

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
          {question ? 'Edit Question' : 'Add New Question'}
        </h2>

        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2 mb-4">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider text-[10px] mb-1">
              Question Statement
            </label>
            <textarea
              rows="3"
              required
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter question text..."
              className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl p-3 text-[var(--lms-text-primary)] focus:outline-none focus:border-[var(--lms-accent)]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider text-[10px] mb-1">
                Marks
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-3 py-2 text-[var(--lms-text-primary)] font-semibold focus:outline-none focus:border-[var(--lms-accent)]"
              />
            </div>

            <div>
              <label className="block font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider text-[10px] mb-1">
                Display Order
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-3 py-2 text-[var(--lms-text-primary)] font-semibold focus:outline-none focus:border-[var(--lms-accent)]"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="block font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider text-[10px]">
              Options & Correct Answer
            </label>

            {['A', 'B', 'C', 'D'].map((key) => {
              const opt = formData.options.find((o) => o.key === key) || { key, text: '' };
              const isCorrect = formData.correctOption === key;

              return (
                <div
                  key={key}
                  className={`p-2.5 rounded-xl border flex items-center gap-3 transition-colors ${
                    isCorrect
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-[var(--lms-surface-subtle)] border-[var(--lms-border)]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, correctOption: key })}
                    className={`w-7 h-7 rounded-lg border font-bold text-xs flex items-center justify-center shrink-0 transition-all ${
                      isCorrect
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow'
                        : 'bg-[var(--lms-surface)] border-[var(--lms-border)] text-[var(--lms-text-secondary)]'
                    }`}
                  >
                    {key}
                  </button>

                  <input
                    type="text"
                    required
                    placeholder={`Option ${key} text...`}
                    value={opt.text}
                    onChange={(e) => handleOptionChange(key, e.target.value)}
                    className="flex-1 bg-transparent border-none text-[var(--lms-text-primary)] focus:outline-none font-medium text-xs"
                  />

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, correctOption: key })}
                    className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                      isCorrect
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)]'
                    }`}
                  >
                    {isCorrect ? 'Correct' : 'Mark Correct'}
                  </button>
                </div>
              );
            })}
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
                  <Save size={14} /> Save Question
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
