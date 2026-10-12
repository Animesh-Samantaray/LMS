import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Bot,
  Search,
  RefreshCw,
  Trash2,
  Eye,
  X,
  MessageSquare,
  User,
  Clock,
  Sparkles,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import { ExportButton } from '../../../components/ExportButton';
import chatbotService from '../../../services/chatbot.service';

const formatDateTime = (value) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getRoleBadgeClasses = (role) => {
  const r = (role || 'Student').toLowerCase();
  if (r === 'admin') {
    return 'bg-rose-500/15 text-rose-500 border-rose-500/30';
  }
  if (r === 'instructor') {
    return 'bg-purple-500/15 text-purple-500 border-purple-500/30';
  }
  return 'bg-blue-500/15 text-blue-500 border-blue-500/30';
};

const AdminChatbotLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ totalQuestions: 0, uniqueUsers: 0, todayQuestions: 0 });
  const [selectedLog, setSelectedLog] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchLogs = async (currentPage = page, search = searchQuery) => {
    try {
      setLoading(true);
      setError(null);
      const res = await chatbotService.getChatbotLogs({
        page: currentPage,
        limit: 20,
        search,
      });

      if (res?.success) {
        setLogs(res.logs || []);
        setTotalPages(res.totalPages || 1);
        setTotalCount(res.total || 0);
        if (res.stats) {
          setStats(res.stats);
        }
      } else {
        setError(res?.message || 'Failed to fetch chatbot logs');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to connect to service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page, searchQuery);
  }, [page]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    fetchLogs(1, searchQuery);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setPage(1);
    fetchLogs(1, '');
  };

  const handleDelete = async (id) => {
    try {
      await chatbotService.deleteChatbotLog(id);
      setLogs((prev) => prev.filter((item) => item._id !== id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      if (selectedLog?._id === id) {
        setSelectedLog(null);
      }
      setDeletingId(null);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete log');
    }
  };

  const filteredLogs = useMemo(() => {
    if (roleFilter === 'all') return logs;
    return logs.filter((log) => (log.userRole || 'Student').toLowerCase() === roleFilter.toLowerCase());
  }, [logs, roleFilter]);

  return (
    <DashboardLayout roleTitle="ADMIN" pageTitle="Chatbot Logs">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-[var(--lms-accent)]/15 text-[var(--lms-accent)] border border-[var(--lms-accent)]/30">
                <Bot size={22} />
              </div>
              <h1 className="text-2xl font-bold text-[var(--lms-text-primary)]">Chatbot Logs & Inquiries</h1>
            </div>
            <p className="text-sm text-[var(--lms-text-secondary)]">
              Real-time monitoring of all questions asked by users to the AI chatbot assistant.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ExportButton
              data={filteredLogs}
              filename="Chatbot_Inquiries_Log"
              columns={[
                { header: 'User Name', accessor: 'userName' },
                { header: 'User Email', accessor: 'userEmail' },
                { header: 'Role', accessor: 'userRole' },
                { header: 'Question Asked', accessor: 'question' },
                { header: 'AI Response', accessor: 'response' },
                { header: 'Date & Time', accessor: (row) => formatDateTime(row.createdAt) },
              ]}
            />
            <button
              onClick={() => fetchLogs(page, searchQuery)}
              disabled={loading}
              className="p-2.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-primary)] transition-colors disabled:opacity-50"
              title="Refresh logs"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--lms-text-muted)] uppercase tracking-wider">
                Total Inquiries
              </span>
              <h3 className="text-2xl font-extrabold text-[var(--lms-text-primary)] mt-1">
                {stats.totalQuestions}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center border border-purple-500/20">
              <MessageSquare size={20} />
            </div>
          </div>

          <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--lms-text-muted)] uppercase tracking-wider">
                Active Users
              </span>
              <h3 className="text-2xl font-extrabold text-[var(--lms-text-primary)] mt-1">
                {stats.uniqueUsers}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center border border-blue-500/20">
              <User size={20} />
            </div>
          </div>

          <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[var(--lms-text-muted)] uppercase tracking-wider">
                Today's Inquiries
              </span>
              <h3 className="text-2xl font-extrabold text-[var(--lms-text-primary)] mt-1">
                {stats.todayQuestions}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <Sparkles size={20} />
            </div>
          </div>
        </div>

        <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--lms-text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user name, email, or question..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] placeholder-[var(--lms-text-muted)] text-xs font-medium focus:outline-none focus:border-[var(--lms-accent)]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleSearchClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)]"
              >
                <X size={14} />
              </button>
            )}
          </form>

          <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
            <span className="text-xs font-semibold text-[var(--lms-text-muted)]">Role:</span>
            {['all', 'Student', 'Instructor', 'Admin'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  roleFilter.toLowerCase() === role.toLowerCase()
                    ? 'bg-[var(--lms-accent)] text-white shadow-sm'
                    : 'bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-hover)]'
                }`}
              >
                {role === 'all' ? 'All Roles' : role}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] rounded-2xl shadow-sm overflow-hidden">
          {loading && logs.length === 0 ? (
            <div className="p-12 text-center">
              <RefreshCw size={28} className="animate-spin mx-auto text-[var(--lms-accent)] mb-3" />
              <p className="text-sm font-semibold text-[var(--lms-text-muted)]">Loading chatbot conversations...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] flex items-center justify-center text-[var(--lms-text-muted)]">
                <HelpCircle size={28} />
              </div>
              <h3 className="text-base font-bold text-[var(--lms-text-primary)]">No chatbot inquiries found</h3>
              <p className="text-xs text-[var(--lms-text-secondary)] mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'No records match your search query. Try searching for something else.'
                  : 'When students or instructors ask questions to the chatbot, their activity will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] text-[11px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">
                    <th className="px-5 py-3.5">User</th>
                    <th className="px-5 py-3.5">Question Asked</th>
                    <th className="px-5 py-3.5">AI Response</th>
                    <th className="px-5 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--lms-border)] text-xs">
                  {filteredLogs.map((log) => {
                    const initials = (log.userName || log.userEmail || 'U')
                      .split(' ')
                      .filter(Boolean)
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <tr key={log._id} className="hover:bg-[var(--lms-surface-hover)] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[var(--lms-accent)]/15 border border-[var(--lms-accent)]/25 text-[var(--lms-accent)] font-bold flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-[var(--lms-text-primary)] truncate max-w-[150px]">
                                {log.userName || 'Anonymous User'}
                              </p>
                              <p className="text-[11px] text-[var(--lms-text-muted)] truncate max-w-[150px]">
                                {log.userEmail || 'No email provided'}
                              </p>
                              <span
                                className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadgeClasses(
                                  log.userRole
                                )}`}
                              >
                                {log.userRole || 'Student'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="max-w-md">
                            <p className="font-semibold text-[var(--lms-text-primary)] line-clamp-2">
                              {log.question}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="max-w-md">
                            <p className="text-[var(--lms-text-secondary)] line-clamp-2 text-xs">
                              {log.response || 'No response recorded'}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-[var(--lms-text-muted)] text-[11px] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} />
                            {formatDateTime(log.createdAt)}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="p-2 rounded-xl text-blue-500 hover:bg-blue-500/10 transition-colors"
                              title="View full conversation details"
                            >
                              <Eye size={16} />
                            </button>

                            {deletingId === log._id ? (
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(log._id)}
                                  className="px-2 py-1 rounded-lg bg-rose-500 text-white font-bold text-[10px]"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setDeletingId(null)}
                                  className="px-2 py-1 rounded-lg bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] border border-[var(--lms-border)] text-[10px]"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingId(log._id)}
                                className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors"
                                title="Delete inquiry"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="p-4 border-t border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex items-center justify-between text-xs text-[var(--lms-text-secondary)]">
              <span>
                Showing page <strong className="text-[var(--lms-text-primary)]">{page}</strong> of{' '}
                <strong className="text-[var(--lms-text-primary)]">{totalPages}</strong> ({totalCount} total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || loading}
                  className="p-1.5 rounded-lg border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages || loading}
                  className="p-1.5 rounded-lg border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedLog &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-[var(--lms-surface-elevated)] rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl border border-[var(--lms-border)] flex flex-col overflow-hidden animate-scale-in">
              <div className="px-6 py-4 border-b border-[var(--lms-border)] flex items-center justify-between bg-[var(--lms-surface-subtle)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--lms-accent)]/15 text-[var(--lms-accent)] border border-[var(--lms-accent)]/25 flex items-center justify-center">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
                      Chatbot Interaction Detail
                    </h3>
                    <p className="text-xs text-[var(--lms-text-secondary)]">
                      Asked by {selectedLog.userName || 'Anonymous'} on {formatDateTime(selectedLog.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 rounded-xl text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface)] transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] text-xs">
                  <div>
                    <span className="text-[var(--lms-text-muted)] font-semibold">User:</span>{' '}
                    <strong className="text-[var(--lms-text-primary)]">{selectedLog.userName || 'Anonymous'}</strong>{' '}
                    <span className="text-[var(--lms-text-secondary)]">({selectedLog.userEmail || 'No email'})</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadgeClasses(
                      selectedLog.userRole
                    )}`}
                  >
                    {selectedLog.userRole || 'Student'}
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)] flex items-center gap-1.5">
                    <User size={14} className="text-blue-500" /> Question Asked
                  </span>
                  <div className="p-4 rounded-xl bg-[var(--lms-surface)] border border-[var(--lms-border)] text-sm font-semibold text-[var(--lms-text-primary)] leading-relaxed whitespace-pre-wrap">
                    {selectedLog.question}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)] flex items-center gap-1.5">
                    <Sparkles size={14} className="text-purple-500" /> AI Chatbot Response
                  </span>
                  <div className="p-4 rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] text-sm text-[var(--lms-text-primary)] leading-relaxed whitespace-pre-wrap">
                    {selectedLog.response || 'No answer recorded'}
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 border-t border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex items-center justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded-xl bg-[var(--lms-surface)] border border-[var(--lms-border)] hover:bg-[var(--lms-surface-hover)] text-xs font-bold text-[var(--lms-text-primary)] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </DashboardLayout>
  );
};

export default AdminChatbotLogs;
