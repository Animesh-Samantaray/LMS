import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  Loader,
  AlertCircle,
  Award,
  Clock,
  Send,
  Trophy,
} from 'lucide-react';
import examService from '../../../services/exam.service';
import DashboardLayout from '../../../components/DashboardLayout';
import { ExamStatusBadge } from '../../../components/exam/ExamStatusBadge';
import { QuestionEditorModal } from './QuestionEditorModal';
import { AIGenerateQuestionsModal } from '../../../components/exam/AIGenerateQuestionsModal';

const InstructorExamQuestions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [questionModal, setQuestionModal] = useState({ open: false, question: null });
  const [aiModalOpen, setAiModalOpen] = useState(false);

  useEffect(() => {
    fetchExamAndQuestions();
  }, [examId]);

  const fetchExamAndQuestions = async () => {
    try {
      setLoading(true);
      setError('');

      const examRes = await examService.getExamById(examId);
      if (examRes.success) {
        setExam(examRes.exam);
      }

      const qRes = await examService.getExamQuestions(examId);
      if (qRes.success) {
        setQuestions(qRes.questions || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      setActionLoading(true);
      await examService.deleteQuestion(qId);
      setQuestions((prev) => prev.filter((q) => q._id !== qId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishExam = async () => {
    if (questions.length === 0) {
      setError('You must add at least one question before publishing the exam.');
      return;
    }

    if (!window.confirm('Are you ready to publish this exam? Once published, questions cannot be modified.')) return;

    try {
      setActionLoading(true);
      const res = await examService.publishExam(examId);
      if (res.success) {
        setExam(res.exam);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish exam');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout roleTitle="INSTRUCTOR" pageTitle="Manage Questions">
        <div className="max-w-5xl mx-auto py-20 flex justify-center">
          <Loader size={36} className="animate-spin text-[var(--lms-accent)]" />
        </div>
      </DashboardLayout>
    );
  }

  const isDraft = exam?.status === 'draft';
  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 1), 0);

  return (
    <DashboardLayout roleTitle="INSTRUCTOR" pageTitle="Exam Questions">
      <div className="max-w-5xl mx-auto space-y-6 pb-16">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/instructor/exams')}
            className="inline-flex items-center gap-2 text-xs font-bold text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Exam Manager
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/exams/${examId}/leaderboard`)}
              className="py-2 px-3.5 rounded-xl bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-hover)] border border-[var(--lms-border)] text-xs font-bold text-[var(--lms-text-primary)] transition-all flex items-center gap-1.5"
            >
              <Trophy size={14} className="text-amber-400" /> Leaderboard
            </button>
          </div>
        </div>

        <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <ExamStatusBadge exam={exam} />
              <h1 className="text-xl font-bold text-[var(--lms-text-primary)] truncate max-w-md">
                {exam?.title}
              </h1>
            </div>
            <p className="text-xs text-[var(--lms-text-secondary)]">
              {questions.length} Questions &bull; {totalMarks} Total Marks &bull; {exam?.duration} mins
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isDraft && (
              <>
                <button
                  onClick={() => setAiModalOpen(true)}
                  className="py-2.5 px-4 rounded-xl bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Sparkles size={15} /> AI Generate
                </button>
                <button
                  onClick={() => setQuestionModal({ open: true, question: null })}
                  className="py-2.5 px-4 rounded-xl bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-hover)] border border-[var(--lms-border)] text-xs font-bold text-[var(--lms-text-primary)] transition-all flex items-center gap-2"
                >
                  <Plus size={15} /> Add Question
                </button>
                <button
                  onClick={handlePublishExam}
                  disabled={actionLoading}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  <Send size={14} /> Publish Exam
                </button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        )}

        {questions.length === 0 ? (
          <div className="lms-glass-card border border-dashed border-[var(--lms-border)] rounded-2xl py-16 flex flex-col items-center justify-center text-center p-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] flex items-center justify-center text-[var(--lms-text-muted)] mb-3">
              <HelpCircle size={28} />
            </div>
            <h3 className="text-base font-bold text-[var(--lms-text-primary)]">No Questions Added</h3>
            <p className="text-xs text-[var(--lms-text-muted)] mt-1 max-w-sm">
              Add multiple-choice questions manually or use AI to generate them from lecture slides/documents.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div
                key={q._id}
                className="lms-glass-card p-5 rounded-2xl border border-[var(--lms-border)] hover:border-[var(--lms-accent)]/30 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-[var(--lms-accent)]/15 border border-[var(--lms-accent)]/30 text-[var(--lms-accent)] font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {q.order || idx + 1}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm text-[var(--lms-text-primary)] leading-snug">
                        {q.question}
                      </h4>
                      <span className="text-[11px] font-semibold text-[var(--lms-text-muted)] mt-0.5 block">
                        Marks: {q.marks}
                      </span>
                    </div>
                  </div>

                  {isDraft && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setQuestionModal({ open: true, question: q })}
                        className="p-2 rounded-lg hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        className="p-2 rounded-lg hover:bg-rose-500/15 text-[var(--lms-text-muted)] hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options?.map((opt) => (
                    <div
                      key={opt.key}
                      className={`p-2.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                        opt.key === q.correctOption
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 font-semibold'
                          : 'bg-[var(--lms-surface-subtle)] border-[var(--lms-border)] text-[var(--lms-text-secondary)]'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md bg-[var(--lms-surface)] border border-[var(--lms-border)] flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                        {opt.key}
                      </span>
                      <span className="truncate">{opt.text}</span>
                      {opt.key === q.correctOption && (
                        <span className="ml-auto text-[10px] font-extrabold uppercase text-emerald-400">
                          Correct
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <QuestionEditorModal
        isOpen={questionModal.open}
        examId={examId}
        question={questionModal.question}
        onClose={() => setQuestionModal({ open: false, question: null })}
        onSaved={fetchExamAndQuestions}
      />

      <AIGenerateQuestionsModal
        isOpen={aiModalOpen}
        examId={examId}
        onClose={() => setAiModalOpen(false)}
        onQuestionsGenerated={fetchExamAndQuestions}
      />
    </DashboardLayout>
  );
};

export default InstructorExamQuestions;
