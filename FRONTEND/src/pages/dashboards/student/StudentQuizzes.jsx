import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Clock, AlertCircle, Loader, PlayCircle } from 'lucide-react';
import quizService from '../../../services/quiz.service';
import DashboardLayout from '../../../components/DashboardLayout';

const StudentQuizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyQuizzes();
  }, []);

  const fetchMyQuizzes = async () => {
    try {
      setLoading(true);
      const res = await quizService.getMyQuizzes();
      if (res.success) {
        setQuizzes(res.quizzes);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = (quizId) => {
    navigate(`/student/quizzes/${quizId}/take`);
  };

  return (
    <DashboardLayout roleTitle="STUDENT" pageTitle="My Quizzes">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-600 border border-purple-500/30">
              <Target size={24} />
            </div>
            <h1 className="text-2xl font-bold text-[var(--lms-text-primary)]">My Quizzes</h1>
          </div>
          <p className="text-sm text-[var(--lms-text-secondary)]">View and attempt quizzes for your enrolled courses.</p>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-600 text-sm font-bold flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader size={32} className="animate-spin text-[var(--lms-accent)]" />
          </div>
        ) : quizzes.length === 0 ? (
          <div className="bg-[var(--lms-surface-subtle)] border border-dashed border-[var(--lms-border)] rounded-2xl py-16 flex flex-col items-center justify-center">
            <Target size={48} className="text-[var(--lms-border)] mb-4" />
            <h3 className="text-lg font-bold text-[var(--lms-text-secondary)]">No quizzes available</h3>
            <p className="text-sm text-[var(--lms-text-muted)] mt-1">Check back later when your instructors publish quizzes.</p>
          </div>
        ) : (
          <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--lms-surface-subtle)] border-b border-[var(--lms-border)]">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">Quiz Title</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">Course</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">Duration</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">Deadline</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--lms-border)]">
                  {quizzes.map((quiz) => {
                    const deadline = quiz.deadline ? new Date(quiz.deadline) : null;
                    const isExpired = deadline ? deadline < new Date() : false;

                    return (
                      <tr key={quiz._id} className="hover:bg-[var(--lms-surface-hover)] transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-sm text-[var(--lms-text-primary)]">{quiz.title}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-xs font-semibold text-[var(--lms-text-secondary)]">{quiz.courseTitle}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-xs text-[var(--lms-text-secondary)] font-semibold">
                            <Clock size={14} className="text-[var(--lms-accent)]" />
                            {quiz.duration} min
                          </div>
                        </td>
                        <td className="p-4">
                          {deadline ? (
                            <div className={`text-xs font-semibold ${isExpired ? 'text-rose-500' : 'text-[var(--lms-text-secondary)]'}`}>
                              {deadline.toLocaleString()}
                            </div>
                          ) : (
                            <span className="text-xs text-[var(--lms-text-muted)]">No deadline</span>
                          )}
                        </td>
                        <td className="p-4">
                          {isExpired ? (
                            <span className="inline-block px-3 py-1.5 rounded-lg bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
                              Ended
                            </span>
                          ) : (
                            <button
                              onClick={() => handleStartQuiz(quiz._id)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--lms-accent)] hover:bg-[var(--lms-accent-hover)] text-white text-xs font-bold transition-colors shadow-sm"
                            >
                              <PlayCircle size={14} />
                              Start Quiz
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentQuizzes;
