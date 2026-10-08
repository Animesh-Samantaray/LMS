import React, { useState } from 'react';
import { Search, Trophy, Medal, Award, User, ArrowUpRight } from 'lucide-react';

export const LeaderboardTable = ({ leaderboard = [], currentUserId }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeaderboard = leaderboard.filter((item) =>
    item.student?.name?.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="lms-glass-card rounded-2xl border border-[var(--lms-border)] overflow-hidden shadow-sm">
      <div className="p-4 sm:p-5 border-b border-[var(--lms-border)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--lms-surface)]/50">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-amber-400" />
          <h3 className="font-bold text-sm text-[var(--lms-text-primary)]">Full Rankings</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--lms-surface-subtle)] text-[var(--lms-text-muted)] font-semibold border border-[var(--lms-border)]">
            {leaderboard.length} Participants
          </span>
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search participant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--lms-text-primary)] placeholder-[var(--lms-text-muted)] focus:outline-none focus:border-[var(--lms-accent)] transition-all"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lms-text-muted)]" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[var(--lms-surface-subtle)]/70 border-b border-[var(--lms-border)] text-[var(--lms-text-muted)] uppercase tracking-wider font-extrabold text-[10px]">
              <th className="py-3 px-4 w-20 text-center">Rank</th>
              <th className="py-3 px-4">Participant</th>
              <th className="py-3 px-4 text-center">Score</th>
              <th className="py-3 px-4 text-center">Percentage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--lms-border)]/50">
            {filteredLeaderboard.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-[var(--lms-text-muted)]">
                  {searchTerm ? 'No participants matched your search' : 'No submissions recorded yet'}
                </td>
              </tr>
            ) : (
              filteredLeaderboard.map((entry) => {
                const isMe = currentUserId && entry.student?.id === currentUserId.toString();
                const isTop1 = entry.rank === 1;
                const isTop2 = entry.rank === 2;
                const isTop3 = entry.rank === 3;

                let rankBadge = (
                  <span className="font-mono font-bold text-xs text-[var(--lms-text-secondary)]">
                    #{entry.rank}
                  </span>
                );

                if (isTop1) {
                  rankBadge = (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 font-black text-xs">
                      1
                    </span>
                  );
                } else if (isTop2) {
                  rankBadge = (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-400/20 text-slate-300 border border-slate-400/40 font-black text-xs">
                      2
                    </span>
                  );
                } else if (isTop3) {
                  rankBadge = (
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-800/20 text-amber-500 border border-amber-700/40 font-black text-xs">
                      3
                    </span>
                  );
                }

                return (
                  <tr
                    key={entry.rank + '-' + entry.student?.id}
                    className={`transition-colors duration-150 ${
                      isMe
                        ? 'bg-[var(--lms-accent)]/15 border-l-4 border-l-[var(--lms-accent)] font-semibold'
                        : 'hover:bg-[var(--lms-surface-hover)]'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center">{rankBadge}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] flex items-center justify-center text-[var(--lms-text-primary)] font-bold text-xs">
                          {entry.student?.name ? entry.student.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 font-bold text-[var(--lms-text-primary)]">
                            <span>{entry.student?.name || 'Anonymous Student'}</span>
                            {isMe && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-[var(--lms-accent)] text-white">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-[var(--lms-text-primary)]">
                      {entry.marksObtained}{' '}
                      <span className="text-[var(--lms-text-muted)] font-normal">/ {entry.maxMarks}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                      {entry.percentage}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
