import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  Calendar,
  HelpCircle,
  Award,
  ArrowLeft,
  Play,
  Trophy,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import examService from '../services/exam.service';
import DashboardLayout from '../components/DashboardLayout';
import { ExamStatusBadge, getExamStatusInfo } from '../components/exam/ExamStatusBadge';
import { ExamStartModal } from '../components/exam/ExamStartModal';


const getRemainingTime = (targetDate) => {
  if (!targetDate) return '';
  const diff = targetDate.getTime() - new Date().getTime();
  if (diff <= 0) return 'Starting soon...';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);

  let res = [];
  if (days > 0) res.push(`${days}d`);
  if (hours > 0) res.push(`${hours}h`);
  if (minutes > 0) res.push(`${minutes}m`);
  
  return res.length > 0 ? `Starts in ${res.join(' ')}` : 'Starting in less than a minute...';
};

const ExamDetailsPage = () => {

  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeAttempt, setActiveAttempt] = useState(null);
  const [startModal, setStartModal] = useState({ open: false, loading: false });

  useEffect(() => {
    fetchExamAndAttempt();
  }, [examId]);

  const fetchExamAndAttempt = async () => {
    try {
      setLoading(true);
      setError('');
      const examRes = await examService.getExamById(examId);
      if (examRes.success) {
        setExam(examRes.exam);
      }

      try {
        const attemptRes = await examService.getActiveAttempt(examId);
        if (attemptRes.success && attemptRes.attemptId) {
          setActiveAttempt(attemptRes);
        }
      } catch (err) {
        setActiveAttempt(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch exam details');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExamConfirm = async () => {
    try {
      setStartModal((prev) => ({ ...prev, loading: true }));
      const res = await examService.startExamAttempt(examId);
      if (res.success) {
        navigate(`/exams/${examId}/attempt`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to start exam');
      setStartModal({ open: false, loading: false });
    }
  };

  if (loading) {
    
  return (
      <DashboardLayout pageTitle="Exam Details">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse py-12">
          <div className="h-48 bg-[var(--lms-surface-subtle)] rounded-3xl border border-[var(--lms-border)]" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-[var(--lms-surface-subtle)] rounded-2xl border border-[var(--lms-border)]" />
            <div className="h-32 bg-[var(--lms-surface-subtle)] rounded-2xl border border-[var(--lms-border)]" />
            <div className="h-32 bg-[var(--lms-surface-subtle)] rounded-2xl border border-[var(--lms-border)]" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !exam) {
    return (
      <DashboardLayout pageTitle="Exam Details">
        <div className="max-w-xl mx-auto my-12 p-8 lms-glass-card rounded-2xl border border-rose-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-lg font-bold text-[var(--lms-text-primary)]">Unable to load exam</h2>
          <p className="text-xs text-[var(--lms-text-muted)]">{error || 'Exam not found'}</p>
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

  const info = getExamStatusInfo(exam);
  const startTime = new Date(exam.startTime);
  const endTime = new Date(exam.endTime);

  return (
    <DashboardLayout pageTitle={exam.title}>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        <button
          onClick={() => navigate('/exams')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Exam List
        </button>

        <div className="lms-glass-card p-6 sm:p-8 rounded-3xl border border-[var(--lms-border)] shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <ExamStatusBadge exam={exam} />
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--lms-text-muted)]">
              <Calendar size={14} className="text-[var(--lms-accent)]" />
              <span>
                {startTime.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--lms-text-primary)] tracking-tight">
            {exam.title}
          </h1>

          {exam.courseId?.title && (
            <p className="text-xs font-semibold text-[var(--lms-accent)] mt-1 mb-4">
              Course: {exam.courseId.title}
            </p>
          )}

          <p className="text-xs text-[var(--lms-text-secondary)] leading-relaxed max-w-2xl mt-2">
            {exam.description || 'No description provided.'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[var(--lms-border)]">
            <div className="p-3.5 rounded-2xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] block">
                Duration
              </span>
              <span className="text-base font-extrabold text-[var(--lms-text-primary)] mt-0.5 block flex items-center gap-1.5">
                <Clock size={15} className="text-[var(--lms-accent)]" />
                {exam.duration} mins
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] block">
                Questions
              </span>
              <span className="text-base font-extrabold text-[var(--lms-text-primary)] mt-0.5 block flex items-center gap-1.5">
                <HelpCircle size={15} className="text-[var(--lms-accent)]" />
                {exam.questionCount || exam.questions?.length || 0}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] block">
                Max Marks
              </span>
              <span className="text-base font-extrabold text-[var(--lms-text-primary)] mt-0.5 block flex items-center gap-1.5">
                <Award size={15} className="text-[var(--lms-accent)]" />
                {exam.totalMarks || exam.maxMarks || 0}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] block">
                Max Attempts
              </span>
              <span className="text-base font-extrabold text-[var(--lms-text-primary)] mt-0.5 block flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-[var(--lms-accent)]" />
                {exam.maxAttempts || 1}
              </span>
            </div>
          </div>
        </div>

        <div className="lms-glass-card p-6 rounded-2xl border border-[var(--lms-border)] shadow-sm space-y-3 text-xs">
          <h3 className="text-sm font-bold text-[var(--lms-text-primary)] flex items-center gap-2">
            <FileText size={16} className="text-[var(--lms-accent)]" />
            Important Examination Rules
          </h3>
          <ul className="space-y-2 text-[var(--lms-text-secondary)] pl-2">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--lms-accent)] mt-1.5 shrink-0" />
              <span>
                The server timer controls expiration. Answers cannot be submitted after expiration.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--lms-accent)] mt-1.5 shrink-0" />
              <span>
                Answers are autosaved progressively. If you disconnect, refresh to restore your active session.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--lms-accent)] mt-1.5 shrink-0" />
              <span>
                Final rankings and leaderboard will unlock once the examination duration has ended.
              </span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 lms-glass-card rounded-2xl border border-[var(--lms-border)]">
          <div>
            <div className="text-xs font-bold text-[var(--lms-text-primary)]">Ready to begin?</div>
            <div className="text-[11px] text-[var(--lms-text-muted)]">
              {info.status === 'LIVE'
                ? 'The examination window is currently live.'
                : info.status === 'UPCOMING'
                ? `Starts on ${startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'This examination has completed.'}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeAttempt ? (
              <button
                onClick={() => navigate(`/exams/${examId}/attempt`)}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Play size={14} className="fill-white" />
                Resume Active Attempt
              </button>
            ) : info.status === 'LIVE' ? (
              <button
                onClick={() => setStartModal({ open: true, loading: false })}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Play size={14} className="fill-white" />
                Start Exam
              </button>
            ) : info.status === 'ENDED' || info.status === 'COMPLETED' ? (
              <button
                onClick={() => navigate(`/exams/${examId}/leaderboard`)}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-[var(--lms-accent)] hover:bg-[var(--lms-accent-hover)] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Trophy size={14} />
                View Leaderboard
              </button>
            ) : (
              <button
                disabled
                className="group relative w-full sm:w-auto py-3 px-6 rounded-xl bg-[var(--lms-surface-subtle)] text-[var(--lms-text-muted)] border border-[var(--lms-border)] text-xs font-bold cursor-not-allowed"
              >
                <span>Exam Not Started</span>
                
                {/* Hover Tooltip */}
                <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-[var(--lms-text-primary)] text-[var(--lms-surface)] text-[10px] font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none shadow-xl border border-[var(--lms-border)] z-50 flex items-center gap-1.5">
                  <Clock size={12} className="text-[var(--lms-surface)]/80" />
                  {getRemainingTime(startTime)}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[var(--lms-text-primary)]"></div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      <ExamStartModal
        isOpen={startModal.open}
        exam={exam}
        loading={startModal.loading}
        onClose={() => setStartModal({ open: false, loading: false })}
        onConfirm={handleStartExamConfirm}
      />
    </DashboardLayout>
  );
};

export default ExamDetailsPage;
