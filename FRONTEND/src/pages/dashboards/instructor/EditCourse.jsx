import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, AlertCircle, Loader } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../services/api.service';

const EditCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnail: ''
  });

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
    const fetchData = async () => {
      try {
        const [catRes, courseRes] = await Promise.all([
          api.get('/api/categories'),
          api.get(`/api/courses/${id}`)
        ]);
        
        setCategories(catRes.data.categories || catRes.data || []);
        
        const course = courseRes.data.course || courseRes.data;
        setFormData({
          title: course.title || '',
          description: course.description || '',
          category: course.category?._id || course.category || '',
          thumbnail: course.thumbnail || ''
        });
        
      } catch (err) {
        setError("Failed to load course data");
        console.error(err);
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, [id]);

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
      await api.put(`/api/courses/${id}`, formData);
      navigate('/instructor/courses');
    } catch (err) {
      setError(err.message || 'Failed to update course');
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} roleTitle="MENTOR">
        <div className="flex h-[50vh] items-center justify-center">
          <Loader className="animate-spin text-blue-500" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} roleTitle="MENTOR">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-full hover:bg-[var(--lms-surface-subtle)] transition-colors">
            <ArrowLeft size={20} className="text-[var(--lms-text-secondary)]" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--lms-text-primary)]">Edit Course</h1>
            <p className="text-[var(--lms-text-secondary)] text-sm">Update your course details.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <div className="bg-[var(--lms-surface)] rounded-2xl shadow-sm border border-[var(--lms-border)] overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
            
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[var(--lms-text-primary)] border-b border-[var(--lms-border)] pb-2">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-bold text-[var(--lms-text-secondary)] mb-2 uppercase tracking-wider">Course Title <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-4 py-3.5 text-[var(--lms-text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--lms-text-secondary)] mb-2 uppercase tracking-wider">Category <span className="text-red-500">*</span></label>
                <select 
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-4 py-3.5 text-[var(--lms-text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium appearance-none"
                >
                  <option value="">Select a category...</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--lms-text-secondary)] mb-2 uppercase tracking-wider">Description</label>
                <textarea 
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-4 py-3.5 text-[var(--lms-text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y"
                ></textarea>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[var(--lms-text-primary)] border-b border-[var(--lms-border)] pb-2">Media</h2>
              
              <div>
                <label className="block text-sm font-bold text-[var(--lms-text-secondary)] mb-2 uppercase tracking-wider">Thumbnail URL</label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <input 
                      type="url" 
                      name="thumbnail"
                      value={formData.thumbnail}
                      onChange={handleChange}
                      className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-4 py-3.5 text-[var(--lms-text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>
                
                {formData.thumbnail && (
                  <div className="mt-4 w-48 h-32 rounded-lg border border-[var(--lms-border)] overflow-hidden bg-[var(--lms-surface-subtle)] relative">
                    <img src={formData.thumbnail} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--lms-text-muted)] hidden">
                      <ImageIcon size={32} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--lms-border)] flex items-center justify-end gap-4">
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="px-6 py-3 font-semibold text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)] rounded-xl transition-colors border border-transparent hover:border-[var(--lms-border)]"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="lms-btn lms-btn-primary px-8 py-3 flex items-center gap-2 shadow-lg shadow-blue-500/25"
              >
                {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                Save Changes
              </button>
            </div>
          </form>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default EditCourse;
