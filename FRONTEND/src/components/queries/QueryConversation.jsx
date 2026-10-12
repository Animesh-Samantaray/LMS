import React, { useState } from 'react';
import {
  Send,
  User,
  Shield,
  GraduationCap,
  Clock,
  BookOpen,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lock,
} from 'lucide-react';
import QueryStatusBadge from './QueryStatusBadge';
import courseQueryService from '../../services/courseQuery.service';

const formatDateTime = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const QueryConversation = ({
  query,
  currentUser,
  canChangeStatus = false,
  onStatusUpdated,
  onReplyAdded,
}) => {
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!query) {
    return (
      <div className="p-10 rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-surface)] text-center text-xs text-[var(--lms-text-muted)]">
        Select a query from the list to view its conversation.
      </div>
    );
  }

  const isClosed = query.status === 'closed';
  const replies = query.replies || [];
  const courseTitle = query.courseId?.title || 'Course';
  const student = query.studentId || {};

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || isClosed) return;
    try {
      setSending(true);
      setError('');
      setSuccess('');
      const res = await courseQueryService.replyToQuery(query._id, replyText.trim());
      if (res?.success) {
        setReplyText('');
        setSuccess('Reply sent successfully');
        if (onReplyAdded) onReplyAdded(res.data);
      } else {
        setError(res?.message || 'Failed to send reply');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to send reply');
    } finally {
      setSending(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === query.status || statusUpdating) return;
    try {
      setStatusUpdating(true);
      setError('');
      setSuccess('');
      const res = await courseQueryService.updateQueryStatus(query._id, newStatus);
      if (res?.success) {
        setSuccess(`Status changed to ${newStatus}`);
        if (onStatusUpdated) onStatusUpdated(res.data);
      } else {
        setError(res?.message || 'Failed to update status');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-surface)] shadow-xs overflow-hidden flex flex-col h-full min-h-[540px]">
      <div className="p-5 sm:p-6 border-b border-[var(--lms-border)] bg-gradient-to-b from-[var(--lms-surface-subtle)] to-[var(--lms-surface)] space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <QueryStatusBadge status={query.status} size="sm" />
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-200/50 dark:border-indigo-800/40">
              <BookOpen size={12} className="text-indigo-500" />
              <span>{courseTitle}</span>
            </span>
          </div>

          {canChangeStatus && (
            <div className="flex items-center gap-2 bg-[var(--lms-surface)] px-2.5 py-1 rounded-xl border border-[var(--lms-border)] shadow-xs">
              <span className="text-[10px] font-black text-[var(--lms-text-muted)] uppercase tracking-wider">
                Status
              </span>
              <select
                disabled={statusUpdating}
                value={query.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="text-xs font-bold bg-transparent text-[var(--lms-text-primary)] focus:outline-none cursor-pointer pr-1"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="answered">Answered</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg sm:text-xl font-black text-[var(--lms-text-primary)] leading-tight tracking-tight">
            {query.subject}
          </h2>
          <div className="flex items-center gap-4 text-xs text-[var(--lms-text-muted)] mt-2 flex-wrap">
            <span className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                {(student.name || 'S').charAt(0).toUpperCase()}
              </div>
              <span>Asked by <strong className="text-[var(--lms-text-primary)]">{student.name || 'Student'}</strong></span>
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <Clock size={12} />
              <span>{formatDateTime(query.createdAt)}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
        <div className="p-4 sm:p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <span className="flex items-center gap-1.5">
              <User size={13} className="text-indigo-500" />
              <span>Original Query</span>
            </span>
            <span className="text-[11px] font-normal text-[var(--lms-text-muted)]">
              {formatDateTime(query.createdAt)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--lms-text-primary)] leading-relaxed whitespace-pre-wrap">
            {query.description}
          </p>
        </div>

        {replies.length > 0 && (
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--lms-border)]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-black text-[var(--lms-text-muted)]">
              <span className="bg-[var(--lms-surface)] px-3 rounded-full border border-[var(--lms-border)]">
                {replies.length} {replies.length === 1 ? 'Response' : 'Responses'}
              </span>
            </div>
          </div>
        )}

        {replies.map((r, idx) => {
          const isFromCurrent =
            r.from?._id === currentUser?._id ||
            r.from?._id === currentUser?.id ||
            r.from === currentUser?._id ||
            r.from === currentUser?.id;
          const role = r.fromRole || r.from?.role || 'User';
          const authorName = r.from?.name || (isFromCurrent ? 'You' : role);

          const roleStyles = {
            Admin: {
              border: 'border-rose-200 dark:border-rose-900/50',
              bg: 'bg-rose-50/40 dark:bg-rose-950/20',
              badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-300/40',
              avatarBg: 'bg-rose-500 text-white',
            },
            Instructor: {
              border: 'border-amber-200 dark:border-amber-900/50',
              bg: 'bg-amber-50/40 dark:bg-amber-950/20',
              badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300/40',
              avatarBg: 'bg-amber-500 text-white',
            },
            Student: {
              border: 'border-[var(--lms-border)]',
              bg: 'bg-[var(--lms-surface-subtle)]',
              badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-300/40',
              avatarBg: 'bg-indigo-500 text-white',
            },
          }[role] || {
            border: 'border-[var(--lms-border)]',
            bg: 'bg-[var(--lms-surface-subtle)]',
            badge: 'bg-slate-500/10 text-slate-700 border-slate-300',
            avatarBg: 'bg-slate-500 text-white',
          };

          return (
            <div
              key={r._id || idx}
              className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 transition-all shadow-xs ${roleStyles.border} ${roleStyles.bg}`}
            >
              <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow-xs ${roleStyles.avatarBg}`}>
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-[var(--lms-text-primary)]">
                    {authorName}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${roleStyles.badge}`}>
                    {role}
                  </span>
                </div>
                <span className="text-[11px] text-[var(--lms-text-muted)] font-medium">
                  {formatDateTime(r.createdAt)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--lms-text-secondary)] leading-relaxed whitespace-pre-wrap pl-8 sm:pl-8">
                {r.message}
              </p>
            </div>
          );
        })}

        {replies.length === 0 && !isClosed && (
          <div className="py-10 text-center text-xs text-[var(--lms-text-muted)] space-y-1">
            <p className="font-bold text-[var(--lms-text-secondary)]">No responses submitted yet.</p>
            <p>Use the form below to add a reply and notify the student.</p>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 border-t border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] space-y-3">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle size={14} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {isClosed ? (
          <div className="p-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100/50 dark:bg-slate-900/50 text-center text-xs font-semibold text-[var(--lms-text-muted)] flex items-center justify-center gap-2">
            <Lock size={14} className="text-slate-400" />
            <span>This query is closed. Switch status back to in-progress or answered to continue replying.</span>
          </div>
        ) : (
          <form onSubmit={handleSendReply} className="space-y-2.5">
            <textarea
              rows={3}
              placeholder="Type your response here..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] text-xs sm:text-sm text-[var(--lms-text-primary)] placeholder:text-[var(--lms-text-muted)] focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none leading-relaxed shadow-xs"
            />
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[11px] text-[var(--lms-text-muted)] font-medium">
                Replying as <strong className="text-[var(--lms-text-primary)]">{currentUser?.name || 'User'}</strong> ({currentUser?.role || 'Member'})
              </span>
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-sm hover:shadow-md hover:shadow-indigo-500/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={13} className={sending ? 'animate-pulse' : ''} />
                <span>{sending ? 'Sending...' : 'Send Reply'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default QueryConversation;
