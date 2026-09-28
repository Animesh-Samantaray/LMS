import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, Plus, Loader, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../services/api.service';
import AssignmentCard from '../../../components/AssignmentCard';
import AssignmentModal from '../../../components/AssignmentModal';
import AssignmentDetailModal from '../../../components/AssignmentDetailModal';
import AssignmentSubmissionsModal from '../../../components/AssignmentSubmissionsModal';

export default function InstructorAssignments() {
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [error, setError] = useState('');

  const [assignmentModal, setAssignmentModal] = useState({ open: false, isEdit: false, data: null });
  const [assignmentDetailModal, setAssignmentDetailModal] = useState({ open: false, data: null });
  const [submissionsModal, setSubmissionsModal] = useState({ open: false, data: null });
  const [assignmentActionId, setAssignmentActionId] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchAssignments(selectedCourseId);
    } else {
      setAssignments([]);
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

  const fetchAssignments = async (courseId) => {
    try {
      setLoadingAssignments(true);
      const res = await api.get(`/api/assignments/course/${courseId}`);
      setAssignments(res.data.assignments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleCreateOrEditAssignment = async (formData) => {
    try {
      if (!selectedCourseId) return;
      if (assignmentModal.isEdit) {
        await api.put(`/api/assignments/${assignmentModal.data._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post(`/api/assignments/course/${selectedCourseId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setAssignmentModal({ open: false, isEdit: false, data: null });
      fetchAssignments(selectedCourseId);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      setAssignmentActionId(id);
      await api.delete(`/api/assignments/${id}`);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      setAssignmentActionId(null);
    }
  };

  const handlePublishAssignment = async (id) => {
    try {
      setAssignmentActionId(id);
      await api.patch(`/api/assignments/${id}/publish`);
      setAssignments((prev) => prev.map((a) => (a._id === id ? { ...a, status: 'published' } : a)));
    } catch (err) {
      console.error(err);
    } finally {
      setAssignmentActionId(null);
    }
  };

  return (
    <DashboardLayout roleTitle="INSTRUCTOR" pageTitle="Manage Assignments">
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--lms-text-primary)]">Assignments</h1>
            <p className="text-sm text-[var(--lms-text-muted)]">Create and manage assignments across your courses</p>
          </div>
          {selectedCourseId && (
            <button
              onClick={() => setAssignmentModal({ open: true, isEdit: false, data: null })}
              className="lms-btn lms-btn-primary flex items-center gap-2"
            >
              <Plus size={16} /> Create Assignment
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
            {loading || loadingAssignments ? (
              <div className="py-12 flex flex-col items-center justify-center">
                <Loader size={32} className="animate-spin text-[var(--lms-accent)] mb-3" />
                <p className="text-sm text-[var(--lms-text-muted)]">Loading assignments...</p>
              </div>
            ) : !selectedCourseId ? (
              <div className="py-12 text-center text-[var(--lms-text-muted)]">
                Please select a course to view its assignments.
              </div>
            ) : assignments.length === 0 ? (
              <div className="py-12 text-center bg-[var(--lms-surface-subtle)] border border-dashed border-[var(--lms-border)] rounded-2xl">
                <FileText size={40} className="text-[var(--lms-border)] mx-auto mb-3" />
                <p className="text-sm font-bold text-[var(--lms-text-primary)]">No assignments found</p>
                <p className="text-xs text-[var(--lms-text-muted)] mt-1">Create an assignment for this course to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {assignments.map(asgn => (
                  <AssignmentCard
                    key={asgn._id}
                    assignment={asgn}
                    canManage={true}
                    onView={(a) => setAssignmentDetailModal({ open: true, data: a })}
                    onSubmissions={(a) => setSubmissionsModal({ open: true, data: a })}
                    onEdit={(a) => setAssignmentModal({ open: true, isEdit: true, data: a })}
                    onPublish={handlePublishAssignment}
                    onDelete={handleDeleteAssignment}
                    isPublishing={assignmentActionId === asgn._id}
                    isDeleting={assignmentActionId === asgn._id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AssignmentModal
        isOpen={assignmentModal.open}
        isEdit={assignmentModal.isEdit}
        assignment={assignmentModal.data}
        onClose={() => setAssignmentModal({ open: false, isEdit: false, data: null })}
        onSubmit={handleCreateOrEditAssignment}
      />

      <AssignmentDetailModal
        isOpen={assignmentDetailModal.open}
        assignment={assignmentDetailModal.data}
        onClose={() => setAssignmentDetailModal({ open: false, data: null })}
      />

      <AssignmentSubmissionsModal
        isOpen={submissionsModal.open}
        assignment={submissionsModal.data}
        onClose={() => setSubmissionsModal({ open: false, data: null })}
      />
    </DashboardLayout>
  );
}
