import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, BookOpen, Loader, CheckCircle, Home, Users, BarChart2, Sparkles, User } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import CourseCard from '../../../components/CourseCard';
import api from '../../../services/api.service';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [isPublishingId, setIsPublishingId] = useState(null);

  const sidebarItems = [
    { label: 'Overview', path: '/instructor/dashboard', icon: Home },
    { category: 'Learning' },
    { label: 'All Courses', path: '/courses', icon: BookOpen },
    { label: 'My Courses', path: '/instructor/courses', icon: BookOpen },
    { category: 'Manager' },
    { label: 'View Students', path: '#', icon: Users },
    { label: 'Course Progress', path: '#', icon: BarChart2 },
    { label: 'Certificates', path: '#', icon: Sparkles },
    { category: 'Account' },
    { label: 'Settings', path: '/instructor/profile', icon: User }
  ];

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const clearFeedback = () => {
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 4000);
  };

  const fetchMyCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/courses/instructor/my');
      setCourses(res.data.courses || res.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch your courses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setIsDeletingId(id);
      await api.delete(`/api/courses/${id}`);
      setSuccess('Course deleted successfully');
      setCourses((prev) => prev.filter((c) => c._id !== id));
      clearFeedback();
    } catch (err) {
      setError(err.message || 'Failed to delete course');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handlePublish = async (id) => {
    try {
      setIsPublishingId(id);
      await api.patch(`/api/courses/${id}/publish`);
      setSuccess('Course published successfully!');
      fetchMyCourses();
      clearFeedback();
    } catch (err) {
      setError(err.message || 'Failed to publish course');
    } finally {
      setIsPublishingId(null);
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} roleTitle="MENTOR">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--lms-text-primary)]">My Courses</h1>
            <p className="text-[var(--lms-text-secondary)] text-sm">Create, manage, and publish your content.</p>
          </div>
          <Link 
            to="/instructor/courses/create"
            className="lms-btn lms-btn-primary flex items-center gap-2 shadow-md shadow-indigo-500/20"
          >
            <Plus size={18} /> Create New Course
          </Link>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in">
            <CheckCircle size={18} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-[var(--lms-border)] border-t-[var(--lms-accent)] rounded-full animate-spin"></div>
              <p className="text-xs text-[var(--lms-text-muted)] font-medium">Loading your courses...</p>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 lms-glass-card rounded-2xl border border-[var(--lms-border)]">
            <div className="w-16 h-16 rounded-2xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <BookOpen size={32} />
            </div>
            <h3 className="text-lg font-bold text-[var(--lms-text-primary)] mb-1">You haven't created any courses yet</h3>
            <p className="text-xs text-[var(--lms-text-secondary)] mb-6 max-w-md mx-auto">Start sharing your knowledge by creating your first online course. It only takes a few minutes to get started.</p>
            <Link to="/instructor/courses/create" className="lms-btn lms-btn-primary inline-flex items-center gap-2 text-xs">
              <Plus size={16} /> Start Creating
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                isManagement={true}
                onPublish={handlePublish}
                onDelete={handleDelete}
                onEdit={(id) => navigate(`/instructor/courses/${id}/edit`)}
                isPublishing={isPublishingId === course._id}
                isDeleting={isDeletingId === course._id}
              />
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default MyCourses;

