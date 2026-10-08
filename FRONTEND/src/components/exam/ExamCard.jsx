import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, HelpCircle, Award, ArrowRight, Play, Trophy } from 'lucide-react';
import { ExamStatusBadge, getExamStatusInfo } from './ExamStatusBadge';

export const ExamCard = ({ exam, onEnter, isInstructor = false, onManage }) => {
  const navigate = useNavigate();
  const info = getExamStatusInfo(exam);
  const startTime = new Date(exam.startTime);
  const endTime = new Date(exam.endTime);

  const handleCardClick = () => {
    if (isInstructor && onManage) {
      onManage(exam);
    } else {
      navigate(`/exams/${exam._id}`);
    }
  };

  return (
    <div className="lms-glass-card p-4 sm:p-5 border border-[var(--lms-border)] hover:border-[var(--lms-accent)]/50 transition-all duration-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 group shadow-sm hover:shadow-md">
      
      {/* Main Content Area */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <ExamStatusBadge exam={exam} />
          <span className="text-[11px] font-bold text-[var(--lms-text-muted)] flex items-center gap-1 bg-[var(--lms-surface-subtle)] px-2 py-0.5 rounded-full border border-[var(--lms-border)]">
            <Award size={12} className="text-[var(--lms-accent)]" />
            {exam.totalMarks || exam.maxMarks || 0} Marks
          </span>
        </div>

        <h3
          onClick={handleCardClick}
          className="text-lg sm:text-xl font-bold text-[var(--lms-text-primary)] group-hover:text-[var(--lms-accent)] transition-colors line-clamp-1 cursor-pointer"
        >
          {exam.title}
        </h3>

        {exam.courseId?.title && (
          <p className="text-xs font-semibold text-[var(--lms-text-secondary)] mt-0.5 line-clamp-1">
            {exam.courseId.title}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 pt-3 border-t border-[var(--lms-border)]/40 text-xs text-[var(--lms-text-secondary)] font-medium">
          <div className="flex items-center gap-1.5 bg-indigo-500/5 px-2 py-1 rounded-lg text-indigo-400 border border-indigo-500/10">
            <Clock size={13} className="shrink-0" />
            <span>{exam.duration} mins</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/5 px-2 py-1 rounded-lg text-emerald-500 border border-emerald-500/10">
            <HelpCircle size={13} className="shrink-0" />
            <span>{exam.questionCount || exam.questions?.length || 0} Questions</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--lms-text-muted)] bg-[var(--lms-surface-subtle)] px-2 py-1 rounded-lg border border-[var(--lms-border)]">
            <Calendar size={13} className="shrink-0" />
            <span>
              {startTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
              {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
              {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Area */}
      <div className="shrink-0 sm:w-44 flex flex-col justify-center sm:border-l sm:border-[var(--lms-border)]/40 sm:pl-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-[var(--lms-border)]/40">
        {isInstructor ? (
          <button
            onClick={() => onManage && onManage(exam)}
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-hover)] border border-[var(--lms-border)] text-xs font-bold text-[var(--lms-text-primary)] transition-all flex items-center justify-center gap-2"
          >
            Manage Exam
          </button>
        ) : info.status === 'LIVE' ? (
          <button
            onClick={() => onEnter ? onEnter(exam) : navigate(`/exams/${exam._id}`)}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 group-hover:scale-[1.02]"
          >
            <Play size={14} className="fill-white" />
            Enter Exam
          </button>
        ) : info.status === 'ENDED' || info.status === 'COMPLETED' ? (
          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={() => navigate(`/exams/${exam._id}/leaderboard`)}
              className="w-full py-2 px-3 rounded-xl bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-hover)] border border-[var(--lms-border)] text-[11px] font-bold text-[var(--lms-text-primary)] transition-all flex items-center justify-center gap-1.5"
            >
              <Trophy size={13} className="text-amber-400" />
              Leaderboard
            </button>
            <button
              onClick={() => navigate(`/exams/${exam._id}`)}
              className="w-full py-2 px-3 rounded-xl bg-[var(--lms-accent)] hover:bg-[var(--lms-accent-hover)] text-white text-[11px] font-bold transition-all flex items-center justify-center"
            >
              View Details
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate(`/exams/${exam._id}`)}
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-hover)] border border-[var(--lms-border)] text-xs font-bold text-[var(--lms-text-primary)] transition-all flex items-center justify-center gap-2"
          >
            View Details
            <ArrowRight size={13} />
          </button>
        )}
      </div>

    </div>
  );
};
