import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNotification } from '../../../context/NotificationContext';
import DashboardLayout from '../../../components/DashboardLayout';
import reportService from '../../../services/report.service';
import { Flag, Search, Loader, MessageSquare, Paperclip, AlertCircle, CheckCircle, Clock, XCircle, X } from 'lucide-react';

const getStatusConfig = (status) => {
  switch (status) {
    case 'Open': return { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
    case 'In Review': return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
    case 'Resolved': return { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
    case 'Rejected': return { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20' };
    default: return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' };
  }
};

const AdminReports = () => {
  const { showNotification } = useNotification();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Actions state
  const [replyText, setReplyText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await reportService.getAllReportsAdmin();
      setReports(data.reports || data || []);
    } catch (err) {
      showNotification('error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedReport) return;
    try {
      setActionLoading(true);
      const updated = await reportService.updateReportStatus(selectedReport.reportId, newStatus);
      const updatedReport = updated.report || updated;
      setSelectedReport(updatedReport);
      setReports(reports.map(r => r._id === updatedReport._id ? updatedReport : r));
      showNotification('success', 'Status updated successfully');
    } catch (err) {
      showNotification('error', 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedReport || !replyText.trim()) return;
    
    try {
      setActionLoading(true);
      const updated = await reportService.replyToReport(selectedReport.reportId, replyText.trim());
      const updatedReport = updated.report || updated;
      setSelectedReport(updatedReport);
      setReports(reports.map(r => r._id === updatedReport._id ? updatedReport : r));
      setReplyText('');
      showNotification('success', 'Reply sent successfully');
    } catch (err) {
      showNotification('error', 'Failed to send reply');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    const matchesType = typeFilter === 'All' || r.type === typeFilter;
    const matchesSearch = !searchTerm || 
      r.reportId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

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
    <DashboardLayout pageTitle="Reports & Moderation">
      <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-3xl overflow-hidden shadow-sm">
        
        {/* Header Area */}
        <div className="p-5 border-b border-[var(--lms-border)] bg-[var(--lms-surface-elevated)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center border border-indigo-500/20">
                <Flag size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--lms-text-primary)] leading-tight">Reports & Moderation</h1>
                <p className="text-xs text-[var(--lms-text-muted)] mt-0.5">Manage user issues and platform reports</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lms-text-muted)]" />
                <input
                  type="text"
                  placeholder="Search by ID, issue, or user..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-[var(--lms-text-primary)]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-[var(--lms-text-primary)]"
              >
                <option value="All">All Status</option>
                <option value="Open">Open</option>
                <option value="In Review">In Review</option>
                <option value="Resolved">Resolved</option>
                <option value="Rejected">Rejected</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-[var(--lms-text-primary)]"
              >
                <option value="All">All Types</option>
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
          </div>
        </div>

        {/* Main Content Split */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* List Sidebar */}
          <div className={`w-full lg:w-96 flex-col border-r border-[var(--lms-border)] bg-[var(--lms-surface)] ${selectedReport ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader className="animate-spin text-[var(--lms-text-muted)]" />
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center p-6 opacity-60">
                  <p className="font-semibold text-sm">No reports found</p>
                </div>
              ) : (
                filteredReports.map((report) => {
                  const StatusConfig = getStatusConfig(report.status);
                  const StatusIcon = StatusConfig.icon;
                  const isSelected = selectedReport?._id === report._id;
                  
                  return (
                    <button
                      key={report._id}
                      onClick={() => setSelectedReport(report)}
                      className={`w-full text-left p-4 rounded-2xl transition-all border ${
                        isSelected 
                          ? 'bg-[var(--lms-surface-elevated)] border-indigo-500/30 shadow-sm' 
                          : 'bg-transparent border-transparent hover:bg-[var(--lms-surface-hover)]'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-bold text-[var(--lms-text-muted)]">#{report.reportId}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${StatusConfig.bg} ${StatusConfig.border} ${StatusConfig.color} uppercase tracking-wider flex items-center gap-1`}>
                          <StatusIcon size={10} />
                          {report.status}
                        </span>
                      </div>
                      <h3 className={`text-sm font-bold truncate mb-1 ${isSelected ? 'text-indigo-500' : 'text-[var(--lms-text-primary)]'}`}>
                        {report.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-[var(--lms-text-secondary)]">
                        <span className="truncate max-w-[120px] font-medium">{report.user?.name || 'Unknown User'}</span>
                        <span className="w-1 h-1 rounded-full bg-[var(--lms-border)]"></span>
                        <span>{report.type}</span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Details Area */}
          <div className={`flex-1 flex-col bg-[var(--lms-surface)] ${!selectedReport ? 'hidden lg:flex' : 'flex'}`}>
            {selectedReport ? (
              <div className="flex flex-col h-full overflow-hidden">
                
                {/* Mobile Back Button */}
                <div className="lg:hidden p-3 border-b border-[var(--lms-border)] bg-[var(--lms-surface-elevated)]">
                  <button onClick={() => setSelectedReport(null)} className="text-sm font-semibold text-indigo-500 flex items-center gap-1">
                    <X size={16} /> Close Report
                  </button>
                </div>

                {/* Details Scroll Area */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-8">
                  <div className="max-w-3xl mx-auto space-y-8">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between gap-6 pb-6 border-b border-[var(--lms-border)]">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold text-[var(--lms-text-muted)] tracking-wider">#{selectedReport.reportId}</span>
                          <span className="px-2 py-0.5 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-md text-[10px] font-bold text-[var(--lms-text-secondary)] uppercase tracking-wider">{selectedReport.type}</span>
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--lms-text-primary)] mb-2">{selectedReport.name}</h2>
                        <div className="flex items-center gap-2 text-sm text-[var(--lms-text-secondary)]">
                          <span className="font-semibold text-[var(--lms-text-primary)]">{selectedReport.user?.name}</span>
                          <span>({selectedReport.user?.email})</span>
                          <span className="w-1 h-1 rounded-full bg-[var(--lms-border)]"></span>
                          <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <select
                          value={selectedReport.status}
                          onChange={(e) => handleStatusChange(e.target.value)}
                          disabled={actionLoading}
                          className="bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-[var(--lms-text-primary)] cursor-pointer"
                        >
                          <option value="Open">Open</option>
                          <option value="In Review">In Review</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <h4 className="text-xs font-bold text-[var(--lms-text-muted)] uppercase tracking-wider mb-3">Description</h4>
                      <div className="p-5 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl">
                        <p className="text-sm text-[var(--lms-text-primary)] whitespace-pre-wrap leading-relaxed">
                          {selectedReport.description}
                        </p>
                      </div>
                    </div>

                    {selectedReport.courseId && (
                      <div>
                        <h4 className="text-xs font-bold text-[var(--lms-text-muted)] uppercase tracking-wider mb-3">Related Course</h4>
                        <div className="px-4 py-3 bg-[var(--lms-surface-elevated)] border border-[var(--lms-border)] rounded-xl text-sm font-medium text-[var(--lms-text-primary)]">
                          {typeof selectedReport.courseId === 'object' ? selectedReport.courseId.title : 'Unknown Course'}
                        </div>
                      </div>
                    )}

                    {selectedReport.attachment && selectedReport.attachment.url && (
                      <div>
                        <h4 className="text-xs font-bold text-[var(--lms-text-muted)] uppercase tracking-wider mb-3">Attachment</h4>
                        {renderAttachmentPreview(selectedReport.attachment)}
                      </div>
                    )}

                    {/* Admin Reply Section */}
                    <div>
                      <h4 className="text-xs font-bold text-[var(--lms-text-muted)] uppercase tracking-wider mb-3">Admin Reply</h4>
                      {selectedReport.reply ? (
                        <div className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 shadow-sm">
                          <p className="text-sm text-[var(--lms-text-primary)] leading-relaxed whitespace-pre-wrap mb-4">
                            {selectedReport.reply}
                          </p>
                          <form onSubmit={handleReplySubmit} className="mt-4 pt-4 border-t border-indigo-500/10">
                            <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-2 block">Update Reply</label>
                            <div className="flex gap-3">
                              <input 
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Edit your response..."
                                className="flex-1 bg-[var(--lms-surface)] border border-indigo-500/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-[var(--lms-text-primary)]"
                              />
                              <button 
                                type="submit"
                                disabled={actionLoading || !replyText.trim()}
                                className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                              >
                                {actionLoading ? 'Saving...' : 'Update'}
                              </button>
                            </div>
                          </form>
                        </div>
                      ) : (
                        <form onSubmit={handleReplySubmit} className="p-5 bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-2xl">
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a response to the user..."
                            rows={3}
                            required
                            className="w-full bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none text-[var(--lms-text-primary)] mb-3"
                          />
                          <div className="flex justify-end">
                            <button 
                              type="submit"
                              disabled={actionLoading || !replyText.trim()}
                              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                            >
                              <MessageSquare size={16} />
                              {actionLoading ? 'Sending...' : 'Send Reply'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                    
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-60">
                <Flag size={60} className="mb-4 text-[var(--lms-border)]" strokeWidth={1} />
                <p className="font-semibold">Select a report</p>
                <p className="text-sm mt-1 max-w-xs">Choose a report from the list to view its complete details, update status, and reply.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
