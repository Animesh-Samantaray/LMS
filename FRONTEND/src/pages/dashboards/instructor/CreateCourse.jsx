import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, AlertCircle, Loader, Home, BookOpen, Plus, Users, BarChart2, Sparkles, User } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../services/api.service';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCats, setFetchingCats] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnail: ''
  });

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
    const getCats = async () => {
      try {
        const res = await api.get('/api/categories');
        const cats = res.data.categories || res.data || [];
        const activeCats = cats.filter(c => c.status !== 'inactive');
        setCategories(activeCats.length ? activeCats : cats);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setFetchingCats(false);
      }
    };
    getCats();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      setError('Title and Category are required.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      await api.post('/api/courses', formData);
      navigate('/instructor/courses');
    } catch (err) {
      setError(err.message || 'Failed to create course');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} roleTitle="MENTOR">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex items-center gap-4 mb-6">
          <button 
            type="button"
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-xl hover:bg-[var(--lms-surface-hover)] transition-colors text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--lms-text-primary)]">Create New Course</h1>
            <p className="text-[var(--lms-text-secondary)] text-sm">Start building your next online course.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="lms-glass-card rounded-2xl shadow-sm border border-[var(--lms-border)] overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            
            <div className="space-y-5">
              <h2 className="text-base font-bold text-[var(--lms-text-primary)] border-b border-[var(--lms-border)] pb-3">Course Information</h2>
              
              <div>
                <label className="block text-xs font-bold text-[var(--lms-text-secondary)] mb-2 uppercase tracking-wider">Course Title <span className="text-rose-500">*</span></label>
                <input 
                  type="text" 
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-4 py-3 text-sm text-[var(--lms-text-primary)] focus:outline-none focus:border-[var(--lms-accent)] focus:ring-1 focus:ring-[var(--lms-accent)] transition-all font-medium placeholder:text-[var(--lms-text-muted)]"
                  placeholder="e.g. Master React in 30 Days"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--lms-text-secondary)] mb-2 uppercase tracking-wider">Category <span className="text-rose-500">*</span></label>
                <select 
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  disabled={fetchingCats}
                  className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-4 py-3 text-sm text-[var(--lms-text-primary)] focus:outline-none focus:border-[var(--lms-accent)] focus:ring-1 focus:ring-[var(--lms-accent)] transition-all font-medium appearance-none"
                >
                  <option value="">Select a category...</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name || cat._id}>{cat.name}</option>
                  ))}
                </select>
                {fetchingCats && <p className="text-xs text-[var(--lms-accent)] mt-2 flex items-center gap-1.5"><Loader size={12} className="animate-spin" /> Loading categories from database...</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--lms-text-secondary)] mb-2 uppercase tracking-wider">Description <span className="text-rose-500">*</span></label>
                <textarea 
                  name="description"
                  required
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-4 py-3 text-sm text-[var(--lms-text-primary)] focus:outline-none focus:border-[var(--lms-accent)] focus:ring-1 focus:ring-[var(--lms-accent)] transition-all resize-y placeholder:text-[var(--lms-text-muted)]"
                  placeholder="What will students learn in this course?"
                ></textarea>
              </div>
            </div>

            <div className="space-y-5">
              <h2 className="text-base font-bold text-[var(--lms-text-primary)] border-b border-[var(--lms-border)] pb-3">Media & Thumbnail</h2>
              
              <div>
                <label className="block text-xs font-bold text-[var(--lms-text-secondary)] mb-2 uppercase tracking-wider">Thumbnail URL</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input 
                      type="url" 
                      name="thumbnail"
                      value={formData.thumbnail}
                      onChange={handleChange}
                      className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-4 py-3 text-sm text-[var(--lms-text-primary)] focus:outline-none focus:border-[var(--lms-accent)] focus:ring-1 focus:ring-[var(--lms-accent)] transition-all placeholder:text-[var(--lms-text-muted)]"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                
                {formData.thumbnail && (
                  <div className="mt-4 w-48 h-32 rounded-xl border border-[var(--lms-border)] overflow-hidden bg-[var(--lms-surface-subtle)] relative shadow-sm">
                    <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--lms-text-muted)] hidden">
                      <ImageIcon size={32} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--lms-border)] flex items-center justify-end gap-3">
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 text-xs font-semibold text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)] rounded-xl transition-colors border border-transparent hover:border-[var(--lms-border)]"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || fetchingCats}
                className="lms-btn lms-btn-primary px-6 py-2.5 flex items-center gap-2 text-xs font-bold shadow-md shadow-indigo-500/20"
              >
                {loading ? <Loader size={15} className="animate-spin" /> : <Save size={15} />}
                Create Course as Draft
              </button>
            </div>
          </form>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default CreateCourse;

