import React, { useState } from 'react';
import { Sparkles, Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';
import examService from '../../services/exam.service';

export const AIGenerateQuestionsModal = ({ isOpen, onClose, examId, onQuestionsGenerated }) => {
  const [file, setFile] = useState(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewQuestions, setPreviewQuestions] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError('');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF, DOCX, or TXT document');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await examService.generateExamQuestions(examId, {
        document: file,
        numberOfQuestions: Number(numberOfQuestions),
        difficulty,
        marksPerQuestion: Number(marksPerQuestion),
        instructions,
      });

      if (res.success && res.questions) {
        setPreviewQuestions(res.questions);
      } else {
        setError(res.message || 'Failed to generate questions');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'AI generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllQuestions = async () => {
    if (!previewQuestions || previewQuestions.length === 0) return;

    try {
      setLoading(true);
      setError('');

      for (const q of previewQuestions) {
        await examService.createQuestion(examId, {
          question: q.question,
          options: q.options,
          correctOption: q.correctOption,
          marks: q.marks,
          order: q.order,
        });
      }

      if (onQuestionsGenerated) {
        onQuestionsGenerated();
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save generated questions to exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="lms-glass-card w-full max-w-2xl p-6 rounded-2xl border border-[var(--lms-border)] shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-hover)] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <Sparkles size={22} />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400">
              AI Powered Assistant
            </span>
            <h2 className="text-xl font-bold text-[var(--lms-text-primary)]">
              Generate Questions from Document
            </h2>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2 mb-4">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        )}

        {!previewQuestions ? (
          <form onSubmit={handleGenerate} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider text-[10px] mb-1.5">
                Upload Source Document (PDF, DOCX, TXT)
              </label>
              <div className="border-2 border-dashed border-[var(--lms-border)] hover:border-purple-500/50 rounded-xl p-6 text-center transition-colors bg-[var(--lms-surface-subtle)]">
                <input
                  type="file"
                  id="examDocUpload"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="examDocUpload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="p-3 rounded-full bg-[var(--lms-surface)] border border-[var(--lms-border)] text-purple-400 shadow-sm">
                    <Upload size={20} />
                  </div>
                  <span className="font-bold text-[var(--lms-text-primary)]">
                    {file ? file.name : 'Click to select document'}
                  </span>
                  <span className="text-[11px] text-[var(--lms-text-muted)]">
                    Supported: PDF, DOCX, TXT (up to 10MB)
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider text-[10px] mb-1">
                  Questions Count (1-30)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(e.target.value)}
                  className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-3 py-2 text-[var(--lms-text-primary)] font-semibold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider text-[10px] mb-1">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-3 py-2 text-[var(--lms-text-primary)] font-semibold focus:outline-none focus:border-purple-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider text-[10px] mb-1">
                  Marks per Question
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={marksPerQuestion}
                  onChange={(e) => setMarksPerQuestion(e.target.value)}
                  className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-3 py-2 text-[var(--lms-text-primary)] font-semibold focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider text-[10px] mb-1">
                Custom Instructions (Optional)
              </label>
              <textarea
                rows="2"
                placeholder="E.g., Focus on chapter 3 core algorithms and time complexities..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl p-3 text-[var(--lms-text-primary)] focus:outline-none focus:border-purple-500 placeholder-[var(--lms-text-muted)]"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[var(--lms-border)]">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] font-bold text-[var(--lms-text-secondary)] transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="py-2.5 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <Sparkles size={15} />
                    Generate Questions
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-purple-500/10 border border-purple-500/25 p-3 rounded-xl text-xs text-purple-300">
              <span className="font-bold">
                {previewQuestions.length} Questions Generated Successfully
              </span>
              <button
                onClick={() => setPreviewQuestions(null)}
                className="underline hover:text-purple-200"
              >
                Re-generate
              </button>
            </div>

            <div className="max-h-[350px] overflow-y-auto space-y-3 custom-scrollbar pr-1">
              {previewQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl text-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-[var(--lms-text-primary)]">
                      {idx + 1}. {q.question}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[var(--lms-accent)]/15 text-[var(--lms-accent)] font-bold text-[10px] shrink-0">
                      {q.marks} Marks
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {q.options?.map((opt) => (
                      <div
                        key={opt.key}
                        className={`p-2 rounded-lg border text-[11px] ${
                          opt.key === q.correctOption
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                            : 'bg-[var(--lms-surface)] border-[var(--lms-border)] text-[var(--lms-text-secondary)]'
                        }`}
                      >
                        <span className="font-mono mr-1.5">{opt.key}:</span> {opt.text}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-[var(--lms-border)]">
              <button
                type="button"
                onClick={() => setPreviewQuestions(null)}
                className="py-2.5 px-4 rounded-xl border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] font-bold text-xs text-[var(--lms-text-secondary)] transition-all"
              >
                Back to Settings
              </button>
              <button
                type="button"
                onClick={handleSaveAllQuestions}
                disabled={loading}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md flex items-center gap-2"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    Add All Questions to Exam
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
