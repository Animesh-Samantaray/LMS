import React, { useState, useEffect } from 'react';
import { X, Clock, HelpCircle, AlertCircle, Loader, PlayCircle, CheckCircle } from 'lucide-react';
import quizService from '../services/quiz.service';

const QuizDetailModal = ({
  isOpen,
  quiz = null,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && quiz) {
      fetchQuestions(quiz._id);
    } else {
      setQuestions([]);
    }
  }, [isOpen, quiz]);

  const fetchQuestions = async (quizId) => {
    try {
      setLoading(true);
      setError('');
      const res = await quizService.getQuizQuestions(quizId);
      if (res.success && res.questions) {
        setQuestions(res.questions);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quiz details.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !quiz) return null;

  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  const deadlineDate = quiz.deadline ? new Date(quiz.deadline) : null;
  const isPastDeadline = deadlineDate ? deadlineDate < new Date() : false;
  const attemptsRemaining = quiz.attemptsRemaining ?? (Number(quiz.maxAttempts || 1) - Number(quiz.attempts || 0));
  const isSubmitted = Number(attemptsRemaining) <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-[var(--lms-surface-elevated)] rounded-3xl w-full max-w-2xl shadow-2xl border border-[var(--lms-border)] overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/30">
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[var(--lms-text-primary)]">{quiz.title}</h3>
              <p className="text-xs text-[var(--lms-text-muted)] font-semibold mt-0.5">Quiz Details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] transition-colors p-2 rounded-xl hover:bg-[var(--lms-surface)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[var(--lms-surface)] space-y-6">
          {error ? (
            <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-2">
              <AlertCircle size={18} /> {error}
            </div>
          ) : (
            <>
              {quiz.description && (
                <div className="p-4 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] mb-2">Description / Instructions</h4>
                  <p className="text-sm text-[var(--lms-text-secondary)] whitespace-pre-wrap leading-relaxed">{quiz.description}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] mb-1">Duration</h4>
                  <div className="flex items-center gap-2 text-[var(--lms-text-primary)] font-bold text-base">
                    <Clock size={16} className="text-blue-500" />
                    <span>{quiz.duration} Minutes</span>
                  </div>
                </div>

                <div className="p-4 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] mb-1">Deadline</h4>
                  <div className={`flex items-center gap-2 font-bold text-base ${isPastDeadline ? 'text-rose-500' : 'text-[var(--lms-text-primary)]'}`}>
                    <AlertCircle size={16} />
                    <span>{deadlineDate ? deadlineDate.toLocaleString() : 'No deadline'}</span>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="py-8 flex justify-center">
                  <Loader size={24} className="animate-spin text-[var(--lms-accent)]" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl text-center">
                    <span className="block text-3xl font-extrabold text-[var(--lms-text-primary)] mb-1">{questions.length}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">Questions</span>
                  </div>
                  <div className="p-4 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl text-center">
                    <span className="block text-3xl font-extrabold text-[var(--lms-text-primary)] mb-1">{totalMarks}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">Total Marks</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                {isSubmitted ? (
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-600">
                    <CheckCircle size={18} /> Quiz Submitted
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onClose();
                      window.location.href = `/student/quizzes/${quiz._id}/take`;
                    }}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[var(--lms-accent)] text-white hover:bg-[var(--lms-accent-hover)] transition-colors flex items-center gap-2"
                  >
                    <PlayCircle size={18} />
                    Start Quiz
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-bold bg-[var(--lms-surface)] border border-[var(--lms-border)] text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-hover)] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizDetailModal;
