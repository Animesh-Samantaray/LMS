import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trophy,
  Award,
  ArrowLeft,
  Users,
  Clock,
  Loader,
  AlertCircle,
  Lock,
  Calendar,
} from 'lucide-react';
import examService from '../services/exam.service';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { LeaderboardPodium } from '../components/exam/LeaderboardPodium';
import { MyRankHero } from '../components/exam/MyRankHero';
import { LeaderboardTable } from '../components/exam/LeaderboardTable';

const ExamLeaderboardPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exam, setExam] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [myResult, setMyResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [lockedInfo, setLockedInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, [examId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');
      setIsLocked(false);

      const res = await examService.getExamLeaderboard(examId);
      if (res.success) {
        setExam(res.exam);
        setLeaderboard(res.leaderboard || []);
        setMyRank(res.myRank);

        if (user) {
          const myEntry = res.leaderboard?.find(
            (entry) => entry.student?.id === (user._id || user.id)?.toString()
          );
          if (myEntry) {
            setMyResult(myEntry);
          }
        }
      }
    } catch (err) {
      if (err.response?.data?.code === 'LEADERBOARD_LOCKED') {
        setIsLocked(true);
        setLockedInfo(err.response.data);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load leaderboard.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout pageTitle="Leaderboard">
        <div className="max-w-4xl mx-auto py-20 flex flex-col items-center justify-center">
          <Loader size={36} className="animate-spin text-[var(--lms-accent)] mb-3" />
          <p className="text-xs text-[var(--lms-text-muted)] font-bold">Compiling contest rankings...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isLocked) {
    const unlockTime = lockedInfo?.endTime ? new Date(lockedInfo.endTime) : null;

    return (
      <DashboardLayout pageTitle="Leaderboard Locked">
        <div className="max-w-md mx-auto my-16 p-8 lms-glass-card rounded-3xl border border-amber-500/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-inner">
            <Lock size={28} />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
            Contest In Progress
          </span>
          <h2 className="text-xl font-bold text-[var(--lms-text-primary)]">Leaderboard Locked</h2>
          <p className="text-xs text-[var(--lms-text-secondary)] leading-relaxed">
            {lockedInfo?.message ||
              'Leaderboard and final rankings will be published once the contest duration has concluded.'}
          </p>
          {unlockTime && (
            <div className="p-3 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl text-xs font-semibold text-[var(--lms-text-muted)] flex items-center justify-center gap-1.5">
              <Calendar size={14} className="text-[var(--lms-accent)]" />
              <span>Unlocks at {unlockTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
          <button
            onClick={() => navigate('/exams')}
            className="w-full py-2.5 px-4 rounded-xl bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-hover)] text-xs font-bold text-[var(--lms-text-primary)] border border-[var(--lms-border)] transition-all"
          >
            Return to Exam Portal
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout pageTitle="Leaderboard">
        <div className="max-w-md mx-auto my-12 p-8 lms-glass-card rounded-2xl border border-rose-500/30 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-lg font-bold text-[var(--lms-text-primary)]">Leaderboard Unavailable</h2>
          <p className="text-xs text-[var(--lms-text-muted)]">{error}</p>
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

  const topThree = leaderboard.slice(0, 3);
  const currentUserId = user?._id || user?.id;

  return (
    <DashboardLayout pageTitle="Leaderboard">
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        <button
          onClick={() => navigate('/exams')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Exam Portal
        </button>

        <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Trophy size={22} />
              </div>
              <h1 className="text-2xl font-bold text-[var(--lms-text-primary)]">Contest Leaderboard</h1>
            </div>
            <p className="text-xs text-[var(--lms-text-secondary)]">
              {exam?.title || 'Examination'} &bull; Final Verified Standings
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-bold text-[var(--lms-text-muted)]">
            <div className="px-3.5 py-1.5 rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] flex items-center gap-1.5">
              <Users size={14} className="text-[var(--lms-accent)]" />
              <span>{leaderboard.length} Participants</span>
            </div>
          </div>
        </div>

        <MyRankHero
          myRank={myRank}
          totalParticipants={leaderboard.length}
          myResult={myResult}
          maxMarks={leaderboard[0]?.maxMarks}
        />

        {topThree.length > 0 && <LeaderboardPodium topThree={topThree} />}

        <LeaderboardTable leaderboard={leaderboard} currentUserId={currentUserId} />
      </div>
    </DashboardLayout>
  );
};

export default ExamLeaderboardPage;
