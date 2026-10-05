import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import DashboardLayout from '../../../components/DashboardLayout';
import reportService from '../../../services/report.service';
import api from '../../../services/api.service';
import { Flag, Plus, X, Search, Filter, Loader, MessageSquare, ChevronRight, Paperclip, AlertCircle, FileText, CheckCircle, Clock, XCircle, BookOpen } from 'lucide-react';

const getStatusConfig = (status) => {
  switch (status) {
    case 'Open': return { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    case 'In Review': return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    case 'Resolved': return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    case 'Rejected': return { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
    default: return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
  }
};

const MyReports = () => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    type: 'Course',
    name: '',
    description: '',
    courseId: ''
  });
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchReports();
    fetchCourses();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getMyReports();
      setReports(data.reports || data || []);
    } catch (err) {
      showNotification('error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/api/courses');
      setCourses(res.data.courses || res.data || []);
    } catch (err) {
      console.error('Failed to load courses', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim() || !formData.type) {
      showNotification('error', 'Please fill all required fields');
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append('type', formData.type);
      data.append('name', formData.name.trim());
      data.append('description', formData.description.trim());
      if (formData.courseId) data.append('courseId', formData.courseId);
      if (file) data.append('file', file);

      await reportService.createReport(data);
      showNotification('success', 'Report submitted successfully');
      setIsSuccessSubmitted(true);
      setFormData({ type: 'Course', name: '', description: '', courseId: '' });
      setFile(null);
      fetchReports();
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccessSubmitted(false);
      }, 1800);
    } catch (err) {
      showNotification('error', err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const renderAttachmentPreview = (attachment) => {
    if (!attachment) return null;
    
    if (attachment.resourceType === 'image') {
      return (
        <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="block max-w-sm mt-3 overflow-hidden rounded-xl border border-[var(--lms-border)] hover:opacity-90 transition-opacity">
          <img src={attachment.url} alt="Attachment" className="w-full h-auto object-cover max-h-64" />
        </a>
      );
    } else if (attachment.resourceType === 'video') {
      return (
        <div className="mt-3 max-w-sm overflow-hidden rounded-xl border border-[var(--lms-border)]">
          <video src={attachment.url} controls className="w-full h-auto" />
        </div>
      );
    } else {
      return (
        <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-[var(--lms-surface-subtle)] hover:bg-[var(--lms-surface-hover)] border border-[var(--lms-border)] rounded-xl transition-colors">
          <Paperclip size={18} className="text-[var(--lms-text-muted)]" />
          <span className="text-sm font-medium">{attachment.name || 'View Attachment'}</span>
        </a>
      );
    }
  };

  return (
    <DashboardLayout pageTitle="My Reports">
      <div className="flex flex-col gap-6">
        
        {/* Header */}
        <div className="bg-[var(--lms-accent)] text-white p-6 sm:p-8 rounded-3xl relative overflow-hidden shadow-lg shadow-[var(--lms-accent)]/20">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-8 -translate-y-8">
            <Flag size={120} />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold mb-2 tracking-tight">My Reports</h1>
              <p className="text-white/80 font-medium">View and track your submitted issues</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 bg-white text-[var(--lms-accent)] px-5 py-2.5 rounded-xl font-bold hover:bg-white/90 transition-all shadow-sm shrink-0"
            >
              <Plus size={18} />
              Raise an Issue
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-sm">
            <div className="p-4 border-b border-[var(--lms-border)] bg-[var(--lms-surface-elevated)]">
              <h2 className="font-bold text-[var(--lms-text-primary)]">Submitted Reports</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader className="animate-spin text-[var(--lms-text-muted)]" />
                </div>
              ) : reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                  <Flag size={40} className="mb-3 opacity-50" />
                  <p className="font-semibold text-sm">No reports found</p>
                  <p className="text-xs mt-1">You haven't submitted any issues yet.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {reports.map((report) => {
                    const StatusConfig = getStatusConfig(report.status);
                    const StatusIcon = StatusConfig.icon;
                    const isSelected = selectedReport?._id === report._id;
                    
                    return (
                      <button
                        key={report._id}
                        onClick={() => setSelectedReport(report)}
                        className={`w-full text-left p-3 rounded-2xl transition-all border ${
                          isSelected 
                            ? 'bg-[var(--lms-accent-subtle)] border-[var(--lms-accent-border)] shadow-sm' 
                            : 'bg-transparent border-transparent hover:bg-[var(--lms-surface-hover)]'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${StatusConfig.bg} ${StatusConfig.border} ${StatusConfig.color} uppercase tracking-wider flex items-center gap-1`}>
                            <StatusIcon size={10} />
                            {report.status}
                          </span>
                          <span className="text-[10px] text-[var(--lms-text-muted)] font-medium">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className={`text-sm font-bold truncate mb-1 ${isSelected ? 'text-[var(--lms-accent-text)]' : 'text-[var(--lms-text-primary)]'}`}>
                          {report.name}
                        </h3>
                        <p className="text-xs text-[var(--lms-text-secondary)] truncate">
                          #{report.reportId} • {report.type}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-2 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-3xl overflow-hidden flex flex-col min-h-[600px] shadow-sm">
            {selectedReport ? (
              <div className="flex flex-col h-full">
                <div className="p-6 border-b border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-[var(--lms-text-muted)] tracking-wider">#{selectedReport.reportId}</span>
                      <span className="w-1 h-1 rounded-full bg-[var(--lms-border)]"></span>
                      <span className="text-xs font-bold text-[var(--lms-text-secondary)]">{selectedReport.type}</span>
                    </div>
                    <h2 className="text-xl font-bold text-[var(--lms-text-primary)]">{selectedReport.name}</h2>
                    <p className="text-xs text-[var(--lms-text-muted)] mt-1">Submitted on {new Date(selectedReport.createdAt).toLocaleString()}</p>
                  </div>
                  {(() => {
                    const StatusConfig = getStatusConfig(selectedReport.status);
                    return (
                      <div className={`px-3 py-1.5 rounded-xl border ${StatusConfig.bg} ${StatusConfig.border} ${StatusConfig.color} flex items-center gap-1.5 shrink-0`}>
                        <StatusConfig.icon size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">{selectedReport.status}</span>
                      </div>
                    )
                  })()}
                </div>
                
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-[var(--lms-text-muted)] uppercase tracking-wider mb-2">Description</h4>
                      <p className="text-sm text-[var(--lms-text-primary)] whitespace-pre-wrap leading-relaxed">
                        {selectedReport.description}
                      </p>
                    </div>

                    {selectedReport.courseId && (
                      <div>
                        <h4 className="text-xs font-bold text-[var(--lms-text-muted)] uppercase tracking-wider mb-2">Related Course</h4>
                        <div className="inline-flex items-center gap-2 px-3 py-2 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl">
                          <BookOpen size={16} className="text-cyan-600" />
                          <span className="text-sm font-medium text-[var(--lms-text-secondary)]">{typeof selectedReport.courseId === 'object' ? selectedReport.courseId.title : 'Unknown Course'}</span>
                        </div>
                      </div>
                    )}

                    {selectedReport.attachment && selectedReport.attachment.url && (
                      <div>
                        <h4 className="text-xs font-bold text-[var(--lms-text-muted)] uppercase tracking-wider mb-2">Attachment</h4>
                        {renderAttachmentPreview(selectedReport.attachment)}
                      </div>
                    )}

                    {selectedReport.reply && (
                      <div className="mt-8 relative">
                        <div className="absolute top-4 -left-3 w-6 h-px bg-emerald-500/30"></div>
                        <div className="ml-3 p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shadow-sm">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                              <MessageSquare size={12} className="fill-current" />
                            </div>
                            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Admin Response</span>
                          </div>
                          <p className="text-sm text-[var(--lms-text-primary)] leading-relaxed whitespace-pre-wrap">
                            {selectedReport.reply}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                <FileText size={60} className="mb-4 text-[var(--lms-border)]" strokeWidth={1} />
                <p className="font-semibold">Select a report</p>
                <p className="text-sm mt-1 max-w-xs">Choose a report from the list to view its complete details and current status.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raise Issue Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] rounded-3xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between p-5 border-b border-[var(--lms-border)] bg-[var(--lms-surface-elevated)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 border border-cyan-500/20">
                  <Flag size={20} />
                </div>
                <h2 className="text-lg font-bold text-[var(--lms-text-primary)]">Raise an Issue</h2>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--lms-text-muted)] hover:bg-[var(--lms-surface-hover)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 sm:p-6">
              {isSuccessSubmitted ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-scale-in">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <CheckCircle size={36} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-[var(--lms-text-primary)]">Issue Submitted</h3>
                    <p className="text-xs text-[var(--lms-text-secondary)] max-w-xs mx-auto">
                      Your report has been successfully recorded. The moderation team will review it shortly.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                    Status: Open
                  </div>
                </div>
              ) : (
                <form id="report-form" onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider">Issue Type <span className="text-rose-500">*</span></label>
                    <select 
                      name="type" 
                      value={formData.type} 
                      onChange={handleInputChange}
                      required
                      className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-[var(--lms-text-primary)]"
                    >
                      <option value="Course">Course</option>
                      <option value="Content">Content</option>
                      <option value="Message">Message</option>
                      <option value="Discussion">Discussion</option>
                      <option value="User">User</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Assignment">Assignment</option>
                      <option value="Technical">Technical</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider">Related Course (Optional)</label>
                    <select 
                      name="courseId" 
                      value={formData.courseId} 
                      onChange={handleInputChange}
                      className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-[var(--lms-text-primary)]"
                    >
                      <option value="">Select a course...</option>
                      {courses.map(c => (
                        <option key={c._id} value={c._id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider">Issue Title <span className="text-rose-500">*</span></label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    placeholder="Briefly describe the issue..."
                    required
                    maxLength={100}
                    className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-[var(--lms-text-primary)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider">Description <span className="text-rose-500">*</span></label>
                  <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleInputChange}
                    placeholder="Provide details about the issue..."
                    required
                    rows={5}
                    maxLength={5000}
                    className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none text-[var(--lms-text-primary)]"
                  />
                  <div className="flex justify-end">
                    <span className="text-[10px] text-[var(--lms-text-muted)] font-medium">{formData.description.length}/5000</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider">Attachment (Optional)</label>
                  <div className="border-2 border-dashed border-[var(--lms-border)] rounded-2xl p-4 text-center hover:border-cyan-500/50 transition-colors bg-[var(--lms-surface-subtle)]">
                    <input 
                      type="file" 
                      id="report-file" 
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="report-file" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                        <Paperclip size={18} />
                      </div>
                      {file ? (
                        <div className="text-sm">
                          <p className="font-semibold text-[var(--lms-text-primary)]">{file.name}</p>
                          <p className="text-xs text-[var(--lms-text-muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-semibold text-[var(--lms-text-primary)]">Click to browse</p>
                          <p className="text-xs text-[var(--lms-text-muted)]">Upload a screenshot or document</p>
                        </div>
                      )}
                    </label>
                  </div>
                  {file && (
                    <div className="flex justify-end mt-1">
                      <button type="button" onClick={() => setFile(null)} className="text-xs text-rose-500 hover:underline font-medium">Remove file</button>
                    </div>
                  )}
                </div>
                
                <div className="pt-5 mt-5 border-t border-[var(--lms-border)] flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl font-bold text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-hover)] transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 bg-[var(--lms-accent)] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[var(--lms-accent)]/90 transition-all shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                  >
                    {submitting ? <Loader size={16} className="animate-spin" /> : 'Submit Report'}
                  </button>
                </div>
              </form>
              )}
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default MyReports;
