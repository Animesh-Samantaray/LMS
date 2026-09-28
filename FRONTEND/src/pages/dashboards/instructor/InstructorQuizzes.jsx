import React, { useState, useEffect } from 'react';
import { BookOpen, HelpCircle, Plus, Loader, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../services/api.service';
import QuizCard from '../../../components/QuizCard';
import QuizBuilderModal from '../../../components/QuizBuilderModal';

export default function InstructorQuizzes() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [error, setError] = useState('');

  const [quizBuilderModal, setQuizBuilderModal] = useState({ open: false, isEdit: false, data: null });
  const [quizActionId, setQuizActionId] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchQuizzes(selectedCourseId);
    } else {
      setQuizzes([]);
    }
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/courses/instructor/my');
      setCourses(res.data.courses || []);
      if (res.data.courses?.length > 0) {
        setSelectedCourseId(res.data.courses[0]._id);
      }
    } catch (err) {
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async (courseId) => {
    try {
      setLoadingQuizzes(true);
      const res = await api.get(`/api/quizzes/course/${courseId}`);
      setQuizzes(res.data.quizzes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const handleDeleteQuiz = async (id) => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      setQuizActionId(id);
      await api.delete(`/api/quizzes/${id}`);
      setQuizzes((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setQuizActionId(null);
    }
  };

  return (
    <DashboardLayout roleTitle="INSTRUCTOR" pageTitle="Manage Quizzes">
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--lms-text-primary)]">Quizzes</h1>
            <p className="text-sm text-[var(--lms-text-muted)]">Create and manage quizzes across your courses</p>
          </div>
          {selectedCourseId && (
            <button
              onClick={() => setQuizBuilderModal({ open: true, isEdit: false, data: null })}
              className="lms-btn lms-btn-primary flex items-center gap-2"
            >
              <Plus size={16} /> Create Quiz
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 text-rose-500 rounded-xl flex items-center gap-2">
            <AlertCircle size={18} /> {error}
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
                className="w-full appearance-none bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl pl-10 pr-10 py-3 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)]"
              >
                <option value="" disabled>-- Choose a course --</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
              <BookOpen size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--lms-text-muted)]" />
            </div>
          </div>

          <div>
            {loading || loadingQuizzes ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader size={32} className="animate-spin text-[var(--lms-accent)] mb-3" />
                <p className="text-sm text-[var(--lms-text-muted)]">Loading quizzes...</p>
              </div>
            ) : !selectedCourseId ? (
              <div className="py-12 text-center text-[var(--lms-text-muted)]">
                Please select a course to view its quizzes.
              </div>
            ) : quizzes.length === 0 ? (
              <div className="py-12 text-center bg-[var(--lms-surface-subtle)] border border-dashed border-[var(--lms-border)] rounded-2xl">
                <HelpCircle size={40} className="text-[var(--lms-border)] mx-auto mb-3" />
                <p className="text-sm font-bold text-[var(--lms-text-primary)]">No quizzes found</p>
                <p className="text-xs text-[var(--lms-text-muted)] mt-1">Create a quiz for this course to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {quizzes.map(qz => (
                  <QuizCard
                    key={qz._id}
                    quiz={qz}
                    canManage={true}
                    onView={(q) => setQuizBuilderModal({ open: true, isEdit: true, data: q })}
                    onEdit={(q) => setQuizBuilderModal({ open: true, isEdit: true, data: q })}
                    onDelete={handleDeleteQuiz}
                    isDeleting={quizActionId === qz._id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <QuizBuilderModal
        isOpen={quizBuilderModal.open}
        isEdit={quizBuilderModal.isEdit}
        quiz={quizBuilderModal.data}
        courseId={selectedCourseId}
        onClose={() => {
          setQuizBuilderModal({ open: false, isEdit: false, data: null });
          fetchQuizzes(selectedCourseId);
        }}
      />
    </DashboardLayout>
  );
}
