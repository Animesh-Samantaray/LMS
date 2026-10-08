import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Award,
  Plus,
  Loader,
  AlertCircle,
  HelpCircle,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  FileQuestion,
  Trophy,
} from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../services/api.service';
import examService from '../../../services/exam.service';
import { ExamStatusBadge } from '../../../components/exam/ExamStatusBadge';
import { ExamBuilderModal } from './ExamBuilderModal';

export default function InstructorExams() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingExams, setLoadingExams] = useState(false);
  const [error, setError] = useState('');

  const [examModal, setExamModal] = useState({ open: false, exam: null });
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchExams(selectedCourseId);
    } else {
      setExams([]);
    }
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/courses/instructor/my');
      const courseList = res.data.courses || [];
      setCourses(courseList);
      if (courseList.length > 0) {
        setSelectedCourseId(courseList[0]._id);
      }
    } catch (err) {
      setError('Failed to fetch instructor courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchExams = async (courseId) => {
    try {
      setLoadingExams(true);
      const res = await examService.getCourseExams(courseId);
      setExams(res.exams || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExams(false);
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam and its questions?')) return;
    try {
      setActionId(id);
      await examService.deleteExam(id);
      setExams((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  return (
    <DashboardLayout roleTitle="INSTRUCTOR" pageTitle="Manage Examinations">
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--lms-text-primary)]">Examinations</h1>
            <p className="text-xs text-[var(--lms-text-muted)]">
              Create, configure, and manage scheduled assessments across your courses
            </p>
          </div>
          {selectedCourseId && (
            <button
              onClick={() => setExamModal({ open: true, exam: null })}
              className="lms-btn lms-btn-primary flex items-center gap-2"
            >
              <Plus size={16} /> Create Exam
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 text-rose-500 rounded-xl flex items-center gap-2 text-xs font-semibold">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="lms-glass-card rounded-2xl p-6 border border-[var(--lms-border)] shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
              Select Course
            </label>
            <div className="relative max-w-md">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full appearance-none bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl pl-10 pr-10 py-3 text-xs font-semibold text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)]"
              >
                <option value="" disabled>
                  -- Choose a course --
                </option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <BookOpen
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--lms-text-muted)]"
              />
            </div>
          </div>

          <div>
            {loading || loadingExams ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader size={32} className="animate-spin text-[var(--lms-accent)] mb-3" />
                <p className="text-xs text-[var(--lms-text-muted)]">Loading course examinations...</p>
              </div>
            ) : !selectedCourseId ? (
              <div className="py-12 text-center text-xs text-[var(--lms-text-muted)]">
                Please select a course to view examinations.
              </div>
            ) : exams.length === 0 ? (
              <div className="py-12 text-center bg-[var(--lms-surface-subtle)] border border-dashed border-[var(--lms-border)] rounded-2xl p-6">
                <Award size={36} className="text-[var(--lms-border)] mx-auto mb-2" />
                <p className="text-sm font-bold text-[var(--lms-text-primary)]">No Exams Created</p>
                <p className="text-xs text-[var(--lms-text-muted)] mt-1">
                  Create a timed exam with multiple choice questions for enrolled students.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map((ex) => {
                  const startTime = new Date(ex.startTime);
                  const endTime = new Date(ex.endTime);

                  return (
                    <div
                      key={ex._id}
                      className="lms-glass-card p-5 rounded-2xl border border-[var(--lms-border)] hover:border-[var(--lms-accent)]/40 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <ExamStatusBadge exam={ex} size="small" />
                          <span className="text-[11px] font-bold text-[var(--lms-accent)]">
                            {ex.totalMarks || 0} Marks
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-[var(--lms-text-primary)] mb-1">
                          {ex.title}
                        </h3>

                        <p className="text-xs text-[var(--lms-text-muted)] line-clamp-2 mb-3">
                          {ex.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2 text-xs text-[var(--lms-text-secondary)] pt-3 border-t border-[var(--lms-border)]/50">
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-[var(--lms-accent)]" />
                            <span>{ex.duration} mins</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FileQuestion size={13} className="text-[var(--lms-accent)]" />
                            <span>{ex.questionCount || 0} Questions</span>
                          </div>
                          <div className="col-span-2 text-[11px] text-[var(--lms-text-muted)] flex items-center gap-1">
                            <Calendar size={12} />
                            <span>
                              {startTime.toLocaleDateString([], { month: 'short', day: 'numeric' })}{' '}
                              {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                              {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[var(--lms-border)] flex items-center justify-between gap-2">
                        <button
                          onClick={() => navigate(`/instructor/exams/${ex._id}/questions`)}
                          className="flex-1 py-2 px-3 rounded-xl bg-[var(--lms-accent)] hover:bg-[var(--lms-accent-hover)] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <FileQuestion size={13} /> Manage Questions
                        </button>

                        <button
                          onClick={() => navigate(`/exams/${ex._id}/leaderboard`)}
                          className="p-2 rounded-xl bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-hover)] border border-[var(--lms-border)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-all"
                          title="View Leaderboard"
                        >
                          <Trophy size={14} className="text-amber-400" />
                        </button>

                        {ex.status === 'draft' && (
                          <>
                            <button
                              onClick={() => setExamModal({ open: true, exam: ex })}
                              className="p-2 rounded-xl bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-hover)] border border-[var(--lms-border)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-all"
                              title="Edit Details"
                            >
                              <Edit2 size={14} />
                            </button>

                            <button
                              onClick={() => handleDeleteExam(ex._id)}
                              disabled={actionId === ex._id}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                              title="Delete Exam"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <ExamBuilderModal
        isOpen={examModal.open}
        courseId={selectedCourseId}
        exam={examModal.exam}
        onClose={() => setExamModal({ open: false, exam: null })}
        onSaved={() => fetchExams(selectedCourseId)}
      />
    </DashboardLayout>
  );
}
