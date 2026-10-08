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
    <div className="lms-glass-card p-5 sm:p-6 border border-[var(--lms-border)] hover:border-[var(--lms-accent)]/50 transition-all duration-300 rounded-2xl flex flex-col justify-between group shadow-sm hover:shadow-md">
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <ExamStatusBadge exam={exam} />
          <span className="text-xs font-semibold text-[var(--lms-text-muted)] flex items-center gap-1">
            <Award size={13} className="text-[var(--lms-accent)]" />
            {exam.totalMarks || exam.maxMarks || 0} Marks
          </span>
        </div>

        <h3
          onClick={handleCardClick}
          className="text-lg font-bold text-[var(--lms-text-primary)] group-hover:text-[var(--lms-accent)] transition-colors line-clamp-1 cursor-pointer"
        >
          {exam.title}
        </h3>

        {exam.courseId?.title && (
          <p className="text-xs font-medium text-[var(--lms-text-secondary)] mt-0.5 mb-2 line-clamp-1">
            {exam.courseId.title}
          </p>
        )}

        <p className="text-xs text-[var(--lms-text-muted)] line-clamp-2 mt-2 min-h-[32px]">
          {exam.description || 'No description provided for this exam.'}
        </p>

        <div className="grid grid-cols-2 gap-2.5 mt-4 pt-4 border-t border-[var(--lms-border)]/60 text-xs text-[var(--lms-text-secondary)]">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[var(--lms-accent)] shrink-0" />
            <span>{exam.duration} mins</span>
          </div>
          <div className="flex items-center gap-2">
            <HelpCircle size={14} className="text-[var(--lms-accent)] shrink-0" />
            <span>{exam.questionCount || exam.questions?.length || 0} Questions</span>
          </div>
          <div className="flex items-center gap-2 col-span-2 text-[11px] text-[var(--lms-text-muted)]">
            <Calendar size={13} className="shrink-0" />
            <span>
              {startTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
              {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
              {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-[var(--lms-border)]/40 flex items-center justify-between gap-3">
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
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 group-hover:scale-[1.01]"
          >
            <Play size={14} className="fill-white" />
            Enter Exam
          </button>
        ) : info.status === 'ENDED' || info.status === 'COMPLETED' ? (
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => navigate(`/exams/${exam._id}/leaderboard`)}
              className="flex-1 py-2.5 px-3 rounded-xl bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-hover)] border border-[var(--lms-border)] text-xs font-bold text-[var(--lms-text-primary)] transition-all flex items-center justify-center gap-1.5"
            >
              <Trophy size={13} className="text-amber-400" />
              Leaderboard
            </button>
            <button
              onClick={() => navigate(`/exams/${exam._id}`)}
              className="py-2.5 px-3 rounded-xl bg-[var(--lms-accent)] hover:bg-[var(--lms-accent-hover)] text-white text-xs font-bold transition-all flex items-center justify-center"
            >
              Details
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
