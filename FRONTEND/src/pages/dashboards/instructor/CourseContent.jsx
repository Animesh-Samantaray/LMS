import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Video, FileText, Link as LinkIcon, FileJson, ChevronDown, ChevronUp, Loader, AlertCircle, Home, BookOpen, Users, BarChart2 } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../services/api.service';

const CourseContent = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals state
  const [unitModal, setUnitModal] = useState({ open: false, isEdit: false, data: null });
  const [lessonModal, setLessonModal] = useState({ open: false, isEdit: false, unitId: null, data: null });
  
  // Form states
  const [unitForm, setUnitForm] = useState({ title: '', description: '' });
  const [lessonForm, setLessonForm] = useState({ title: '', description: '', contentType: 'Video', videoUrl: '', pdfUrl: '', externalUrl: '', duration: 0 });
  
  const [submitting, setSubmitting] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState({});

  const sidebarItems = [
    { label: 'Overview', path: '/instructor/dashboard', icon: Home },
    { category: 'Learning' },
    { label: 'All Courses', path: '/courses', icon: BookOpen },
    { label: 'My Courses', path: '/instructor/courses', icon: BookOpen },
    { category: 'Manager' },
    { label: 'View Students', path: '#', icon: Users },
    { label: 'Course Progress', path: '#', icon: BarChart2 },
  ];

  useEffect(() => {
    fetchCourseAndContent();
  }, [courseId]);

  const fetchCourseAndContent = async () => {
    try {
      setLoading(true);
      setError('');
      
      const courseRes = await api.get(`/api/courses/${courseId}`);
      if (courseRes.data.success) {
        setCourse(courseRes.data.course);
      }
      
      const unitsRes = await api.get(`/api/courses/${courseId}/units`);
      if (unitsRes.data.success) {
        setUnits(unitsRes.data.units);
        // Expand all by default
        const expanded = {};
        unitsRes.data.units.forEach(u => expanded[u._id] = true);
        setExpandedUnits(expanded);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course content.');
    } finally {
      setLoading(false);
    }
  };

  const toggleUnit = (unitId) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  // --- UNIT HANDLERS ---
  const handleOpenUnitModal = (unit = null) => {
    setUnitForm(unit ? { title: unit.title, description: unit.description || '' } : { title: '', description: '' });
    setUnitModal({ open: true, isEdit: !!unit, data: unit });
  };

  const handleSubmitUnit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (unitModal.isEdit) {
        await api.put(`/api/units/${unitModal.data._id}`, unitForm);
      } else {
        await api.post(`/api/courses/${courseId}/units`, unitForm);
      }
      setUnitModal({ open: false, isEdit: false, data: null });
      fetchCourseAndContent();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving unit');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm('Are you sure you want to delete this unit and all its lessons?')) return;
    try {
      await api.delete(`/api/units/${unitId}`);
      fetchCourseAndContent();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting unit');
    }
  };

  // --- LESSON HANDLERS ---
  const handleOpenLessonModal = (unitId, lesson = null) => {
    setLessonForm(lesson ? { 
      title: lesson.title, 
      description: lesson.description || '', 
      contentType: lesson.contentType,
      videoUrl: lesson.videoUrl || '',
      pdfUrl: lesson.pdfUrl || '',
      externalUrl: lesson.externalUrl || '',
      duration: lesson.duration || 0
    } : { title: '', description: '', contentType: 'Video', videoUrl: '', pdfUrl: '', externalUrl: '', duration: 0 });
    
    setLessonModal({ open: true, isEdit: !!lesson, unitId: lesson ? lesson.unitId : unitId, data: lesson });
  };

  const handleSubmitLesson = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (lessonModal.isEdit) {
        await api.put(`/api/lessons/${lessonModal.data._id}`, lessonForm);
      } else {
        await api.post(`/api/units/${lessonModal.unitId}/lessons`, lessonForm);
      }
      setLessonModal({ open: false, isEdit: false, unitId: null, data: null });
      fetchCourseAndContent();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving lesson');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await api.delete(`/api/lessons/${lessonId}`);
      fetchCourseAndContent();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting lesson');
    }
  };

  const getContentTypeIcon = (type) => {
    switch(type) {
      case 'Video': return <Video size={16} className="text-blue-500" />;
      case 'PDF': return <FileText size={16} className="text-rose-500" />;
      case 'External Link': return <LinkIcon size={16} className="text-emerald-500" />;
      default: return <FileJson size={16} className="text-gray-500" />;
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} roleTitle="INSTRUCTOR">
      <div className="max-w-4xl mx-auto pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to={`/instructor/courses/${courseId}/edit`} className="inline-flex items-center text-xs font-semibold text-[var(--lms-text-secondary)] hover:text-[var(--lms-accent)] mb-2">
              <ArrowLeft size={14} className="mr-1" /> Back to Edit Course
            </Link>
            <h1 className="text-2xl font-black text-[var(--lms-text-primary)] tracking-tight">Course Content</h1>
            {course && <p className="text-sm text-[var(--lms-text-secondary)] mt-1 font-medium">{course.title}</p>}
          </div>
          
          <button
            onClick={() => handleOpenUnitModal()}
            className="flex items-center gap-2 bg-[var(--lms-accent)] hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-indigo-500/25 transition-all"
          >
            <Plus size={16} /> Add Unit
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
            <AlertCircle size={18} className="text-rose-500 mt-0.5 shrink-0" />
            <p className="text-sm font-medium text-rose-500 dark:text-rose-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-3xl">
            <Loader size={32} className="text-[var(--lms-accent)] animate-spin mb-4" />
            <p className="text-sm text-[var(--lms-text-secondary)] font-medium">Loading course content...</p>
          </div>
        ) : units.length === 0 ? (
          <div className="text-center py-20 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <FileJson size={32} />
            </div>
            <h3 className="text-lg font-bold text-[var(--lms-text-primary)] mb-1">No content yet</h3>
            <p className="text-xs text-[var(--lms-text-secondary)] mb-6 max-w-md mx-auto">Start building your curriculum by adding your first unit.</p>
            <button
              onClick={() => handleOpenUnitModal()}
              className="inline-flex items-center gap-2 bg-[var(--lms-accent)] hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus size={16} /> Add Unit
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {units.map((unit, index) => (
              <div key={unit._id} className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl overflow-hidden shadow-sm">
                
                {/* Unit Header */}
                <div className="p-4 bg-[var(--lms-surface-subtle)] border-b border-[var(--lms-border)] flex items-center justify-between">
                  <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleUnit(unit._id)}>
                    <div className="w-8 h-8 rounded-lg bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] flex items-center justify-center text-xs font-bold text-[var(--lms-text-primary)]">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-[var(--lms-text-primary)] text-sm">{unit.title}</h3>
                      {unit.description && <p className="text-xs text-[var(--lms-text-muted)] line-clamp-1">{unit.description}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenUnitModal(unit)} className="p-1.5 text-[var(--lms-text-secondary)] hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDeleteUnit(unit._id)} className="p-1.5 text-[var(--lms-text-secondary)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                    <button onClick={() => toggleUnit(unit._id)} className="p-1.5 text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] rounded-lg transition-colors">
                      {expandedUnits[unit._id] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Lessons List */}
                {expandedUnits[unit._id] && (
                  <div className="p-4">
                    {unit.lessons && unit.lessons.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        {unit.lessons.map((lesson, lIndex) => (
                          <div key={lesson._id} className="flex items-center justify-between p-3 bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl group hover:border-[var(--lms-accent-border)] transition-colors">
                            <div className="flex items-center gap-3">
                              {getContentTypeIcon(lesson.contentType)}
                              <div>
                                <h4 className="text-xs font-semibold text-[var(--lms-text-primary)]">{lesson.title}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-medium text-[var(--lms-text-muted)]">{lesson.contentType}</span>
                                  {lesson.duration > 0 && (
                                    <>
                                      <span className="text-[10px] text-[var(--lms-border)]">•</span>
                                      <span className="text-[10px] text-[var(--lms-text-muted)]">{lesson.duration} min</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleOpenLessonModal(unit._id, lesson)} className="p-1.5 text-[var(--lms-text-secondary)] hover:text-indigo-500 bg-[var(--lms-surface)] hover:bg-indigo-50 dark:hover:bg-indigo-500/10 border border-[var(--lms-border)] rounded-lg transition-colors">
                                <Edit2 size={12} />
                              </button>
                              <button onClick={() => handleDeleteLesson(lesson._id)} className="p-1.5 text-[var(--lms-text-secondary)] hover:text-rose-500 bg-[var(--lms-surface)] hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-[var(--lms-border)] rounded-lg transition-colors">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[var(--lms-text-muted)] italic text-center py-4">No lessons in this unit yet.</p>
                    )}
                    
                    <button
                      onClick={() => handleOpenLessonModal(unit._id)}
                      className="w-full py-2 border-2 border-dashed border-[var(--lms-border)] hover:border-indigo-500/50 rounded-xl text-xs font-bold text-[var(--lms-text-secondary)] hover:text-indigo-500 transition-colors flex items-center justify-center gap-2 bg-[var(--lms-surface-subtle)]"
                    >
                      <Plus size={14} /> Add Lesson
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unit Modal */}
      {unitModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--lms-surface)] rounded-3xl w-full max-w-md shadow-2xl border border-[var(--lms-border)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--lms-border)] bg-[var(--lms-surface-subtle)]">
              <h3 className="text-lg font-bold text-[var(--lms-text-primary)]">{unitModal.isEdit ? 'Edit Unit' : 'Create New Unit'}</h3>
            </div>
            <form onSubmit={handleSubmitUnit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">Unit Title *</label>
                  <input
                    type="text"
                    required
                    value={unitForm.title}
                    onChange={e => setUnitForm({...unitForm, title: e.target.value})}
                    className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    placeholder="e.g. Introduction to React"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    value={unitForm.description}
                    onChange={e => setUnitForm({...unitForm, description: e.target.value})}
                    className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[100px]"
                    placeholder="Brief description of what this unit covers..."
                  ></textarea>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setUnitModal({ open: false })} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold border border-[var(--lms-border)] text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)]">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold bg-[var(--lms-accent)] text-white hover:bg-indigo-700 flex items-center justify-center">
                  {submitting ? <Loader size={16} className="animate-spin" /> : 'Save Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {lessonModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--lms-surface)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--lms-border)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] shrink-0">
              <h3 className="text-lg font-bold text-[var(--lms-text-primary)]">{lessonModal.isEdit ? 'Edit Lesson' : 'Add Lesson'}</h3>
            </div>
            <div className="p-6 overflow-y-auto">
              <form id="lesson-form" onSubmit={handleSubmitLesson} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">Lesson Title *</label>
                  <input
                    type="text"
                    required
                    value={lessonForm.title}
                    onChange={e => setLessonForm({...lessonForm, title: e.target.value})}
                    className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">Content Type *</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {['Video', 'PDF', 'External Link', 'Text'].map(type => (
                      <div 
                        key={type}
                        onClick={() => setLessonForm({...lessonForm, contentType: type})}
                        className={`cursor-pointer rounded-xl border p-2 flex flex-col items-center gap-1.5 transition-all ${lessonForm.contentType === type ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'border-[var(--lms-border)] text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)]'}`}
                      >
                        {getContentTypeIcon(type)}
                        <span className="text-[10px] font-bold text-center leading-tight">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {lessonForm.contentType === 'Video' && (
                  <div>
                    <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">Video URL *</label>
                    <input
                      type="url"
                      required
                      value={lessonForm.videoUrl}
                      onChange={e => setLessonForm({...lessonForm, videoUrl: e.target.value})}
                      className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                )}

                {lessonForm.contentType === 'PDF' && (
                  <div>
                    <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">PDF URL *</label>
                    <input
                      type="url"
                      required
                      value={lessonForm.pdfUrl}
                      onChange={e => setLessonForm({...lessonForm, pdfUrl: e.target.value})}
                      className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="https://example.com/document.pdf"
                    />
                  </div>
                )}

                {lessonForm.contentType === 'External Link' && (
                  <div>
                    <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">External Link URL *</label>
                    <input
                      type="url"
                      required
                      value={lessonForm.externalUrl}
                      onChange={e => setLessonForm({...lessonForm, externalUrl: e.target.value})}
                      className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      placeholder="https://example.com"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    min="0"
                    value={lessonForm.duration}
                    onChange={e => setLessonForm({...lessonForm, duration: e.target.value})}
                    className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">Description / Notes</label>
                  <textarea
                    value={lessonForm.description}
                    onChange={e => setLessonForm({...lessonForm, description: e.target.value})}
                    className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[80px]"
                  ></textarea>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex gap-3 shrink-0">
              <button type="button" onClick={() => setLessonModal({ open: false })} className="flex-1 px-4 py-2 rounded-xl text-sm font-bold border border-[var(--lms-border)] text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface)]">
                Cancel
              </button>
              <button type="submit" form="lesson-form" disabled={submitting} className="flex-1 px-4 py-2 rounded-xl text-sm font-bold bg-[var(--lms-accent)] text-white hover:bg-indigo-700 flex items-center justify-center">
                {submitting ? <Loader size={16} className="animate-spin" /> : 'Save Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default CourseContent;
