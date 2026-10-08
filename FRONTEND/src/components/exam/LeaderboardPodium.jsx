import React from 'react';
import { Crown, Medal, Award, User } from 'lucide-react';

export const LeaderboardPodium = ({ topThree = [] }) => {
  if (!topThree || topThree.length === 0) return null;

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <div className="flex flex-col sm:flex-row items-end justify-center gap-4 sm:gap-6 py-6 px-2">
      {second && (
        <div className="order-2 sm:order-1 flex-1 max-w-[200px] w-full flex flex-col items-center">
          <div className="relative mb-3 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-700/80 border-2 border-slate-400/50 flex items-center justify-center text-slate-300 font-bold text-lg shadow-lg relative">
              {second.student?.name ? second.student.name.charAt(0).toUpperCase() : '2'}
              <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-slate-400 text-slate-900 font-extrabold text-xs flex items-center justify-center border-2 border-slate-900">
                2
              </span>
            </div>
            <p className="font-bold text-xs text-[var(--lms-text-primary)] mt-2 text-center truncate max-w-[140px]">
              {second.student?.name || 'Student'}
            </p>
            <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
              {second.marksObtained} / {second.maxMarks} ({second.percentage}%)
            </div>
          </div>
          <div className="w-full h-24 bg-gradient-to-t from-slate-500/20 to-slate-500/10 border-t-2 border-slate-400/40 rounded-t-2xl flex items-center justify-center text-slate-400 font-black text-xl shadow-inner">
            2ND
          </div>
        </div>
      )}

      {first && (
        <div className="order-1 sm:order-2 flex-1 max-w-[220px] w-full flex flex-col items-center">
          <div className="relative mb-3 flex flex-col items-center">
            <Crown size={26} className="text-amber-400 mb-1 animate-bounce" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-amber-200 flex items-center justify-center text-amber-950 font-black text-xl shadow-xl relative">
              {first.student?.name ? first.student.name.charAt(0).toUpperCase() : '1'}
              <span className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-xs flex items-center justify-center border-2 border-amber-200 shadow">
                1
              </span>
            </div>
            <p className="font-bold text-sm text-[var(--lms-text-primary)] mt-2 text-center truncate max-w-[150px]">
              {first.student?.name || 'Student'}
            </p>
            <div className="text-xs font-bold text-amber-400 mt-0.5">
              {first.marksObtained} / {first.maxMarks} ({first.percentage}%)
            </div>
          </div>
          <div className="w-full h-32 bg-gradient-to-t from-amber-500/25 to-amber-500/10 border-t-2 border-amber-400/60 rounded-t-2xl flex items-center justify-center text-amber-400 font-black text-2xl shadow-inner">
            1ST
          </div>
        </div>
      )}

      {third && (
        <div className="order-3 sm:order-3 flex-1 max-w-[200px] w-full flex flex-col items-center">
          <div className="relative mb-3 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-900/60 border-2 border-amber-700/50 flex items-center justify-center text-amber-300 font-bold text-lg shadow-lg relative">
              {third.student?.name ? third.student.name.charAt(0).toUpperCase() : '3'}
              <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-amber-700 text-amber-100 font-extrabold text-xs flex items-center justify-center border-2 border-slate-900">
                3
              </span>
            </div>
            <p className="font-bold text-xs text-[var(--lms-text-primary)] mt-2 text-center truncate max-w-[140px]">
              {third.student?.name || 'Student'}
            </p>
            <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
              {third.marksObtained} / {third.maxMarks} ({third.percentage}%)
            </div>
          </div>
          <div className="w-full h-20 bg-gradient-to-t from-amber-900/20 to-amber-900/10 border-t-2 border-amber-700/40 rounded-t-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-xl shadow-inner">
            3RD
          </div>
        </div>
      )}
    </div>
  );
};
