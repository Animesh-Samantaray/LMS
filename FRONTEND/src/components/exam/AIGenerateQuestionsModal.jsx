import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { BrainCircuit, Upload, Sparkles, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import examService from '../../services/exam.service';

export const AIGenerateQuestionsModal = ({ isOpen, onClose, examId, onQuestionsGenerated }) => {
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState(null);
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [instructions, setInstructions] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewQuestions, setPreviewQuestions] = useState(null); // the generated array of questions

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim() && !file) {
      setError('Please provide a topic or upload a source document.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      if (topic.trim()) formData.append('topic', topic);
      if (file) formData.append('document', file);
      formData.append('numberOfQuestions', numberOfQuestions);
      formData.append('difficulty', difficulty);
      formData.append('marksPerQuestion', marksPerQuestion);
      if (instructions.trim()) formData.append('instructions', instructions);

      const res = await examService.generateQuestionsWithAI(formData);
      
      setPreviewQuestions(res.questions);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to generate questions. AI Service might be unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAllQuestions = async () => {
    if (!previewQuestions || previewQuestions.length === 0) return;
    try {
      setLoading(true);
      setError('');
      
      const payload = {
        examId,
        questions: previewQuestions,
      };

      await examService.saveAIGeneratedQuestions(payload);
      
      if (onQuestionsGenerated) onQuestionsGenerated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save generated questions.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[var(--lms-surface)] w-full max-w-2xl p-6 rounded-2xl border border-[var(--lms-border)] shadow-2xl relative my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-hover)] transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-purple-600/10 rounded-xl text-purple-400">
            <BrainCircuit size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--lms-text-primary)]">
              AI Question Generator
            </h2>
            <p className="text-xs text-[var(--lms-text-secondary)] font-medium">
              Automatically generate multiple-choice questions from a topic or document.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2 mb-4">
            <AlertCircle size={15} /> {error}
          </div>
        )}

        {!previewQuestions ? (
          <form onSubmit={handleGenerate} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider text-[10px] mb-1">
                  Topic / Subject Matter
                </label>
                <input
                  type="text"
                  placeholder="E.g., Advanced JavaScript Closures"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-3.5 py-2.5 text-[var(--lms-text-primary)] font-semibold focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider text-[10px] mb-1">
                  Or Upload Source Material
                </label>
                <input
                  type="file"
                  id="sourceFile"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <label
                  htmlFor="sourceFile"
                  className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all h-[68px] ${
                    file
                      ? 'border-purple-500 bg-purple-500/5'
                      : 'border-[var(--lms-border)] hover:border-purple-400/50 hover:bg-[var(--lms-surface-hover)]'
                  }`}
                >
                  <div className={`mb-1 ${file ? 'text-purple-400' : 'text-[var(--lms-text-muted)]'}`}>
                    <Upload size={16} />
                  </div>
                  <span className="font-bold text-[var(--lms-text-primary)] text-[11px] truncate w-full text-center">
                    {file ? file.name : 'Select document (PDF, DOCX)'}
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
    </div>,
    document.body
  );
};
