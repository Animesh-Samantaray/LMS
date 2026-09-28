import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, AlertCircle, Loader, Save, Globe } from 'lucide-react';
import quizService from '../services/quiz.service';

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
  const [loadingData, setLoadingData] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (isEdit && quiz) {
        setTitle(quiz.title || '');
        setDescription(quiz.description || '');
        setDuration(quiz.duration || 30);
        setMaxAttempts(quiz.maxAttempts || 1);
        if (quiz.deadline) {
          const d = new Date(quiz.deadline);
          if (!isNaN(d.getTime())) {
            const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            setDeadline(iso);
          }
        }
        fetchQuestions(quiz._id);
      } else {
        resetForm();
      }
    }
  }, [isOpen, isEdit, quiz]);

  const fetchQuestions = async (quizId) => {
    try {
      setLoadingData(true);
      const res = await quizService.getQuizQuestions(quizId);
      if (res.success && res.questions) {
        setQuestions(res.questions.map(q => ({
          ...q,
          _id: q._id,
          isNew: false
        })));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch existing questions');
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
    setError('');
    setSuccess('');
    setSubmitting(false);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        isNew: true,
        question: '',
        options: [
          { key: 'A', text: '' },
          { key: 'B', text: '' },
          { key: 'C', text: '' },
          { key: 'D', text: '' }
        ],
        correctOption: 'A',
        marks: 1,
        order: questions.length + 1
      }
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex].text = value;
    setQuestions(updated);
  };

  const removeQuestion = async (index) => {
    const q = questions[index];
    if (q._id && !q.isNew) {
      try {
        setSubmitting(true);
        await quizService.deleteQuestion(q._id);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete question from server');
        setSubmitting(false);
        return;
      }
      setSubmitting(false);
    }
    const updated = questions.filter((_, i) => i !== index);
    updated.forEach((uq, i) => uq.order = i + 1);
    setQuestions(updated);
  };

  const validate = () => {
    setError('');
    if (!title.trim() || !description.trim() || !duration || !deadline) {
      setError('Please fill in all quiz details.');
      return false;
    }
    if (maxAttempts < 1) {
      setError('Max attempts must be at least 1.');
      return false;
    }
    if (duration <= 0) {
      setError('Duration must be greater than 0.');
      return false;
    }
    const d = new Date(deadline);
    if (d <= new Date()) {
      setError('Deadline must be in the future.');
      return false;
    }
    if (questions.length === 0) {
      
    }
    
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(`Question ${i + 1} text is required.`);
        return false;
      }
      for (const opt of q.options) {
        if (!opt.text.trim()) {
          setError(`Option ${opt.key} is missing in question ${i + 1}.`);
          return false;
        }
      }
      if (q.marks <= 0) {
        setError(`Marks for question ${i + 1} must be a positive number.`);
        return false;
      }
    }
    return true;
  };

  const saveQuizAndQuestions = async (isPublishing = false) => {
    if (!validate()) return;
    if (isPublishing && questions.length === 0) {
      setError('At least one question is required before publishing.');
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
          deadline
      };

      if (isEdit && currentQuizId) {
        await quizService.updateQuiz(currentQuizId, quizData);
      } else {
        const res = await quizService.createQuiz(courseId, quizData);
        if (res.success && res.quiz) {
          currentQuizId = res.quiz._id;
        }
      }

      
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const questionPayload = {
          question: q.question,
          options: q.options,
          correctOption: q.correctOption,
          marks: Number(q.marks),
          order: Number(q.order)
        };
        
        if (q.isNew || !q._id) {
          await quizService.createQuestion(currentQuizId, questionPayload);
        } else {
          await quizService.updateQuestion(q._id, questionPayload);
        }
      }

      
      if (isPublishing) {
        await quizService.publishQuiz(currentQuizId);
        setSuccess('Quiz published successfully!');
      } else {
        setSuccess('Draft saved successfully!');
      }

      setTimeout(() => {
        onSaveSuccess();
        onClose();
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="bg-[var(--lms-surface-elevated)] rounded-3xl w-full max-w-4xl shadow-2xl border border-[var(--lms-border)] overflow-hidden flex flex-col max-h-[95vh]">
        <div className="px-6 py-4 border-b border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
              {isEdit ? 'Edit Quiz' : 'Create Quiz'}
            </h3>
            <p className="text-xs text-[var(--lms-text-muted)] mt-0.5">Build your quiz and add questions.</p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] p-1 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[var(--lms-surface)]">
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 text-sm font-bold flex items-center gap-2">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 text-sm font-bold flex items-center gap-2">
              <Globe size={18} />
              <p>{success}</p>
            </div>
          )}

          {loadingData ? (
            <div className="flex justify-center items-center py-10">
              <Loader size={32} className="animate-spin text-[var(--lms-accent)]" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Quiz Info */}
              <div>
                <h4 className="text-sm font-bold uppercase text-[var(--lms-text-muted)] mb-3">Quiz Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-[var(--lms-text-secondary)] mb-1">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl text-sm font-semibold focus:border-[var(--lms-accent)] outline-none"
                      placeholder="e.g. Midterm Quiz"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-[var(--lms-text-secondary)] mb-1">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows="2"
                      className="w-full px-4 py-2 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl text-sm font-semibold focus:border-[var(--lms-accent)] outline-none resize-none"
                      placeholder="Brief instructions..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--lms-text-secondary)] mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-4 py-2 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl text-sm font-semibold focus:border-[var(--lms-accent)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--lms-text-secondary)] mb-1">Max Attempts</label>
                    <input
                      type="number"
                      min="1"
                      value={maxAttempts}
                      onChange={(e) => setMaxAttempts(e.target.value)}
                      className="w-full px-4 py-2 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl text-sm font-semibold focus:border-[var(--lms-accent)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--lms-text-secondary)] mb-1">Deadline</label>
                    <input
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="w-full px-4 py-2 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl text-sm font-semibold focus:border-[var(--lms-accent)] outline-none"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-[var(--lms-border)]" />

              {/* Questions Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold uppercase text-[var(--lms-text-muted)]">Questions ({questions.length})</h4>
                  <button
                    onClick={addQuestion}
                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] transition-colors"
                  >
                    <Plus size={14} /> Add Question
                  </button>
                </div>

                <div className="space-y-6">
                  {questions.map((q, qIndex) => (
                    <div key={qIndex} className="p-4 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl relative">
                      <button
                        onClick={() => removeQuestion(qIndex)}
                        className="absolute top-4 right-4 text-rose-500 hover:text-rose-600 p-1"
                        title="Remove Question"
                      >
                        <Trash2 size={16} />
                      </button>
                      
                      <div className="mb-4 pr-8">
                        <label className="block text-xs font-bold text-[var(--lms-text-secondary)] mb-1">Question {qIndex + 1}</label>
                        <textarea
                          value={q.question}
                          onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                          rows="2"
                          className="w-full px-3 py-2 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-xl text-sm focus:border-[var(--lms-accent)] outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {['A', 'B', 'C', 'D'].map((opt, oIndex) => (
                          <div key={opt} className="flex items-center gap-2">
                            <span className="font-bold text-xs w-5">{opt}.</span>
                            <input
                              type="text"
                              value={q.options[oIndex].text}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              className="w-full px-3 py-1.5 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-lg text-sm focus:border-[var(--lms-accent)] outline-none"
                              placeholder={`Option ${opt}`}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-4 items-center border-t border-[var(--lms-border)] pt-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-[var(--lms-text-secondary)]">Correct Option:</label>
                          <select
                            value={q.correctOption}
                            onChange={(e) => updateQuestion(qIndex, 'correctOption', e.target.value)}
                            className="px-2 py-1 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-lg text-xs font-bold outline-none"
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-[var(--lms-text-secondary)]">Marks:</label>
                          <input
                            type="number"
                            value={q.marks}
                            onChange={(e) => updateQuestion(qIndex, 'marks', e.target.value)}
                            className="w-16 px-2 py-1 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-lg text-xs font-bold outline-none text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {questions.length === 0 && (
                    <div className="p-6 border-2 border-dashed border-[var(--lms-border)] rounded-2xl text-center text-[var(--lms-text-muted)] text-sm">
                      No questions added yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex items-center justify-between shrink-0">
          <div className="text-xs font-bold text-[var(--lms-text-muted)]">
            Total Questions: {questions.length} &bull; Total Marks: {totalMarks}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => saveQuizAndQuestions(false)}
              disabled={submitting || loadingData}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-[var(--lms-border)] text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface)] transition-colors flex items-center gap-1.5"
            >
              {submitting ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
              Save Draft
            </button>
            <button
              onClick={() => saveQuizAndQuestions(true)}
              disabled={submitting || loadingData || questions.length === 0}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              {submitting ? <Loader size={14} className="animate-spin" /> : <Globe size={14} />}
              Publish Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizBuilderModal;
