import React from 'react';
import { Trophy, Award, Target, Users } from 'lucide-react';

export const MyRankHero = ({ myRank, totalParticipants, myResult, maxMarks }) => {
  if (!myRank && !myResult) return null;

  const score = myResult?.marksObtained ?? '--';
  const percentage = myResult?.percentage ?? '--';

  return (
    <div className="bg-gradient-to-r from-[var(--lms-accent)]/20 via-[var(--lms-accent)]/10 to-transparent border border-[var(--lms-accent)]/30 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--lms-accent)] flex items-center gap-1.5">
            <Trophy size={13} />
            Your Performance Summary
          </span>
          <h2 className="text-lg font-bold text-[var(--lms-text-primary)] mt-1">
            {myRank ? (
              <span>
                You ranked <span className="text-[var(--lms-accent)] font-black">#{myRank}</span> out of {totalParticipants} participants
              </span>
            ) : (
              <span>Your attempt is recorded</span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 bg-[var(--lms-surface)]/80 border border-[var(--lms-border)] rounded-xl px-5 py-3 shadow-inner">
          <div className="text-center">
            <span className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider block">
              Rank
            </span>
            <span className="text-xl font-black text-[var(--lms-accent)]">
              {myRank ? `#${myRank}` : '--'}
            </span>
          </div>

          <div className="h-8 w-px bg-[var(--lms-border)]" />

          <div className="text-center">
            <span className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider block">
              Score
            </span>
            <span className="text-xl font-black text-[var(--lms-text-primary)]">
              {score} {maxMarks ? <span className="text-xs text-[var(--lms-text-muted)]">/ {maxMarks}</span> : ''}
            </span>
          </div>

          <div className="h-8 w-px bg-[var(--lms-border)]" />

          <div className="text-center">
            <span className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider block">
              Percentage
            </span>
            <span className="text-xl font-black text-emerald-400">
              {percentage !== '--' ? `${percentage}%` : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
