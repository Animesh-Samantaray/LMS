import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle, FolderOpen, Loader, Home, Users, BookOpen, Sparkles, Settings, X } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../services/api.service';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ name: '', description: '', status: 'active' });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const sidebarItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: Home },
    { category: 'Administration' },
    { label: 'Manage Users', path: '/admin/users', icon: Users },
    { category: 'Management' },
    { label: 'Categories', path: '/admin/categories', icon: FolderOpen },
    { label: 'Courses', path: '/admin/courses', icon: BookOpen },
    { label: 'Certificates', path: '#', icon: Sparkles },
    { category: 'Account' },
    { label: 'Settings', path: '/admin/profile', icon: Settings }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const clearMessages = () => {
    setTimeout(() => {
      setError('');
      setSuccess('');
    }, 4000);
  };

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
      setCurrentCategory({
        _id: cat._id,
        name: cat.name || '',
        description: cat.description || '',
        status: cat.status || 'active'
      });
      setIsEditing(true);
    } else {
      setCurrentCategory({ name: '', description: '', status: 'active' });
      setIsEditing(false);
    }
    setIsModalOpen(true);
    setSuccess('');
    setError('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentCategory({ name: '', description: '', status: 'active' });
    setIsEditing(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setError('');
      if (isEditing) {
        await api.put(`/api/categories/${currentCategory._id}`, {
          name: currentCategory.name,
          description: currentCategory.description,
          status: currentCategory.status
        });
        setSuccess('Category updated successfully!');
      } else {
        await api.post('/api/categories', {
          name: currentCategory.name,
          description: currentCategory.description
        });
        setSuccess('Category created successfully!');
      }
      fetchCategories();
      handleCloseModal();
      clearMessages();
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
      clearMessages();
    } catch (err) {
      setError(err.message || 'Failed to delete category');
      setLoading(false);
    }
    setDeleteConfirmId(null);
  };

  return (
    <DashboardLayout roleTitle="ADMIN">
      <div className="max-w-6xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--lms-text-primary)]">Category Management</h1>
            <p className="text-[var(--lms-text-secondary)] text-sm">Organize and manage course categories.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()} 
            className="lms-btn lms-btn-primary flex items-center gap-2 shadow-md shadow-indigo-500/20"
          >
            <Plus size={18} /> Add Category
          </button>
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

        {loading && !categories.length ? (
          <div className="flex items-center justify-center p-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-[var(--lms-border)] border-t-[var(--lms-accent)] rounded-full animate-spin"></div>
              <p className="text-xs text-[var(--lms-text-muted)] font-medium">Loading categories...</p>
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-16 lms-glass-card rounded-2xl border border-[var(--lms-border)]">
            <FolderOpen className="mx-auto text-[var(--lms-text-muted)] mb-3 opacity-60" size={48} />
            <h3 className="text-base font-bold text-[var(--lms-text-primary)]">No Categories Yet</h3>
            <p className="text-xs text-[var(--lms-text-secondary)] mt-1 max-w-sm mx-auto">Create the first category to get started organizing your platform courses.</p>
            <button onClick={() => handleOpenModal()} className="mt-4 lms-btn lms-btn-primary inline-flex items-center gap-2 text-xs">
              <Plus size={15} /> Create First Category
            </button>
          </div>
        ) : (
          <div className="lms-glass-card rounded-2xl overflow-hidden border border-[var(--lms-border)] shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[var(--lms-surface-subtle)] border-b border-[var(--lms-border)] text-[10px] uppercase tracking-wider text-[var(--lms-text-muted)] font-bold">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--lms-border-subtle)]">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-[var(--lms-surface-subtle)] transition-colors">
                      <td className="px-6 py-4 font-semibold text-[var(--lms-text-primary)] text-sm">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center shrink-0">
                            <FolderOpen size={15} />
                          </div>
                          <span>{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-[var(--lms-text-secondary)] max-w-md truncate">
                        {cat.description || 'No description provided'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          cat.status === 'inactive'
                            ? 'bg-slate-500/15 text-slate-500 border border-slate-500/25'
                            : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25'
                        }`}>
                          {cat.status || 'active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {deleteConfirmId === cat._id ? (
                          <div className="flex items-center justify-end gap-2 animate-fade-in">
                            <span className="text-xs text-rose-500 font-bold">Delete?</span>
                            <button onClick={() => handleDelete(cat._id)} className="text-xs px-2.5 py-1 bg-rose-500 text-white font-bold rounded-lg hover:bg-rose-600 transition-colors">Yes</button>
                            <button onClick={() => setDeleteConfirmId(null)} className="text-xs px-2.5 py-1 bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] border border-[var(--lms-border)] rounded-lg hover:bg-[var(--lms-surface-hover)] font-bold transition-colors">No</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button onClick={() => handleOpenModal(cat)} className="p-2 rounded-xl text-blue-500 hover:bg-blue-500/15 border border-transparent hover:border-blue-500/25 transition-colors" title="Edit Category">
                              <Edit2 size={15} />
                            </button>
                            <button onClick={() => setDeleteConfirmId(cat._id)} className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/25 transition-colors" title="Delete Category">
                              <Trash2 size={15} />
                            </button>
                          </div>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-transparent animate-fade-in">
          <div className="bg-[var(--lms-surface-elevated)] rounded-2xl w-full max-w-md shadow-2xl border border-[var(--lms-border)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--lms-border)] flex justify-between items-center bg-[var(--lms-surface-subtle)]">
              <h2 className="text-base font-bold text-[var(--lms-text-primary)]">
                {isEditing ? 'Edit Category' : 'Create New Category'}
              </h2>
              <button onClick={handleCloseModal} className="text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] transition-colors p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-2">Category Name <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={currentCategory.name}
                  onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})}
                  className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-4 py-3 text-sm text-[var(--lms-text-primary)] focus:outline-none focus:border-[var(--lms-accent)] focus:ring-1 focus:ring-[var(--lms-accent)] transition-all placeholder:text-[var(--lms-text-muted)] font-medium"
                  placeholder="e.g. Web Development"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-2">Description</label>
                <textarea 
                  rows="3"
                  value={currentCategory.description}
                  onChange={(e) => setCurrentCategory({...currentCategory, description: e.target.value})}
                  className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-4 py-3 text-sm text-[var(--lms-text-primary)] focus:outline-none focus:border-[var(--lms-accent)] focus:ring-1 focus:ring-[var(--lms-accent)] transition-all placeholder:text-[var(--lms-text-muted)] resize-none"
                  placeholder="Optional brief description..."
                ></textarea>
              </div>

              {isEditing && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)] mb-2">Status</label>
                  <select
                    value={currentCategory.status}
                    onChange={(e) => setCurrentCategory({...currentCategory, status: e.target.value})}
                    className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-4 py-3 text-sm text-[var(--lms-text-primary)] focus:outline-none focus:border-[var(--lms-accent)] transition-all font-medium"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
              
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[var(--lms-border)]">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-xs font-semibold text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)] rounded-xl transition-colors border border-transparent hover:border-[var(--lms-border)]"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="lms-btn lms-btn-primary px-5 py-2 flex items-center gap-2 text-xs font-bold shadow-md shadow-indigo-500/20"
                >
                  {isSaving && <Loader size={14} className="animate-spin" />}
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

