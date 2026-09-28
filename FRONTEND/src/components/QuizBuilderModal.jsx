import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileText,
  Globe,
  HelpCircle,
  ListChecks,
  Loader,
  Plus,
  Save,
  Settings2,
  Trash2,
  X,
} from 'lucide-react';
import quizService from '../services/quiz.service';

const optionKeys = ['A', 'B', 'C', 'D'];

const createQuestion = (order) => ({
  localId: `new-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  isNew: true,
  question: '',
  options: optionKeys.map((key) => ({ key, text: '' })),
  correctOption: 'A',
  marks: 1,
  order,
});

const getQuestionIssue = (question) => {
  if (!question.question?.trim()) return 'Add a question prompt';
  if (question.options?.some((option) => !option.text?.trim())) return 'Complete all four options';
  if (!optionKeys.includes(question.correctOption)) return 'Choose the correct answer';
  if (!Number.isFinite(Number(question.marks)) || Number(question.marks) < 1) return 'Add valid marks';
  return '';
};

const formatDateTimeInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const QuizBuilderModal = ({
  isOpen,
  isEdit = false,
  quiz = null,
  courseId,
  onClose,
  onSaveSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(30);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [deadline, setDeadline] = useState('');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const questionEditorRef = useRef(null);

  const isReadOnly = isEdit && quiz?.status === 'published';
  const selectedQuestion = questions.find((question) => question.localId === selectedQuestionId) || null;
  const totalMarks = useMemo(
    () => questions.reduce((sum, question) => sum + (Number(question.marks) || 0), 0),
    [questions]
  );
  const incompleteCount = useMemo(
    () => questions.filter((question) => getQuestionIssue(question)).length,
    [questions]
  );

  useEffect(() => {
    if (!isOpen) return;
    setError('');
    setSuccess('');
    if (isEdit && quiz) {
      setTitle(quiz.title || '');
      setDescription(quiz.description || '');
      setDuration(quiz.duration || 30);
      setMaxAttempts(quiz.maxAttempts || 1);
      setDeadline(formatDateTimeInput(quiz.deadline));
      fetchQuestions(quiz._id);
    } else {
      resetForm();
    }
  }, [isOpen, isEdit, quiz]);

  useEffect(() => {
    if (selectedQuestionId && questionEditorRef.current && !isReadOnly) {
      questionEditorRef.current.focus();
    }
  }, [selectedQuestionId, isReadOnly]);

  const fetchQuestions = async (quizId) => {
    try {
      setLoadingData(true);
      const response = await quizService.getQuizQuestions(quizId);
      if (response.success && response.questions) {
        const loadedQuestions = response.questions.map((question) => ({
          ...question,
          localId: question._id,
          isNew: false,
        }));
        setQuestions(loadedQuestions);
        setSelectedQuestionId(loadedQuestions[0]?.localId || null);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to fetch existing questions');
    } finally {
      setLoadingData(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDuration(30);
    setMaxAttempts(1);
    setDeadline('');
    setQuestions([]);
    setSelectedQuestionId(null);
    setError('');
    setSuccess('');
    setSubmitting(false);
  };

  const addQuestion = () => {
    const question = createQuestion(questions.length + 1);
    setQuestions((currentQuestions) => [...currentQuestions, question]);
    setSelectedQuestionId(question.localId);
    setError('');
  };

  const updateSelectedQuestion = (field, value) => {
    setQuestions((currentQuestions) => currentQuestions.map((question) => (
      question.localId === selectedQuestionId ? { ...question, [field]: value } : question
    )));
  };

  const updateSelectedOption = (optionIndex, value) => {
    setQuestions((currentQuestions) => currentQuestions.map((question) => {
      if (question.localId !== selectedQuestionId) return question;
      return {
        ...question,
        options: question.options.map((option, index) => (
          index === optionIndex ? { ...option, text: value } : option
        )),
      };
    }));
  };

  const removeQuestion = async () => {
    if (!selectedQuestion || isReadOnly) return;
    if (!window.confirm(`Remove question ${questions.indexOf(selectedQuestion) + 1}? This cannot be undone.`)) return;

    try {
      setSubmitting(true);
      if (selectedQuestion._id && !selectedQuestion.isNew) {
        await quizService.deleteQuestion(selectedQuestion._id);
      }
      const selectedIndex = questions.findIndex((question) => question.localId === selectedQuestionId);
      const remainingQuestions = questions
        .filter((question) => question.localId !== selectedQuestionId)
        .map((question, index) => ({ ...question, order: index + 1 }));
      setQuestions(remainingQuestions);
      setSelectedQuestionId(
        remainingQuestions[Math.min(selectedIndex, remainingQuestions.length - 1)]?.localId || null
      );
      setError('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to delete question from server');
    } finally {
      setSubmitting(false);
    }
  };

  const validate = () => {
    setError('');
    if (!title.trim() || !description.trim() || !duration || !deadline) {
      setError('Complete the quiz setup before saving.');
      return false;
    }
    if (!Number.isInteger(Number(maxAttempts)) || Number(maxAttempts) < 1) {
      setError('Maximum attempts must be a positive whole number.');
      return false;
    }
    if (!Number.isFinite(Number(duration)) || Number(duration) <= 0) {
      setError('Duration must be greater than 0.');
      return false;
    }
    if (new Date(deadline) <= new Date()) {
      setError('Deadline must be in the future.');
      return false;
    }
    const invalidIndex = questions.findIndex((question) => getQuestionIssue(question));
    if (invalidIndex !== -1) {
      setSelectedQuestionId(questions[invalidIndex].localId);
      setError(`Question ${invalidIndex + 1}: ${getQuestionIssue(questions[invalidIndex])}.`);
      return false;
    }
    return true;
  };

  const saveQuizAndQuestions = async (isPublishing = false) => {
    if (!validate()) return;
    if (isPublishing && questions.length === 0) {
      setError('Add at least one question before publishing.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      let currentQuizId = quiz?._id;
      const quizData = {
        title,
        description,
        duration: Number(duration),
        maxAttempts: Number(maxAttempts),
        deadline,
      };

      if (isEdit && currentQuizId) {
        await quizService.updateQuiz(currentQuizId, quizData);
      } else {
        const response = await quizService.createQuiz(courseId, quizData);
        if (response.success && response.quiz) currentQuizId = response.quiz._id;
      }

      for (let index = 0; index < questions.length; index += 1) {
        const question = questions[index];
        const questionPayload = {
          question: question.question,
          options: question.options,
          correctOption: question.correctOption,
          marks: Number(question.marks),
          order: index + 1,
        };
        if (question.isNew || !question._id) {
          await quizService.createQuestion(currentQuizId, questionPayload);
        } else {
          await quizService.updateQuestion(question._id, questionPayload);
        }
      }

      if (isPublishing) {
        await quizService.publishQuiz(currentQuizId);
        setSuccess('Quiz published successfully.');
      } else {
        setSuccess('Draft saved successfully.');
      }

      window.setTimeout(() => {
        onSaveSuccess();
        onClose();
      }, 900);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedIssue = selectedQuestion ? getQuestionIssue(selectedQuestion) : '';
  const statusLabel = isReadOnly ? 'Published' : isEdit ? 'Draft' : 'New quiz';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-2 sm:p-4">
      <div className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent)]"><ClipboardList size={20} /></div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-extrabold text-[var(--lms-text-primary)]">{isEdit ? 'Edit quiz' : 'Create quiz'}</h2>
                <span className="rounded-full border border-[var(--lms-border)] bg-[var(--lms-surface)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">{statusLabel}</span>
              </div>
              <p className="hidden text-xs text-[var(--lms-text-muted)] sm:block">Build a clear assessment and review it before publishing.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={submitting} className="rounded-lg p-2 text-[var(--lms-text-muted)] transition hover:bg-[var(--lms-surface)] hover:text-[var(--lms-text-primary)]" aria-label="Close quiz builder"><X size={19} /></button>
        </header>

        <div className="flex-1 overflow-y-auto bg-[var(--lms-surface)] p-4 sm:p-6">
          {error && <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm font-semibold text-rose-600"><AlertCircle size={18} className="mt-0.5 shrink-0" /><p>{error}</p></div>}
          {success && <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-600"><CheckCircle2 size={18} className="mt-0.5 shrink-0" /><p>{success}</p></div>}

          {loadingData ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center gap-3 text-[var(--lms-text-muted)]"><Loader size={30} className="animate-spin text-[var(--lms-accent)]" /><span className="text-sm font-semibold">Loading quiz workspace...</span></div>
          ) : (
            <div className="space-y-5">
              <section className="rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-start gap-3"><Settings2 size={18} className="mt-0.5 text-[var(--lms-accent)]" /><div><h3 className="text-sm font-extrabold text-[var(--lms-text-primary)]">Quiz details</h3><p className="mt-0.5 text-xs text-[var(--lms-text-muted)]">Set the context, time limit, and availability for students.</p></div></div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                  <label className="md:col-span-4"><span className="mb-1.5 block text-xs font-bold text-[var(--lms-text-secondary)]">Quiz title</span><input value={title} onChange={(event) => setTitle(event.target.value)} disabled={isReadOnly} placeholder="e.g. Midterm assessment" className="lms-input w-full" /></label>
                  <label className="md:col-span-1"><span className="mb-1.5 block text-xs font-bold text-[var(--lms-text-secondary)]">Duration</span><div className="relative"><Clock3 size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lms-text-muted)]" /><input type="number" min="1" value={duration} onChange={(event) => setDuration(event.target.value)} disabled={isReadOnly} className="lms-input w-full pl-9" /></div><span className="mt-1 block text-[11px] text-[var(--lms-text-muted)]">Minutes allowed</span></label>
                  <label className="md:col-span-1"><span className="mb-1.5 block text-xs font-bold text-[var(--lms-text-secondary)]">Max attempts</span><input type="number" min="1" value={maxAttempts} onChange={(event) => setMaxAttempts(event.target.value)} disabled={isReadOnly} className="lms-input w-full" /><span className="mt-1 block text-[11px] text-[var(--lms-text-muted)]">Per student</span></label>
                  <label className="md:col-span-4"><span className="mb-1.5 block text-xs font-bold text-[var(--lms-text-secondary)]">Description and instructions</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} disabled={isReadOnly} rows="2" placeholder="Tell students what this assessment covers..." className="lms-input w-full resize-none" /></label>
                  <label className="md:col-span-2"><span className="mb-1.5 block text-xs font-bold text-[var(--lms-text-secondary)]">Deadline</span><input type="datetime-local" value={deadline} onChange={(event) => setDeadline(event.target.value)} disabled={isReadOnly} className="lms-input w-full" /><span className="mt-1 block text-[11px] text-[var(--lms-text-muted)]">When the quiz closes</span></label>
                </div>
              </section>

              <section className="grid min-h-[470px] grid-cols-1 overflow-hidden rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] shadow-sm lg:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="flex max-h-[300px] flex-col border-b border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] lg:max-h-none lg:border-b-0 lg:border-r">
                  <div className="flex items-center justify-between border-b border-[var(--lms-border)] p-4"><div><h3 className="text-sm font-extrabold text-[var(--lms-text-primary)]">Questions</h3><p className="mt-0.5 text-[11px] text-[var(--lms-text-muted)]">{questions.length} total · {incompleteCount} need attention</p></div>{!isReadOnly && <button type="button" onClick={addQuestion} className="flex h-8 items-center gap-1 rounded-lg bg-[var(--lms-accent)] px-2.5 text-xs font-bold text-white transition hover:bg-[var(--lms-accent-hover)]" title="Add question"><Plus size={14} /> Add</button>}</div>
                  <div className="flex-1 space-y-1 overflow-y-auto p-2">
                    {questions.map((question, index) => {
                      const issue = getQuestionIssue(question);
                      const isSelected = question.localId === selectedQuestionId;
                      return <button type="button" key={question.localId} onClick={() => setSelectedQuestionId(question.localId)} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${isSelected ? 'border-[var(--lms-accent)] bg-[var(--lms-accent-subtle)]' : 'border-transparent hover:border-[var(--lms-border)] hover:bg-[var(--lms-surface)]'}`}><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold ${isSelected ? 'bg-[var(--lms-accent)] text-white' : 'bg-[var(--lms-surface)] text-[var(--lms-text-secondary)]'}`}>{index + 1}</span><span className="min-w-0 flex-1"><span className={`block truncate text-xs font-bold ${isSelected ? 'text-[var(--lms-accent-text)]' : 'text-[var(--lms-text-primary)]'}`}>{question.question?.trim() || 'Untitled question'}</span><span className={`mt-1 flex items-center gap-1 text-[10px] font-semibold ${issue ? 'text-amber-600' : 'text-emerald-600'}`}>{issue ? <><AlertCircle size={11} /> Needs attention</> : <><CheckCircle2 size={11} /> Ready</>}</span></span></button>;
                    })}
                    {questions.length === 0 && <div className="flex min-h-[180px] flex-col items-center justify-center px-4 text-center"><ListChecks size={28} className="mb-3 text-[var(--lms-border)]" /><p className="text-xs font-bold text-[var(--lms-text-primary)]">Your question list is empty</p><p className="mt-1 text-[11px] leading-relaxed text-[var(--lms-text-muted)]">Add your first question to start building the assessment.</p>{!isReadOnly && <button type="button" onClick={addQuestion} className="mt-4 text-xs font-bold text-[var(--lms-accent)] hover:underline">Add first question</button>}</div>}
                  </div>
                </aside>

                <div className="min-w-0 bg-[var(--lms-surface)]">
                  {selectedQuestion ? <div className="flex h-full flex-col"><div className="flex items-center justify-between border-b border-[var(--lms-border)] px-4 py-3 sm:px-6"><div className="flex items-center gap-2"><FileText size={16} className="text-[var(--lms-accent)]" /><span className="text-xs font-extrabold uppercase tracking-wider text-[var(--lms-text-muted)]">Question {questions.indexOf(selectedQuestion) + 1} editor</span></div>{!isReadOnly && <button type="button" onClick={removeQuestion} disabled={submitting} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-rose-500 transition hover:bg-rose-500/10 disabled:opacity-50"><Trash2 size={14} /> Remove</button>}</div><div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">{selectedIssue && <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-700"><AlertCircle size={15} /> {selectedIssue}</div>}<label className="block"><span className="mb-2 block text-sm font-extrabold text-[var(--lms-text-primary)]">Question prompt</span><textarea ref={questionEditorRef} value={selectedQuestion.question} onChange={(event) => updateSelectedQuestion('question', event.target.value)} disabled={isReadOnly} rows="4" placeholder="Write the question students will answer..." className="lms-input w-full resize-y text-sm leading-relaxed" /></label><div><div className="mb-2 flex items-center justify-between gap-3"><span className="text-sm font-extrabold text-[var(--lms-text-primary)]">Answer options</span><span className="text-[11px] font-semibold text-[var(--lms-text-muted)]">Select the correct answer</span></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{optionKeys.map((key, index) => { const option = selectedQuestion.options[index]; const isCorrect = selectedQuestion.correctOption === key; return <div key={key} className={`flex items-center gap-2 rounded-xl border p-2 transition ${isCorrect ? 'border-emerald-500/60 bg-emerald-500/5' : 'border-[var(--lms-border)] bg-[var(--lms-surface-elevated)]'}`}><button type="button" disabled={isReadOnly} onClick={() => updateSelectedQuestion('correctOption', key)} className={isCorrect ? 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-xs font-extrabold text-white transition' : 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--lms-surface-subtle)] text-xs font-extrabold text-[var(--lms-text-secondary)] transition hover:bg-[var(--lms-accent-subtle)]'} aria-label={`Mark option ${key} as correct`}>{isCorrect ? <Check size={15} /> : key}</button><input type="text" value={option?.text || ''} onChange={(event) => updateSelectedOption(index, event.target.value)} disabled={isReadOnly} placeholder={`Option ${key}`} className="min-w-0 flex-1 border-0 bg-transparent px-1 py-2 text-sm font-medium text-[var(--lms-text-primary)] outline-none placeholder:text-[var(--lms-text-muted)]" /></div>; })}</div></div><div className="flex flex-wrap items-end gap-4 border-t border-[var(--lms-border)] pt-5"><label className="w-28"><span className="mb-1.5 block text-xs font-bold text-[var(--lms-text-secondary)]">Marks</span><input type="number" min="1" value={selectedQuestion.marks} onChange={(event) => updateSelectedQuestion('marks', event.target.value)} disabled={isReadOnly} className="lms-input w-full" /></label><div className="pb-2 text-xs font-semibold text-[var(--lms-text-muted)]">Correct answer: <span className="font-extrabold text-emerald-600">{selectedQuestion.correctOption || 'Not selected'}</span></div></div></div></div> : <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center"><HelpCircle size={38} className="mb-4 text-[var(--lms-border)]" /><h3 className="text-base font-extrabold text-[var(--lms-text-primary)]">Start with a question</h3><p className="mt-1 max-w-sm text-sm leading-relaxed text-[var(--lms-text-muted)]">Your question editor will appear here. Add a question from the panel to begin authoring.</p>{!isReadOnly && <button type="button" onClick={addQuestion} className="mt-5 flex items-center gap-2 rounded-xl bg-[var(--lms-accent)] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[var(--lms-accent-hover)]"><Plus size={16} /> Add question</button>}</div>}
                </div>
              </section>

              <section className="grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] p-3"><span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">Questions</span><span className="mt-1 block text-lg font-extrabold text-[var(--lms-text-primary)]">{questions.length}</span></div><div className="rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] p-3"><span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">Total marks</span><span className="mt-1 block text-lg font-extrabold text-[var(--lms-text-primary)]">{totalMarks}</span></div><div className="rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] p-3"><span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">Duration</span><span className="mt-1 block text-lg font-extrabold text-[var(--lms-text-primary)]">{duration || 0}<span className="ml-1 text-xs font-semibold text-[var(--lms-text-muted)]">min</span></span></div><div className="rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] p-3"><span className="block text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">Readiness</span><span className={`mt-1 block text-sm font-extrabold ${incompleteCount ? 'text-amber-600' : 'text-emerald-600'}`}>{incompleteCount ? `${incompleteCount} incomplete` : 'Ready to save'}</span></div></section>
            </div>
          )}
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="flex items-center gap-2 text-xs font-semibold text-[var(--lms-text-muted)]"><ArrowLeft size={14} /> Changes stay here until you save</div><div className="flex w-full gap-2 sm:w-auto"><button type="button" onClick={onClose} disabled={submitting} className="flex-1 rounded-xl border border-[var(--lms-border)] px-4 py-2.5 text-xs font-bold text-[var(--lms-text-primary)] transition hover:bg-[var(--lms-surface)] sm:flex-none">Cancel</button>{!isReadOnly && <><button type="button" onClick={() => saveQuizAndQuestions(false)} disabled={submitting || loadingData} className="flex-1 rounded-xl border border-[var(--lms-border)] px-4 py-2.5 text-xs font-bold text-[var(--lms-text-primary)] transition hover:bg-[var(--lms-surface)] disabled:opacity-50 sm:flex-none">{submitting ? <Loader size={14} className="mx-auto animate-spin" /> : <span className="flex items-center justify-center gap-1.5"><Save size={14} /> Save draft</span>}</button><button type="button" onClick={() => saveQuizAndQuestions(true)} disabled={submitting || loadingData || questions.length === 0} className="flex-1 rounded-xl bg-[var(--lms-accent)] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[var(--lms-accent-hover)] disabled:opacity-50 sm:flex-none">{submitting ? <Loader size={14} className="mx-auto animate-spin" /> : <span className="flex items-center justify-center gap-1.5"><Globe size={14} /> Publish quiz</span>}</button></>}</div></footer>
      </div>
    </div>
  );
};

export default QuizBuilderModal;