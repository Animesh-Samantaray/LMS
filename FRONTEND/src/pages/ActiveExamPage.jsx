import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader,
  Menu,
  X,
  Send,
  Sparkles,
} from 'lucide-react';
import examService from '../services/exam.service';
import { ExamTimer } from '../components/exam/ExamTimer';
import { QuestionNavigator } from '../components/exam/QuestionNavigator';
import { ExamSubmitModal } from '../components/exam/ExamSubmitModal';

const ActiveExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saveStatus, setSaveStatus] = useState('saved');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    initAttempt();
  }, [examId]);

  const initAttempt = async () => {
    try {
      setLoading(true);
      setError('');

      let attemptData;
      try {
        const activeRes = await examService.getActiveAttempt(examId);
        if (activeRes.success) {
          attemptData = activeRes;
        }
      } catch (err) {
        const startRes = await examService.startExamAttempt(examId);
        if (startRes.success) {
          attemptData = startRes;
        }
      }

      if (attemptData) {
        setAttempt(attemptData);
        setQuestions(attemptData.questions || []);

        const initialAnswers = {};
        if (attemptData.answers && Array.isArray(attemptData.answers)) {
          attemptData.answers.forEach((ans) => {
            initialAnswers[ans.questionId] = ans.selectedOption;
          });
        }
        setAnswers(initialAnswers);
      }

      const examRes = await examService.getExamById(examId);
      if (examRes.success) {
        setExam(examRes.exam);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to initialize examination session.'
      );
    } finally {
      setLoading(false);
    }
  };

  const triggerAutosave = useCallback(
    (newAnswers) => {
      if (!attempt?.attemptId) return;

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setSaveStatus('saving');

      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const payload = Object.keys(newAnswers).map((qId) => ({
            questionId: qId,
            selectedOption: newAnswers[qId],
          }));

          await examService.saveExamAnswers(attempt.attemptId, payload);
          setSaveStatus('saved');
        } catch (err) {
          console.error('Autosave error:', err);
          setSaveStatus('error');
        }
      }, 700);
    },
    [attempt?.attemptId]
  );

  const handleSelectOption = (questionId, optionKey) => {
    const updated = { ...answers, [questionId]: optionKey };
    setAnswers(updated);
    triggerAutosave(updated);
  };

  const handleFinalSubmit = async () => {
    if (!attempt?.attemptId) return;

    try {
      setSubmitting(true);
      setError('');

      const formattedAnswers = Object.keys(answers).map((qId) => ({
        questionId: qId,
        selectedOption: answers[qId],
      }));

      const res = await examService.submitExam(attempt.attemptId, formattedAnswers);
      if (res.success) {
        navigate(`/exams/${examId}/result/${attempt.attemptId}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to submit exam.');
      setSubmitting(false);
      setSubmitModalOpen(false);
    }
  };

  const handleTimerExpired = () => {
    handleFinalSubmit();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--lms-bg)] flex flex-col items-center justify-center p-4">
        <Loader size={36} className="animate-spin text-[var(--lms-accent)] mb-4" />
        <h2 className="text-sm font-bold text-[var(--lms-text-primary)]">
          Preparing examination environment...
        </h2>
        <p className="text-xs text-[var(--lms-text-muted)] mt-1">
          Synchronizing question bank and server clock
        </p>
      </div>
    );
  }

  if (error && !attempt) {
    return (
      <div className="min-h-screen bg-[var(--lms-bg)] flex items-center justify-center p-4">
        <div className="lms-glass-card max-w-md w-full p-6 text-center space-y-4 rounded-2xl border border-rose-500/30">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-[var(--lms-text-primary)]">Exam Inaccessible</h2>
          <p className="text-xs text-[var(--lms-text-muted)]">{error}</p>
          <button
            onClick={() => navigate('/exams')}
            className="px-4 py-2 rounded-xl bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-hover)] text-xs font-bold text-[var(--lms-text-primary)] border border-[var(--lms-border)]"
          >
            Return to Exam Portal
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-[var(--lms-bg)] text-[var(--lms-text-primary)] flex flex-col font-sans select-none">
      <header className="h-16 border-b border-[var(--lms-border)] bg-[var(--lms-header-bg)] backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden p-2 rounded-xl border border-[var(--lms-border)] text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-hover)]"
          >
            <Menu size={18} />
          </button>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--lms-accent)] block">
              Active Assessment
            </span>
            <h1 className="text-sm sm:text-base font-bold text-[var(--lms-text-primary)] truncate max-w-[200px] sm:max-w-md">
              {exam?.title || 'Examination'}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[var(--lms-text-muted)]">
            {saveStatus === 'saving' && (
              <span className="inline-flex items-center gap-1 text-amber-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Autosaving...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 size={13} />
                Saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                <AlertTriangle size={13} />
                Save Failed
              </span>
            )}
          </div>

          <ExamTimer expiresAt={attempt?.expiresAt} onExpire={handleTimerExpired} />

          <button
            onClick={() => setSubmitModalOpen(true)}
            className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <Send size={13} />
            <span>Finish</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="bg-rose-500/20 text-rose-300 text-xs px-4 py-2 text-center font-bold border-b border-rose-500/30">
          {error}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden lg:block w-72 border-r border-[var(--lms-border)] bg-[var(--lms-surface)]/50 shrink-0">
          <QuestionNavigator
            questions={questions}
            currentIndex={currentIdx}
            answers={answers}
            onSelectIndex={(idx) => setCurrentIdx(idx)}
          />
        </aside>

        {mobileNavOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
            onClick={() => setMobileNavOpen(false)}
          >
            <div
              className="w-72 h-full bg-[var(--lms-surface)] border-r border-[var(--lms-border)] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 flex items-center justify-between border-b border-[var(--lms-border)]">
                <span className="font-bold text-xs uppercase tracking-wider text-[var(--lms-text-primary)]">
                  Question Map
                </span>
                <button
                  onClick={() => setMobileNavOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)]"
                >
                  <X size={16} />
                </button>
              </div>
              <QuestionNavigator
                questions={questions}
                currentIndex={currentIdx}
                answers={answers}
                isMobile={true}
                onCloseMobile={() => setMobileNavOpen(false)}
                onSelectIndex={(idx) => setCurrentIdx(idx)}
              />
            </div>
          </div>
        )}

        <main className="flex-1 flex flex-col justify-between overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full">
          {currentQuestion ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[var(--lms-border)] pb-4">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-[var(--lms-accent)] text-white font-extrabold text-xs">
                    {currentIdx + 1}
                  </span>
                  <span className="text-xs font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
                    of {questions.length} Questions
                  </span>
                </div>

                <span className="px-3 py-1 rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] text-xs font-bold text-[var(--lms-text-secondary)]">
                  {currentQuestion.marks} Marks
                </span>
              </div>

              <div className="text-base sm:text-lg font-bold text-[var(--lms-text-primary)] leading-relaxed">
                {currentQuestion.question}
              </div>

              <div className="space-y-3 pt-2">
                {currentQuestion.options?.map((option) => {
                  const isSelected = answers[currentQuestion._id] === option.key;

                  return (
                    <div
                      key={option.key}
                      onClick={() => handleSelectOption(currentQuestion._id, option.key)}
                      className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-4 ${
                        isSelected
                          ? 'bg-[var(--lms-accent)]/15 border-[var(--lms-accent)] shadow-sm'
                          : 'bg-[var(--lms-surface)] border-[var(--lms-border)] hover:border-[var(--lms-accent)]/50 hover:bg-[var(--lms-surface-hover)]'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                          isSelected
                            ? 'bg-[var(--lms-accent)] border-[var(--lms-accent)] text-white shadow'
                            : 'bg-[var(--lms-surface-subtle)] border-[var(--lms-border)] text-[var(--lms-text-secondary)]'
                        }`}
                      >
                        {option.key}
                      </div>

                      <div className="text-xs sm:text-sm font-semibold text-[var(--lms-text-primary)] leading-snug">
                        {option.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-xs text-[var(--lms-text-muted)]">
              No questions found for this exam.
            </div>
          )}

          <div className="pt-6 mt-8 border-t border-[var(--lms-border)] flex items-center justify-between gap-4">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="py-2.5 px-4 rounded-xl border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-[var(--lms-text-secondary)] transition-all flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Previous
            </button>

            <div className="text-xs text-[var(--lms-text-muted)] font-bold">
              {answeredCount} of {questions.length} Answered
            </div>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                className="py-2.5 px-5 rounded-xl bg-[var(--lms-accent)] hover:bg-[var(--lms-accent-hover)] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              >
                Next <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => setSubmitModalOpen(true)}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              >
                Submit Exam <Send size={14} />
              </button>
            )}
          </div>
        </main>
      </div>

      <ExamSubmitModal
        isOpen={submitModalOpen}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        submitting={submitting}
        onClose={() => setSubmitModalOpen(false)}
        onSubmit={handleFinalSubmit}
      />
    </div>
  );
};

export default ActiveExamPage;
