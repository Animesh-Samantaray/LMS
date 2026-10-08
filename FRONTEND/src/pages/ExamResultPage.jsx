import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Award,
  Clock,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Loader,
  AlertTriangle,
  Users,
} from 'lucide-react';
import examService from '../services/exam.service';
import DashboardLayout from '../components/DashboardLayout';

const ExamResultPage = () => {
  const { examId, attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await examService.getExamResult(attemptId);
      if (res.success) {
        setResult(res.result);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load exam result.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Exam Result">
        <div className="max-w-2xl mx-auto py-20 flex flex-col items-center justify-center">
          <Loader size={36} className="animate-spin text-[var(--lms-accent)] mb-3" />
          <p className="text-xs text-[var(--lms-text-muted)] font-bold">Calculating final evaluation...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !result) {
    return (
      <DashboardLayout pageTitle="Exam Result">
        <div className="max-w-md mx-auto my-12 p-8 lms-glass-card rounded-2xl border border-rose-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-[var(--lms-text-primary)]">Result Unavailable</h2>
          <p className="text-xs text-[var(--lms-text-muted)]">{error || 'Result details could not be retrieved.'}</p>
          <button
            onClick={() => navigate('/exams')}
            className="px-4 py-2 rounded-xl bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-hover)] text-xs font-bold text-[var(--lms-text-primary)] border border-[var(--lms-border)]"
          >
            Back to Exams
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const submissionDate = result.submittedAt ? new Date(result.submittedAt) : new Date();

  return (
    <DashboardLayout pageTitle="Exam Result">
      <div className="max-w-2xl mx-auto space-y-6 pb-12">
        <div className="lms-glass-card p-6 sm:p-8 rounded-3xl border border-[var(--lms-border)] text-center shadow-lg relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-4 shadow-inner">
            <CheckCircle2 size={32} />
          </div>

          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
            Assessment Finalized
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--lms-text-primary)] mt-1 tracking-tight">
            {result.examTitle || 'Examination'}
          </h1>

          <p className="text-xs text-[var(--lms-text-secondary)] mt-1 font-semibold">
            Submitted by {result.studentName || 'Student'} on{' '}
            {submissionDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
            at {submissionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>

          <div className="grid grid-cols-3 gap-3 sm:gap-4 my-8">
            <div className="p-4 rounded-2xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] block">
                Score
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[var(--lms-text-primary)] mt-1 block">
                {result.marksObtained}
                <span className="text-xs text-[var(--lms-text-muted)] font-bold"> / {result.maxMarks}</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] block">
                Percentage
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">
                {result.percentage}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] block">
                Contest Rank
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[var(--lms-accent)] mt-1 block">
                {result.rank ? `#${result.rank}` : '--'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t border-[var(--lms-border)]">
            <button
              onClick={() => navigate(`/exams/${examId || result.examId}/leaderboard`)}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-[var(--lms-accent)] hover:bg-[var(--lms-accent-hover)] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Trophy size={15} />
              View Contest Leaderboard
            </button>
            <button
              onClick={() => navigate('/exams')}
              className="w-full sm:w-auto py-3 px-6 rounded-xl border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] text-xs font-bold text-[var(--lms-text-secondary)] transition-all"
            >
              Back to Exam Portal
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExamResultPage;
