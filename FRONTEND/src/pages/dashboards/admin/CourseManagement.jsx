import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, Send, AlertCircle, BookOpen, Clock, Globe, Archive, Loader, MoreVertical, LayoutGrid, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../services/api.service';

const CourseManagement = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPublishing, setIsPublishing] = useState(null);

  const sidebarItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: '🏠' },
    { category: 'Administration' },
    { label: 'Approve Users', path: '#', icon: '✅' },
    { label: 'Manage Users', path: '#', icon: '👥' },
    { label: 'Manager List', path: '#', icon: '📋' },
    { label: 'Groups', path: '#', icon: '🏟️' },
    { category: 'Management' },
    { label: 'Categories', path: '/admin/categories', icon: '📁' },
    { label: 'Courses', path: '/admin/courses', icon: '📚' },
    { label: 'Approve Courses', path: '#', icon: '🎓' },
    { label: 'Assign Courses', path: '#', icon: '➕' },
    { label: 'Grace Timers', path: '#', icon: '⏱️' },
    { category: 'Engagement' },
    { label: 'Group messages', path: '#', icon: '💬' },
    { label: 'Support Queries', path: '#', icon: '❓' },
    { label: 'Certificates', path: '#', icon: '🎖️' },
    { category: 'Account' },
    { label: 'Settings', path: '/admin/profile', icon: '⚙️' }
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // For admin, we should fetch all courses. Let's try /api/courses
      const res = await api.get('/api/courses');
      setCourses(res.data.courses || res.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch courses');
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
      fetchCourses();
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
    <DashboardLayout sidebarItems={sidebarItems} roleTitle="ADMIN">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--lms-text-primary)]">Course Management</h1>
            <p className="text-[var(--lms-text-secondary)] text-sm">Oversee and manage all platform courses.</p>
          </div>
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
              <span className="text-sm font-medium">Loading platform courses...</span>
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl">
            <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto mb-5 text-blue-500">
              <BookOpen size={36} />
            </div>
            <h3 className="text-xl font-bold text-[var(--lms-text-primary)] mb-2">No courses found on the platform</h3>
            <p className="text-[var(--lms-text-secondary)] mb-6 max-w-md mx-auto">Instructors have not created any courses yet.</p>
          </div>
        ) : (
          <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[var(--lms-surface-subtle)] border-b border-[var(--lms-border)] text-[10px] uppercase tracking-wider text-[var(--lms-text-muted)] font-bold">
                  <tr>
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--lms-border)]">
                  {courses.map((course) => (
                    <tr key={course._id} className="hover:bg-[var(--lms-surface-subtle)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {course.thumbnail ? (
                              <img src={course.thumbnail} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50"><LayoutGrid size={14} /></div>
                            )}
                          </div>
                          <span className="font-semibold text-[var(--lms-text-primary)] text-sm line-clamp-1">{course.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--lms-text-secondary)]">
                        {course.category?.name || 'Uncategorized'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(course.status)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {deleteConfirmId === course._id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-red-500 font-medium">Sure?</span>
                            <button onClick={() => handleDelete(course._id)} className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Yes</button>
                            <button onClick={() => setDeleteConfirmId(null)} className="text-xs px-2 py-1 bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] border border-[var(--lms-border)] rounded hover:bg-[var(--lms-border)]">No</button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => navigate(`/course/${course._id}`)} className="text-blue-500 hover:bg-blue-50/50 p-2 rounded transition-colors border border-transparent hover:border-blue-100" title="View">
                              <Eye size={16} />
                            </button>
                            
                            {course.status === 'draft' && (
                              <button onClick={() => handlePublish(course._id)} disabled={isPublishing === course._id} className="text-emerald-500 hover:bg-emerald-50/50 p-2 rounded transition-colors border border-transparent hover:border-emerald-100" title="Publish">
                                {isPublishing === course._id ? <Loader size={16} className="animate-spin" /> : <Send size={16} />}
                              </button>
                            )}
                            
                            <button onClick={() => setDeleteConfirmId(course._id)} className="text-red-500 hover:bg-red-50/50 p-2 rounded transition-colors border border-transparent hover:border-red-100" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default CourseManagement;
