import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Video,
  FileText,
  Link as LinkIcon,
  FileJson,
  ChevronDown,
  ChevronUp,
  Loader,
  AlertCircle,
  Home,
  BookOpen,
  Users,
  BarChart2,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Globe,
  Code,
  FolderOpen,
  ExternalLink,
  Layers,
  Clock,
  Sparkles,
  Upload,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
  Archive,
  X
} from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../services/api.service';

const CourseContent = () => {
  const { id: courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals state
  const [unitModal, setUnitModal] = useState({ open: false, isEdit: false, data: null });
  const [lessonModal, setLessonModal] = useState({ open: false, isEdit: false, unitId: null, data: null });
  const [resourceModal, setResourceModal] = useState({ open: false, isEdit: false, lessonId: null, data: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: '', id: null, title: '', extraNote: '' });

  // Form states
  const [unitForm, setUnitForm] = useState({ title: '', description: '' });
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    contentType: 'Video',
    videoUrl: '',
    pdfUrl: '',
    externalUrl: '',
    duration: 0,
  });

  // Resource Form with Upload File (Automatic file type) & External URL support
  const [resourceSource, setResourceSource] = useState('upload'); // 'upload' | 'external'
  const [resourceForm, setResourceForm] = useState({
    title: '',
    description: '',
    type: 'Link',
    url: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState({});
  const [expandedLessons, setExpandedLessons] = useState({});
  const [lessonResources, setLessonResources] = useState({}); // { [lessonId]: [] }
  const [loadingResources, setLoadingResources] = useState({}); // { [lessonId]: boolean }

  const sidebarItems = [
    { label: 'Overview', path: '/instructor/dashboard', icon: Home },
    { category: 'Learning' },
    { label: 'All Courses', path: '/courses', icon: BookOpen },
    { label: 'My Courses', path: '/instructor/courses', icon: BookOpen },
    { category: 'Manager' },
    { label: 'View Students', path: '#', icon: Users },
    { label: 'Course Progress', path: '#', icon: BarChart2 },
  ];

  const showSuccessFeedback = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  const fetchCourseAndContent = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [courseRes, unitsRes] = await Promise.all([
        api.get(`/api/courses/${courseId}`),
        api.get(`/api/courses/${courseId}/units`),
      ]);

      if (courseRes.data.success || courseRes.data.course) {
        setCourse(courseRes.data.course || courseRes.data);
      }

      if (unitsRes.data.success || unitsRes.data.units) {
        const fetchedUnits = unitsRes.data.units || [];
        setUnits(fetchedUnits);

        setExpandedUnits((prev) => {
          if (Object.keys(prev).length === 0 && fetchedUnits.length > 0) {
            return { [fetchedUnits[0]._id]: true };
          }
          return prev;
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load course content.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseAndContent();
  }, [fetchCourseAndContent]);

  const toggleUnit = (unitId) => {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const toggleLesson = async (lessonId) => {
    const isExpanding = !expandedLessons[lessonId];
    setExpandedLessons((prev) => ({ ...prev, [lessonId]: isExpanding }));

    if (isExpanding && !lessonResources[lessonId]) {
      fetchResourcesForLesson(lessonId);
    }
  };

  const fetchResourcesForLesson = async (lessonId) => {
    try {
      setLoadingResources((prev) => ({ ...prev, [lessonId]: true }));
      const res = await api.get(`/api/resources/lesson/${lessonId}`);
      if (res.data.success || res.data.resources) {
        setLessonResources((prev) => ({
          ...prev,
          [lessonId]: res.data.resources || [],
        }));
      }
    } catch (err) {
      console.error('Failed to fetch resources for lesson', lessonId, err);
    } finally {
      setLoadingResources((prev) => ({ ...prev, [lessonId]: false }));
    }
  };

  // --- UNIT ACTIONS ---
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
        showSuccessFeedback('Unit updated successfully');
      } else {
        const res = await api.post(`/api/courses/${courseId}/units`, unitForm);
        showSuccessFeedback('Unit created successfully');
        if (res.data?.unit?._id) {
          setExpandedUnits((prev) => ({ ...prev, [res.data.unit._id]: true }));
        }
      }
      setUnitModal({ open: false, isEdit: false, data: null });
      fetchCourseAndContent();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error saving unit');
    } finally {
      setSubmitting(false);
    }
  };

  const requestDeleteUnit = (unit) => {
    const lessonCount = unit.lessons?.length || 0;
    setDeleteConfirm({
      open: true,
      type: 'unit',
      id: unit._id,
      title: unit.title,
      extraNote: lessonCount > 0 ? `This unit contains ${lessonCount} lesson(s). All lessons inside will be deleted.` : '',
    });
  };

  const handleReorderUnit = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= units.length) return;

    const newUnits = [...units];
    const [movedUnit] = newUnits.splice(index, 1);
    newUnits.splice(targetIndex, 0, movedUnit);
    setUnits(newUnits);

    try {
      const unitIds = newUnits.map((u) => u._id);
      await api.patch(`/api/courses/${courseId}/units/reorder`, { unitIds });
      showSuccessFeedback('Units reordered successfully');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reorder units');
      fetchCourseAndContent();
    }
  };

  // --- LESSON ACTIONS ---
  const handleOpenLessonModal = (unitId, lesson = null) => {
    setLessonForm(
      lesson
        ? {
            title: lesson.title,
            description: lesson.description || '',
            contentType: lesson.contentType || 'Video',
            videoUrl: lesson.videoUrl || '',
            pdfUrl: lesson.pdfUrl || '',
            externalUrl: lesson.externalUrl || '',
            duration: lesson.duration || 0,
          }
        : {
            title: '',
            description: '',
            contentType: 'Video',
            videoUrl: '',
            pdfUrl: '',
            externalUrl: '',
            duration: 0,
          }
    );

    setLessonModal({ open: true, isEdit: !!lesson, unitId: lesson ? lesson.unitId : unitId, data: lesson });
  };

  const handleSubmitLesson = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: lessonForm.title.trim(),
        description: lessonForm.description?.trim() || '',
        contentType: lessonForm.contentType,
        duration: Number(lessonForm.duration) || 0,
        videoUrl: lessonForm.contentType === 'Video' ? lessonForm.videoUrl?.trim() : '',
        pdfUrl: lessonForm.contentType === 'PDF' ? lessonForm.pdfUrl?.trim() : '',
        externalUrl: lessonForm.contentType === 'External Link' ? lessonForm.externalUrl?.trim() : '',
      };

      if (lessonModal.isEdit) {
        await api.put(`/api/lessons/${lessonModal.data._id}`, payload);
        showSuccessFeedback('Lesson updated successfully');
      } else {
        await api.post(`/api/units/${lessonModal.unitId}/lessons`, payload);
        showSuccessFeedback('Lesson created successfully');
      }
      setLessonModal({ open: false, isEdit: false, unitId: null, data: null });
      fetchCourseAndContent();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error saving lesson');
    } finally {
      setSubmitting(false);
    }
  };

  const requestDeleteLesson = (lesson) => {
    setDeleteConfirm({
      open: true,
      type: 'lesson',
      id: lesson._id,
      title: lesson.title,
      extraNote: 'This lesson and all its resources will be deleted.',
    });
  };

  const handleReorderLesson = async (unit, index, direction) => {
    const lessons = unit.lessons || [];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const newLessons = [...lessons];
    const [movedLesson] = newLessons.splice(index, 1);
    newLessons.splice(targetIndex, 0, movedLesson);

    setUnits((prev) =>
      prev.map((u) => (u._id === unit._id ? { ...u, lessons: newLessons } : u))
    );

    try {
      const lessonIds = newLessons.map((l) => l._id);
      await api.patch(`/api/units/${unit._id}/lessons/reorder`, { lessonIds });
      showSuccessFeedback('Lessons reordered successfully');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reorder lessons');
      fetchCourseAndContent();
    }
  };

  // --- FILE HANDLING ---
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // 100 MB Limit validation
    const maxSizeBytes = 100 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setFileError('File size must not exceed 100 MB.');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  // --- RESOURCE ACTIONS ---
  const handleOpenResourceModal = (lessonId, resource = null) => {
    setSelectedFile(null);
    setFileError('');

    if (resource) {
      setResourceSource(resource.source === 'upload' ? 'upload' : 'external');
      setResourceForm({
        title: resource.title || '',
        description: resource.description || '',
        type: resource.type || 'Link',
        url: resource.url || '',
      });
    } else {
      setResourceSource('upload');
      setResourceForm({
        title: '',
        description: '',
        type: 'Link',
        url: '',
      });
    }

    setResourceModal({ open: true, isEdit: !!resource, lessonId, data: resource });
  };

  const handleSubmitResource = async (e) => {
    e.preventDefault();
    setFileError('');

    if (resourceSource === 'upload' && !resourceModal.isEdit && !selectedFile) {
      setFileError('Please select a file to upload or switch to External URL.');
      return;
    }

    if (resourceSource === 'external' && (!resourceForm.url || !resourceForm.url.trim())) {
      setFileError('Please provide a valid external URL.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', resourceForm.title.trim());
      formData.append('description', resourceForm.description ? resourceForm.description.trim() : '');

      if (resourceSource === 'upload' && selectedFile) {
        formData.append('file', selectedFile);
      } else if (resourceSource === 'external' && resourceForm.url) {
        formData.append('url', resourceForm.url.trim());
        formData.append('type', resourceForm.type || 'Link');
      } else if (resourceModal.isEdit && resourceModal.data?.url) {
        formData.append('url', resourceModal.data.url);
        if (resourceModal.data?.type) {
          formData.append('type', resourceModal.data.type);
        }
      }

      const axiosConfig = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (resourceModal.isEdit) {
        await api.put(`/api/resources/${resourceModal.data._id}`, formData, axiosConfig);
        showSuccessFeedback('Resource updated successfully');
      } else {
        await api.post(`/api/resources/lesson/${resourceModal.lessonId}`, formData, axiosConfig);
        showSuccessFeedback('Resource created and uploaded successfully');
      }

      setResourceModal({ open: false, isEdit: false, lessonId: null, data: null });
      fetchResourcesForLesson(resourceModal.lessonId || resourceModal.data?.lessonId);
    } catch (err) {
      setFileError(err.response?.data?.message || err.message || 'Error saving resource');
    } finally {
      setSubmitting(false);
    }
  };

  const requestDeleteResource = (lessonId, resource) => {
    setDeleteConfirm({
      open: true,
      type: 'resource',
      id: resource._id,
      extraId: lessonId,
      title: resource.title,
      extraNote: 'This resource will be removed from this lesson.',
    });
  };

  const handleReorderResource = async (lessonId, index, direction) => {
    const resources = lessonResources[lessonId] || [];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= resources.length) return;

    const newResources = [...resources];
    const [movedResource] = newResources.splice(index, 1);
    newResources.splice(targetIndex, 0, movedResource);

    setLessonResources((prev) => ({
      ...prev,
      [lessonId]: newResources,
    }));

    try {
      const resourceIds = newResources.map((r) => r._id);
      await api.patch(`/api/resources/lesson/${lessonId}/reorder`, { resources: resourceIds });
      showSuccessFeedback('Resources reordered successfully');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reorder resources');
      fetchResourcesForLesson(lessonId);
    }
  };

  // --- CONFIRMED DELETION EXECUTION ---
  const handleConfirmDelete = async () => {
    const { type, id, extraId } = deleteConfirm;
    setSubmitting(true);
    try {
      if (type === 'unit') {
        await api.delete(`/api/units/${id}`);
        showSuccessFeedback('Unit deleted successfully');
        fetchCourseAndContent();
      } else if (type === 'lesson') {
        await api.delete(`/api/lessons/${id}`);
        showSuccessFeedback('Lesson deleted successfully');
        fetchCourseAndContent();
      } else if (type === 'resource') {
        await api.delete(`/api/resources/${id}`);
        showSuccessFeedback('Resource deleted successfully');
        if (extraId) {
          fetchResourcesForLesson(extraId);
        }
      }
      setDeleteConfirm({ open: false, type: '', id: null, title: '', extraNote: '' });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error executing delete');
    } finally {
      setSubmitting(false);
    }
  };

  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'Video':
        return <Video size={16} className="text-blue-500" />;
      case 'PDF':
        return <FileText size={16} className="text-rose-500" />;
      case 'External Link':
        return <Globe size={16} className="text-emerald-500" />;
      default:
        return <FileJson size={16} className="text-amber-500" />;
    }
  };

  const getResourceIcon = (resource) => {
    const mime = resource?.mimeType || '';
    const type = resource?.type || '';

    if (mime === 'application/pdf' || type === 'PDF') {
      return <FileText size={15} className="text-rose-500 shrink-0" />;
    }
    if (mime.startsWith('video/') || type === 'Video') {
      return <Video size={15} className="text-indigo-500 shrink-0" />;
    }
    if (mime.startsWith('image/') || type === 'Image') {
      return <ImageIcon size={15} className="text-purple-500 shrink-0" />;
    }
    if (
      mime.includes('spreadsheet') ||
      mime.includes('excel') ||
      type === 'Spreadsheet'
    ) {
      return <FileSpreadsheet size={15} className="text-emerald-600 shrink-0" />;
    }
    if (
      mime.includes('presentation') ||
      mime.includes('powerpoint') ||
      type === 'Presentation'
    ) {
      return <Presentation size={15} className="text-orange-500 shrink-0" />;
    }
    if (
      mime.includes('zip') ||
      mime.includes('compressed') ||
      type === 'ZIP'
    ) {
      return <Archive size={15} className="text-amber-500 shrink-0" />;
    }
    if (
      mime.includes('word') ||
      mime.includes('document') ||
      type === 'Document'
    ) {
      return <FileText size={15} className="text-blue-500 shrink-0" />;
    }
    if (type === 'Link' || resource?.source === 'external') {
      return <LinkIcon size={15} className="text-emerald-500 shrink-0" />;
    }
    return <FolderOpen size={15} className="text-slate-400 shrink-0" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const enrolledCount = Array.isArray(course?.enrolled) ? course.enrolled.length : 0;
  const categoryName = typeof course?.category === 'object' && course?.category !== null ? course.category.name : course?.category || 'General';

  return (
    <DashboardLayout sidebarItems={sidebarItems} roleTitle="INSTRUCTOR" pageTitle="Course Builder">
      <div className="max-w-5xl mx-auto pb-16 space-y-6">

        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/instructor/courses"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--lms-text-secondary)] hover:text-[var(--lms-accent)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to My Courses
          </Link>
          <Link
            to={`/instructor/courses/${courseId}/edit`}
            className="text-xs font-semibold text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] transition-colors"
          >
            Course Settings & Details
          </Link>
        </div>

        {/* Course Builder Header Card */}
        <div className="lms-glass-card rounded-3xl p-6 sm:p-8 border border-[var(--lms-border)] relative overflow-hidden shadow-lg">
          <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {course?.thumbnail ? (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-[var(--lms-border)] shrink-0 bg-slate-900 shadow-sm">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] flex items-center justify-center shrink-0 shadow-sm">
                  <Layers size={36} />
                </div>
              )}

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25">
                    {categoryName}
                  </span>

                  {course?.status === 'published' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                      <Globe size={11} /> Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                      <Clock size={11} /> Draft
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] border border-[var(--lms-border)]">
                    <Users size={12} className="text-[var(--lms-accent)]" /> {enrolledCount} {enrolledCount === 1 ? 'Student' : 'Students'}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[var(--lms-text-primary)] tracking-tight">
                  {course?.title || 'Course Builder'}
                </h1>

                <p className="text-xs sm:text-sm text-[var(--lms-text-secondary)] max-w-2xl line-clamp-2 leading-relaxed">
                  {course?.description || 'Manage your curriculum, lessons and learning resources.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => handleOpenUnitModal()}
              className="lms-btn lms-btn-primary flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold shadow-md shadow-indigo-500/25 shrink-0 self-stretch sm:self-auto justify-center"
            >
              <Plus size={16} /> Add Unit
            </button>
          </div>
        </div>

        {/* Notifications / Alerts */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 animate-fade-in">
            <AlertCircle size={18} className="text-rose-500 mt-0.5 shrink-0" />
            <p className="text-sm font-medium text-rose-500 dark:text-rose-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3 animate-fade-in">
            <CheckCircle size={18} className="text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-sm font-medium text-emerald-500 dark:text-emerald-400">{success}</p>
          </div>
        )}

        {/* Content Hierarchy Container */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 lms-glass-card rounded-3xl border border-[var(--lms-border)]">
            <Loader size={36} className="text-[var(--lms-accent)] animate-spin mb-4" />
            <p className="text-sm text-[var(--lms-text-secondary)] font-medium">Loading curriculum structure...</p>
          </div>
        ) : units.length === 0 ? (
          <div className="text-center py-20 lms-glass-card rounded-3xl border border-[var(--lms-border)] p-8">
            <div className="w-16 h-16 rounded-2xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Layers size={32} />
            </div>
            <h3 className="text-lg font-bold text-[var(--lms-text-primary)] mb-1">No units yet</h3>
            <p className="text-xs text-[var(--lms-text-secondary)] mb-6 max-w-md mx-auto">
              Start building your curriculum by adding the first unit. Each unit can hold multiple structured lessons and resources.
            </p>
            <button
              onClick={() => handleOpenUnitModal()}
              className="lms-btn lms-btn-primary inline-flex items-center gap-2 text-xs font-bold"
            >
              <Plus size={16} /> Add First Unit
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {units.map((unit, unitIndex) => {
              const isUnitExpanded = expandedUnits[unit._id];
              const lessons = unit.lessons || [];

              return (
                <div
                  key={unit._id}
                  className="lms-glass-card rounded-2xl overflow-hidden border border-[var(--lms-border)] shadow-sm transition-all duration-200"
                >
                  {/* UNIT HEADER */}
                  <div className="p-4 sm:p-5 bg-[var(--lms-surface-subtle)] border-b border-[var(--lms-border)] flex items-center justify-between gap-3">
                    <div
                      className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
                      onClick={() => toggleUnit(unit._id)}
                    >
                      <div className="w-9 h-9 rounded-xl bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] flex items-center justify-center text-xs font-extrabold text-[var(--lms-text-primary)] shrink-0 shadow-sm">
                        {String(unitIndex + 1).padStart(2, '0')}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[var(--lms-accent-text)] uppercase tracking-wider">
                            UNIT {String(unitIndex + 1).padStart(2, '0')}
                          </span>
                          <span className="text-[10px] font-semibold text-[var(--lms-text-muted)]">
                            • {lessons.length} {lessons.length === 1 ? 'Lesson' : 'Lessons'}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-[var(--lms-text-primary)] truncate">
                          {unit.title}
                        </h3>
                        {unit.description && (
                          <p className="text-xs text-[var(--lms-text-muted)] line-clamp-1 mt-0.5">
                            {unit.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Unit Action Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleReorderUnit(unitIndex, 'up')}
                        disabled={unitIndex === 0}
                        title="Move Unit Up"
                        className="p-1.5 text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface)] rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => handleReorderUnit(unitIndex, 'down')}
                        disabled={unitIndex === units.length - 1}
                        title="Move Unit Down"
                        className="p-1.5 text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface)] rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <div className="h-4 w-px bg-[var(--lms-border)] mx-1" />
                      <button
                        onClick={() => handleOpenUnitModal(unit)}
                        title="Edit Unit"
                        className="p-1.5 text-[var(--lms-text-secondary)] hover:text-[var(--lms-accent)] hover:bg-[var(--lms-surface)] rounded-lg transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => requestDeleteUnit(unit)}
                        title="Delete Unit"
                        className="p-1.5 text-[var(--lms-text-secondary)] hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                      <button
                        onClick={() => toggleUnit(unit._id)}
                        className="p-1.5 text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] rounded-lg transition-colors ml-1"
                        aria-label={isUnitExpanded ? 'Collapse Unit' : 'Expand Unit'}
                      >
                        {isUnitExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* EXPANDED UNIT: LESSONS LIST */}
                  {isUnitExpanded && (
                    <div className="p-4 sm:p-6 bg-[var(--lms-bg)] space-y-4">
                      {lessons.length === 0 ? (
                        <div className="text-center py-8 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-xl p-4">
                          <p className="text-xs font-semibold text-[var(--lms-text-primary)] mb-1">No lessons in this unit</p>
                          <p className="text-[11px] text-[var(--lms-text-muted)] mb-3">Add lessons to begin building this unit.</p>
                          <button
                            onClick={() => handleOpenLessonModal(unit._id)}
                            className="lms-btn lms-btn-primary inline-flex items-center gap-1.5 text-xs py-1.5 px-3"
                          >
                            <Plus size={13} /> Add Lesson
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {lessons.map((lesson, lessonIndex) => {
                            const isLessonExpanded = expandedLessons[lesson._id];
                            const resources = lessonResources[lesson._id] || [];
                            const isResLoading = loadingResources[lesson._id];

                            return (
                              <div
                                key={lesson._id}
                                className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-xl overflow-hidden shadow-sm transition-all"
                              >
                                {/* LESSON HEADER */}
                                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                                  <div
                                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                                    onClick={() => toggleLesson(lesson._id)}
                                  >
                                    <div className="w-7 h-7 rounded-lg bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] flex items-center justify-center text-[11px] font-bold text-[var(--lms-text-muted)] shrink-0">
                                      {String(lessonIndex + 1).padStart(2, '0')}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2">
                                        <h4 className="text-xs sm:text-sm font-bold text-[var(--lms-text-primary)] truncate">
                                          {lesson.title}
                                        </h4>
                                      </div>

                                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[var(--lms-text-muted)] font-medium">
                                        <span className="flex items-center gap-1">
                                          {getContentTypeIcon(lesson.contentType)}
                                          <span className="capitalize">{lesson.contentType}</span>
                                        </span>
                                        {lesson.duration > 0 && (
                                          <>
                                            <span>•</span>
                                            <span>{lesson.duration} min</span>
                                          </>
                                        )}
                                        {resources.length > 0 && (
                                          <>
                                            <span>•</span>
                                            <span className="text-[var(--lms-accent-text)] font-semibold">
                                              {resources.length} {resources.length === 1 ? 'Resource' : 'Resources'}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Lesson Action Controls */}
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => handleReorderLesson(unit, lessonIndex, 'up')}
                                      disabled={lessonIndex === 0}
                                      title="Move Lesson Up"
                                      className="p-1 text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] rounded transition-colors disabled:opacity-30"
                                    >
                                      <ArrowUp size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleReorderLesson(unit, lessonIndex, 'down')}
                                      disabled={lessonIndex === lessons.length - 1}
                                      title="Move Lesson Down"
                                      className="p-1 text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] rounded transition-colors disabled:opacity-30"
                                    >
                                      <ArrowDown size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleOpenLessonModal(unit._id, lesson)}
                                      title="Edit Lesson"
                                      className="p-1 text-[var(--lms-text-secondary)] hover:text-[var(--lms-accent)] rounded transition-colors"
                                    >
                                      <Edit2 size={13} />
                                    </button>
                                    <button
                                      onClick={() => requestDeleteLesson(lesson)}
                                      title="Delete Lesson"
                                      className="p-1 text-[var(--lms-text-secondary)] hover:text-rose-500 rounded transition-colors"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                    <button
                                      onClick={() => toggleLesson(lesson._id)}
                                      className="p-1 text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] rounded transition-colors ml-0.5"
                                      aria-label={isLessonExpanded ? 'Collapse Lesson' : 'Expand Lesson'}
                                    >
                                      {isLessonExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                  </div>
                                </div>

                                {/* EXPANDED LESSON DETAILS & RESOURCES */}
                                {isLessonExpanded && (
                                  <div className="p-4 sm:p-5 border-t border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] space-y-4">
                                    
                                    {/* Lesson Description */}
                                    {lesson.description && (
                                      <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)] block mb-1">
                                          Overview / Notes
                                        </span>
                                        <p className="text-xs text-[var(--lms-text-secondary)] leading-relaxed whitespace-pre-wrap">
                                          {lesson.description}
                                        </p>
                                      </div>
                                    )}

                                    {/* SUPPLEMENTARY RESOURCES SECTION */}
                                    <div className="pt-2 border-t border-[var(--lms-border)] space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                          <Sparkles size={14} className="text-[var(--lms-accent)]" />
                                          <span className="text-xs font-bold text-[var(--lms-text-primary)]">Lesson Resources</span>
                                          <span className="text-[10px] text-[var(--lms-text-muted)] font-medium">({resources.length})</span>
                                        </div>
                                        <button
                                          onClick={() => handleOpenResourceModal(lesson._id)}
                                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--lms-accent)] hover:text-indigo-600 bg-[var(--lms-accent-subtle)] px-2.5 py-1 rounded-lg border border-[var(--lms-accent-border)] transition-colors shadow-sm"
                                        >
                                          <Plus size={12} /> Add Resource
                                        </button>
                                      </div>

                                      {isResLoading ? (
                                        <div className="py-4 text-center">
                                          <Loader size={16} className="animate-spin text-[var(--lms-accent)] mx-auto" />
                                        </div>
                                      ) : resources.length === 0 ? (
                                        <div className="p-3.5 bg-[var(--lms-bg)] border border-dashed border-[var(--lms-border)] rounded-xl text-center">
                                          <p className="text-xs text-[var(--lms-text-muted)]">No resources attached</p>
                                          <p className="text-[10px] text-[var(--lms-text-muted)] opacity-80 mt-0.5">
                                            Upload PDFs, videos, images, documents, or external links.
                                          </p>
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          {resources.map((resItem, resIndex) => (
                                            <div
                                              key={resItem._id}
                                              className="flex items-center justify-between p-2.5 bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl group hover:border-[var(--lms-accent-border)] transition-colors text-xs"
                                            >
                                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                {getResourceIcon(resItem)}
                                                <div className="min-w-0 flex-1">
                                                  <div className="flex items-center gap-2">
                                                    <a
                                                      href={resItem.url}
                                                      target="_blank"
                                                      rel="noreferrer"
                                                      className="font-semibold text-[var(--lms-text-primary)] hover:text-[var(--lms-accent)] transition-colors truncate"
                                                    >
                                                      {resItem.title}
                                                    </a>
                                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--lms-surface)] border border-[var(--lms-border)] text-[var(--lms-text-muted)]">
                                                      {resItem.type}
                                                    </span>
                                                    {resItem.source === 'upload' && resItem.fileSize > 0 && (
                                                      <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                                        {formatFileSize(resItem.fileSize)}
                                                      </span>
                                                    )}
                                                  </div>
                                                  {resItem.description && (
                                                    <p className="text-[10px] text-[var(--lms-text-muted)] truncate mt-0.5">
                                                      {resItem.description}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>

                                              <div className="flex items-center gap-1 shrink-0 ml-2">
                                                <button
                                                  onClick={() => handleReorderResource(lesson._id, resIndex, 'up')}
                                                  disabled={resIndex === 0}
                                                  title="Move Resource Up"
                                                  className="p-1 text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] disabled:opacity-20"
                                                >
                                                  <ArrowUp size={11} />
                                                </button>
                                                <button
                                                  onClick={() => handleReorderResource(lesson._id, resIndex, 'down')}
                                                  disabled={resIndex === resources.length - 1}
                                                  title="Move Resource Down"
                                                  className="p-1 text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] disabled:opacity-20"
                                                >
                                                  <ArrowDown size={11} />
                                                </button>
                                                <a
                                                  href={resItem.url}
                                                  target="_blank"
                                                  rel="noreferrer"
                                                  title="Open / Download Resource"
                                                  className="p-1 text-[var(--lms-text-secondary)] hover:text-emerald-500 transition-colors"
                                                >
                                                  <ExternalLink size={12} />
                                                </a>
                                                <button
                                                  onClick={() => handleOpenResourceModal(lesson._id, resItem)}
                                                  title="Edit Resource"
                                                  className="p-1 text-[var(--lms-text-secondary)] hover:text-[var(--lms-accent)] transition-colors"
                                                >
                                                  <Edit2 size={12} />
                                                </button>
                                                <button
                                                  onClick={() => requestDeleteResource(lesson._id, resItem)}
                                                  title="Delete Resource"
                                                  className="p-1 text-[var(--lms-text-secondary)] hover:text-rose-500 transition-colors"
                                                >
                                                  <Trash2 size={12} />
                                                </button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Add Lesson Button */}
                          <button
                            onClick={() => handleOpenLessonModal(unit._id)}
                            className="w-full py-2.5 border-2 border-dashed border-[var(--lms-border)] hover:border-[var(--lms-accent)] rounded-xl text-xs font-bold text-[var(--lms-text-secondary)] hover:text-[var(--lms-accent)] transition-all flex items-center justify-center gap-2 bg-[var(--lms-surface)] shadow-sm"
                          >
                            <Plus size={14} /> Add Lesson to {unit.title}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: UNIT CREATE / EDIT                                */}
      {/* ========================================================= */}
      {unitModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--lms-surface)] rounded-3xl w-full max-w-md shadow-2xl border border-[var(--lms-border)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
                {unitModal.isEdit ? 'Edit Unit' : 'Create New Unit'}
              </h3>
              <button
                onClick={() => setUnitModal({ open: false, isEdit: false, data: null })}
                className="text-xs font-bold text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)]"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmitUnit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                  Unit Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={unitForm.title}
                  onChange={(e) => setUnitForm({ ...unitForm, title: e.target.value })}
                  className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)]"
                  placeholder="e.g. Java Fundamentals"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={unitForm.description}
                  onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                  className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)] min-h-[90px]"
                  placeholder="Brief description of the topics covered in this unit..."
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--lms-border)]">
                <button
                  type="button"
                  onClick={() => setUnitModal({ open: false, isEdit: false, data: null })}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold border border-[var(--lms-border)] text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--lms-accent)] text-white hover:bg-indigo-700 flex items-center justify-center shadow-sm"
                >
                  {submitting ? <Loader size={15} className="animate-spin" /> : unitModal.isEdit ? 'Update Unit' : 'Save Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: LESSON CREATE / EDIT                              */}
      {/* ========================================================= */}
      {lessonModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--lms-surface)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--lms-border)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] shrink-0 flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
                {lessonModal.isEdit ? 'Edit Lesson' : 'Add Lesson'}
              </h3>
              <button
                onClick={() => setLessonModal({ open: false, isEdit: false, unitId: null, data: null })}
                className="text-xs font-bold text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)]"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <form id="lesson-form" onSubmit={handleSubmitLesson} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                    Lesson Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)]"
                    placeholder="e.g. Introduction to Syntax"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                    Content Type <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {['Video', 'PDF', 'External Link', 'Text'].map((type) => (
                      <div
                        key={type}
                        onClick={() => setLessonForm({ ...lessonForm, contentType: type })}
                        className={`cursor-pointer rounded-xl border p-2 flex flex-col items-center gap-1.5 transition-all ${
                          lessonForm.contentType === type
                            ? 'border-[var(--lms-accent)] bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] font-bold'
                            : 'border-[var(--lms-border)] text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)]'
                        }`}
                      >
                        {getContentTypeIcon(type)}
                        <span className="text-[10px] text-center leading-tight">{type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {lessonForm.contentType === 'Video' && (
                  <div>
                    <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                      Video URL <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={lessonForm.videoUrl}
                      onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                      className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)]"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                )}

                {lessonForm.contentType === 'PDF' && (
                  <div>
                    <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                      PDF Document URL <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={lessonForm.pdfUrl}
                      onChange={(e) => setLessonForm({ ...lessonForm, pdfUrl: e.target.value })}
                      className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)]"
                      placeholder="https://example.com/lecture-notes.pdf"
                    />
                  </div>
                )}

                {lessonForm.contentType === 'External Link' && (
                  <div>
                    <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                      External Link URL <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      required
                      value={lessonForm.externalUrl}
                      onChange={(e) => setLessonForm({ ...lessonForm, externalUrl: e.target.value })}
                      className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)]"
                      placeholder="https://docs.oracle.com/..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)]"
                    placeholder="e.g. 15"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                    Description / Lecture Notes
                  </label>
                  <textarea
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                    className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)] min-h-[80px]"
                    placeholder="Key takeaways, instructions, or overview for students..."
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setLessonModal({ open: false, isEdit: false, unitId: null, data: null })}
                className="flex-1 px-4 py-2 rounded-xl text-xs font-bold border border-[var(--lms-border)] text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="lesson-form"
                disabled={submitting}
                className="flex-1 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--lms-accent)] text-white hover:bg-indigo-700 flex items-center justify-center shadow-sm"
              >
                {submitting ? <Loader size={15} className="animate-spin" /> : lessonModal.isEdit ? 'Update Lesson' : 'Save Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: RESOURCE CREATE / EDIT (NO MANUAL TYPE REQUIRED)   */}
      {/* ========================================================= */}
      {resourceModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--lms-surface)] rounded-3xl w-full max-w-lg shadow-2xl border border-[var(--lms-border)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
                  {resourceModal.isEdit ? 'Edit Resource' : 'Add Resource'}
                </h3>
                <p className="text-[11px] text-[var(--lms-text-muted)]">Upload a file or provide an external reference link</p>
              </div>
              <button
                onClick={() => setResourceModal({ open: false, isEdit: false, lessonId: null, data: null })}
                className="text-xs font-bold text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {/* SOURCE SELECTOR TOGGLE */}
              <div>
                <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                  Resource Source
                </label>
                <div className="grid grid-cols-2 gap-2 bg-[var(--lms-bg)] p-1 rounded-2xl border border-[var(--lms-border)]">
                  <button
                    type="button"
                    onClick={() => {
                      setResourceSource('upload');
                      setFileError('');
                    }}
                    className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                      resourceSource === 'upload'
                        ? 'bg-[var(--lms-surface)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] shadow-sm'
                        : 'text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)]'
                    }`}
                  >
                    <Upload size={14} /> Upload File
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResourceSource('external');
                      setFileError('');
                    }}
                    className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                      resourceSource === 'external'
                        ? 'bg-[var(--lms-surface)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] shadow-sm'
                        : 'text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)]'
                    }`}
                  >
                    <Globe size={14} /> External URL
                  </button>
                </div>
              </div>

              {fileError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-500 font-medium animate-fade-in">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}

              <form id="resource-form" onSubmit={handleSubmitResource} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={resourceForm.title}
                    onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                    className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)]"
                    placeholder="e.g. Lecture Notes, Course Cheatsheet, Starter Code"
                  />
                </div>

                {/* OPTION A: UPLOAD FILE (Automatic type detection, no manual selection) */}
                {resourceSource === 'upload' && (
                  <div>
                    <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                      Choose File {!resourceModal.isEdit && <span className="text-rose-500">*</span>}
                    </label>

                    {resourceModal.isEdit && resourceModal.data?.source === 'upload' && !selectedFile && (
                      <div className="mb-2 p-3 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <File size={16} className="text-emerald-500 shrink-0" />
                          <div className="truncate">
                            <span className="font-semibold text-[var(--lms-text-primary)] block truncate">
                              Current: {resourceModal.data.originalName || 'Uploaded File'}
                            </span>
                            {resourceModal.data.fileSize ? (
                              <span className="text-[10px] text-[var(--lms-text-muted)]">
                                {formatFileSize(resourceModal.data.fileSize)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <span className="text-[10px] font-semibold text-[var(--lms-text-muted)]">Keep or replace below</span>
                      </div>
                    )}

                    <div className="relative border-2 border-dashed border-[var(--lms-border)] hover:border-[var(--lms-accent)] rounded-2xl p-5 transition-colors text-center bg-[var(--lms-bg)]">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpeg,.jpg,.png,.gif,.webp,.mp4,.webm,.mov,.zip,.rar"
                      />
                      <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                        <div className="w-10 h-10 rounded-full bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] flex items-center justify-center">
                          <Upload size={18} />
                        </div>
                        <p className="text-xs font-bold text-[var(--lms-text-primary)]">
                          {selectedFile ? selectedFile.name : 'Click or drag file to upload'}
                        </p>
                        <p className="text-[10px] text-[var(--lms-text-muted)]">
                          {selectedFile
                            ? `File size: ${formatFileSize(selectedFile.size)}`
                            : 'PDF, Video, Images, Documents, Spreadsheets, ZIP up to 100 MB'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* OPTION B: EXTERNAL URL */}
                {resourceSource === 'external' && (
                  <div>
                    <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                      External URL <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      required={resourceSource === 'external'}
                      value={resourceForm.url}
                      onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
                      className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)]"
                      placeholder="https://example.com/notes.pdf or https://github.com/..."
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider mb-2">
                    Description / Notes
                  </label>
                  <textarea
                    value={resourceForm.description}
                    onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                    className="w-full bg-[var(--lms-bg)] border border-[var(--lms-border)] rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--lms-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--lms-accent)] min-h-[70px]"
                    placeholder="Additional context or instructions for this resource..."
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setResourceModal({ open: false, isEdit: false, lessonId: null, data: null })}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold border border-[var(--lms-border)] text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="resource-form"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--lms-accent)] text-white hover:bg-indigo-700 flex items-center justify-center shadow-sm"
              >
                {submitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader size={14} className="animate-spin" />
                    {resourceSource === 'upload' && selectedFile ? 'Uploading File...' : 'Saving...'}
                  </span>
                ) : resourceModal.isEdit ? (
                  'Update Resource'
                ) : (
                  'Create Resource'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DELETE CONFIRMATION                                */}
      {/* ========================================================= */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-[var(--lms-surface)] rounded-3xl w-full max-w-sm shadow-2xl border border-[var(--lms-border)] p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-500 flex items-center justify-center mx-auto mb-2 border border-rose-500/20">
              <AlertCircle size={24} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
                Delete {deleteConfirm.type.charAt(0).toUpperCase() + deleteConfirm.type.slice(1)}?
              </h3>
              <p className="text-xs text-[var(--lms-text-secondary)] font-medium">
                "{deleteConfirm.title}"
              </p>
              {deleteConfirm.extraNote && (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-2 font-medium">
                  {deleteConfirm.extraNote}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ open: false, type: '', id: null, title: '', extraNote: '' })}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold border border-[var(--lms-border)] text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-subtle)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-sm"
              >
                {submitting ? <Loader size={15} className="animate-spin" /> : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CourseContent;
