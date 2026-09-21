import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Send, AlertCircle, BookOpen, Clock, Globe, Archive, Loader, MoreVertical, LayoutGrid, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../services/api.service';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(null); // id of course being published

  const sidebarItems = [
    { label: 'Overview', path: '/instructor/dashboard', icon: '🏠' },
    { category: 'Manager' },
    { label: 'My Courses', path: '/instructor/courses', icon: '📚' },
    { label: 'View Students', path: '#', icon: '👥' },
    { label: 'Course Progress', path: '#', icon: '📖' },
    { label: 'Exam Progress', path: '#', icon: '📝' },
    { label: 'Certificates', path: '#', icon: '🎖️' },
    { category: 'Account' },
    { label: 'Settings', path: '/instructor/profile', icon: '⚙️' }
  ];

  useEffect(() => {
    fetchMyCourses();
  }, []);

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
      setIsDeleting(true);
      await api.delete(`/api/courses/${id}`);
      setSuccess('Course deleted successfully');
      setCourses(courses.filter(c => c._id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete course');
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
      clearFeedback();
    }
  };

  const handlePublish = async (id) => {
    try {
      setIsPublishing(id);
      await api.patch(`/api/courses/${id}/publish`);
      setSuccess('Course published successfully!');
      fetchMyCourses();
    } catch (err) {
      setError(err.message || 'Failed to publish course');
    } finally {
      setIsPublishing(null);
      clearFeedback();
    }
  };

  const clearFeedback = () => {
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 5000);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'published':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200"><Globe size={12} /> Published</span>;
      case 'archived':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gray-100 text-gray-700 border border-gray-200"><Archive size={12} /> Archived</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-100 text-amber-700 border border-amber-200"><Clock size={12} /> Draft</span>;
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} roleTitle="MENTOR">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--lms-text-primary)]">My Courses</h1>
            <p className="text-[var(--lms-text-secondary)] text-sm">Create, manage, and publish your content.</p>
          </div>
          <Link 
            to="/instructor/courses/create"
            className="lms-btn lms-btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> Create New Course
          </Link>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} /> {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-600 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} /> {success}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="flex flex-col items-center gap-3 text-blue-500">
              <Loader className="animate-spin" size={32} />
              <span className="text-sm font-medium">Loading your courses...</span>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl">
            <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto mb-5 text-blue-500">
              <BookOpen size={36} />
            </div>
            <h3 className="text-xl font-bold text-[var(--lms-text-primary)] mb-2">You haven't created any courses yet</h3>
            <p className="text-[var(--lms-text-secondary)] mb-6 max-w-md mx-auto">Start sharing your knowledge by creating your first online course. It only takes a few minutes to get started.</p>
            <Link to="/instructor/courses/create" className="lms-btn lms-btn-primary inline-flex items-center gap-2">
              <Plus size={18} /> Start Creating
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-[var(--lms-surface)] rounded-2xl overflow-hidden shadow-sm border border-[var(--lms-border)] flex flex-col hover:shadow-md transition-shadow group relative">
                
                {/* Thumbnail */}
                <div className="h-40 bg-gray-100 relative overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-300">
                      <LayoutGrid size={48} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(course.status)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-[var(--lms-text-primary)] text-lg line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-[var(--lms-text-secondary)] text-sm line-clamp-2 mb-4 flex-1">
                    {course.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--lms-text-muted)] pt-4 border-t border-[var(--lms-border)]">
                    <span>{course.category?.name || 'Uncategorized'}</span>
                    <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions Overlay for Desktop / Actions Row for Mobile */}
                <div className="p-4 border-t border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex items-center gap-2 flex-wrap">
                  
                  {deleteConfirmId === course._id ? (
                    <div className="flex items-center gap-2 w-full justify-between">
                      <span className="text-xs text-red-500 font-bold">Delete course?</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleDelete(course._id)} disabled={isDeleting} className="px-3 py-1 bg-red-500 text-white rounded text-xs font-bold hover:bg-red-600">Yes</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-xs font-bold hover:bg-gray-300">No</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => navigate(`/course/${course._id}`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-[var(--lms-border)] rounded-lg text-xs font-semibold text-[var(--lms-text-primary)] hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        <Eye size={14} /> View
                      </button>
                      <button onClick={() => navigate(`/instructor/courses/${course._id}/edit`)} className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-white border border-[var(--lms-border)] rounded-lg text-xs font-semibold text-[var(--lms-text-primary)] hover:bg-gray-50 hover:text-blue-600 transition-colors">
                        <Edit2 size={14} /> Edit
                      </button>
                      
                      {course.status === 'draft' && (
                        <button 
                          onClick={() => handlePublish(course._id)} 
                          disabled={isPublishing === course._id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors"
                        >
                          {isPublishing === course._id ? <Loader size={14} className="animate-spin" /> : <Send size={14} />} Publish
                        </button>
                      )}
                      
                      <button onClick={() => setDeleteConfirmId(course._id)} className="p-2 bg-white border border-[var(--lms-border)] rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default MyCourses;
