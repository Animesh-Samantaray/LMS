import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle, FolderOpen, Loader } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../services/api.service';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ name: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Sidebar config matches AdminDashboard
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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/categories');
      setCategories(res.data.categories || res.data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setCurrentCategory(cat);
      setIsEditing(true);
    } else {
      setCurrentCategory({ name: '', description: '' });
      setIsEditing(false);
    }
    setIsModalOpen(true);
    setSuccess('');
    setError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCategory({ name: '', description: '' });
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError('');
      if (isEditing) {
        await api.put(`/api/categories/${currentCategory._id}`, currentCategory);
        setSuccess('Category updated successfully!');
      } else {
        await api.post('/api/categories', currentCategory);
        setSuccess('Category created successfully!');
      }
      fetchCategories();
      handleCloseModal();
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/api/categories/${id}`);
      setSuccess('Category deleted successfully!');
      fetchCategories();
    } catch (err) {
      setError(err.message || 'Failed to delete category');
      setLoading(false);
    }
    setDeleteConfirmId(null);
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} roleTitle="ADMIN">
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--lms-text-primary)]">Category Management</h1>
            <p className="text-[var(--lms-text-secondary)] text-sm">Organize and manage course categories.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            className="lms-btn lms-btn-primary flex items-center gap-2"
          >
            <Plus size={18} /> Add Category
          </button>
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
        {loading && !categories.length ? (
          <div className="flex items-center justify-center p-12">
            <Loader className="animate-spin text-blue-500" size={32} />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-xl">
            <FolderOpen className="mx-auto text-[var(--lms-text-muted)] mb-4" size={48} />
            <h3 className="text-lg font-bold text-[var(--lms-text-primary)]">No Categories Yet</h3>
            <p className="text-[var(--lms-text-secondary)] mt-2">Create the first category to get started.</p>
          </div>
        ) : (
          <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[var(--lms-surface-subtle)] border-b border-[var(--lms-border)] text-[10px] uppercase tracking-wider text-[var(--lms-text-muted)] font-bold">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--lms-border)]">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-[var(--lms-surface-subtle)] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[var(--lms-text-primary)] text-sm">
                        {cat.name}
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--lms-text-secondary)] max-w-md truncate">
                        {cat.description || 'No description'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-full bg-emerald-100/50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {deleteConfirmId === cat._id ? (
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-red-500 font-medium">Sure?</span>
                            <button onClick={() => handleDelete(cat._id)} className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Yes</button>
                            <button onClick={() => setDeleteConfirmId(null)} className="text-xs px-2 py-1 bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] border border-[var(--lms-border)] rounded hover:bg-[var(--lms-border)]">No</button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => handleOpenModal(cat)} className="text-blue-500 hover:bg-blue-50/50 p-2 rounded transition-colors border border-transparent hover:border-blue-100" title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => setDeleteConfirmId(cat._id)} className="text-red-500 hover:bg-red-50/50 p-2 rounded transition-colors border border-transparent hover:border-red-100" title="Delete">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--lms-surface)] rounded-2xl w-full max-w-md shadow-2xl border border-[var(--lms-border)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--lms-border)] flex justify-between items-center bg-[var(--lms-surface-subtle)]">
              <h2 className="text-lg font-bold text-[var(--lms-text-primary)]">
                {isEditing ? 'Edit Category' : 'Create Category'}
              </h2>
              <button onClick={handleCloseModal} className="text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] transition-colors">
                <AlertCircle size={20} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-2">Category Name</label>
                <input 
                  type="text" 
                  required
                  value={currentCategory.name}
                  onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
                  className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-lg px-4 py-3 text-sm text-[var(--lms-text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-[var(--lms-text-muted)]"
                  placeholder="e.g. Web Development"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-2">Description</label>
                <textarea 
                  rows="3"
                  value={currentCategory.description}
                  onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
                  className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-lg px-4 py-3 text-sm text-[var(--lms-text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-[var(--lms-text-muted)]"
                  placeholder="Optional description..."
                ></textarea>
              </div>
              
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--lms-border)]">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-semibold text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)] rounded-lg transition-colors border border-transparent hover:border-[var(--lms-border)]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="lms-btn lms-btn-primary px-6 py-2.5 flex items-center gap-2 text-sm"
                >
                  {isSaving && <Loader size={16} className="animate-spin" />}
                  {isEditing ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default CategoryManagement;
