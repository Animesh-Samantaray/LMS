import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Clock, AlertCircle, Loader, PlayCircle, Trophy, BookOpen, Filter } from 'lucide-react';
import examService from '../../../services/exam.service';
import DashboardLayout from '../../../components/DashboardLayout';
import { ExamCard } from '../../../components/exam/ExamCard';
import { ExamStartModal } from '../../../components/exam/ExamStartModal';

const StudentExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [startModal, setStartModal] = useState({ open: false, exam: null, loading: false });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await examService.getMyExams();
      if (res.success) {
        setExams(res.exams || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExamConfirm = async () => {
    if (!startModal.exam) return;
    try {
      setStartModal((prev) => ({ ...prev, loading: true }));
      const res = await examService.startExamAttempt(startModal.exam._id);
      if (res.success) {
        navigate(`/exams/${startModal.exam._id}/attempt`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to start exam');
      setStartModal({ open: false, exam: null, loading: false });
    }
  };

  const filteredExams = exams.filter((exam) => {
    if (filterStatus === 'all') return true;
    const now = new Date();
    const start = new Date(exam.startTime);
    const end = new Date(exam.endTime);

    if (filterStatus === 'live') return now >= start && now < end && exam.status === 'published';
    if (filterStatus === 'upcoming') return now < start && exam.status === 'published';
    if (filterStatus === 'completed') return now >= end || exam.status === 'completed';
    return true;
  });

  return (
    <DashboardLayout roleTitle="STUDENT" pageTitle="Exams">
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-[var(--lms-accent)]/15 text-[var(--lms-accent)] border border-[var(--lms-accent)]/30">
                <Award size={22} />
              </div>
              <h1 className="text-2xl font-bold text-[var(--lms-text-primary)]">Exam Portal</h1>
            </div>
            <p className="text-xs text-[var(--lms-text-secondary)]">
              Scheduled and live examinations for your enrolled subjects.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {['all', 'live', 'upcoming', 'completed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  filterStatus === st
                    ? 'bg-[var(--lms-accent)] text-white shadow-sm'
                    : 'bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-hover)] border border-[var(--lms-border)]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="lms-glass-card h-64 rounded-2xl animate-pulse bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)]"
              />
            ))}
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="lms-glass-card border border-dashed border-[var(--lms-border)] rounded-2xl py-16 flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] flex items-center justify-center text-[var(--lms-text-muted)] mb-4">
              <Award size={32} />
            </div>
            <h3 className="text-base font-bold text-[var(--lms-text-primary)]">No Exams Found</h3>
            <p className="text-xs text-[var(--lms-text-muted)] mt-1 max-w-sm">
              {filterStatus !== 'all'
                ? `No ${filterStatus} examinations match your filter.`
                : 'There are currently no scheduled exams for your enrolled courses.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredExams.map((exam) => (
              <ExamCard
                key={exam._id}
                exam={exam}
                onEnter={(ex) => setStartModal({ open: true, exam: ex, loading: false })}
              />
            ))}
          </div>
        )}
      </div>

      <ExamStartModal
        isOpen={startModal.open}
        exam={startModal.exam}
        loading={startModal.loading}
        onClose={() => setStartModal({ open: false, exam: null, loading: false })}
        onConfirm={handleStartExamConfirm}
      />
    </DashboardLayout>
  );
};

export default StudentExams;
