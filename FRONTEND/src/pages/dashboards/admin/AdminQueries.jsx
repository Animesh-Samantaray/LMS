import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  Filter,
  RefreshCw,
  BookOpen,
  MessageSquare,
  Shield,
  Layers,
} from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import QueryStats from '../../../components/queries/QueryStats';
import QueryList from '../../../components/queries/QueryList';
import QueryConversation from '../../../components/queries/QueryConversation';
import courseQueryService from '../../../services/courseQuery.service';
import { useAuth } from '../../../context/AuthContext';

const AdminQueries = () => {
  const { user } = useAuth();
  const [queries, setQueries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('');

  const fetchStats = async () => {
    try {
      const res = await courseQueryService.getQueryStats();
      if (res?.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllQueries = async () => {
    try {
      setLoading(true);
      setError(null);
      const [queriesRes, statsRes] = await Promise.all([
        courseQueryService.getAllQueries(),
        courseQueryService.getQueryStats(),
      ]);

      if (queriesRes?.success) {
        const fetched = queriesRes.data || [];
        setQueries(fetched);
        if (fetched.length > 0 && !selectedQuery) {
          setSelectedQuery(fetched[0]);
        }
      } else {
        setError(queriesRes?.message || 'Failed to load platform queries');
      }

      if (statsRes?.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to connect to service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllQueries();
  }, []);

  const courseList = useMemo(() => {
    const map = new Map();
    queries.forEach((q) => {
      const c = q.courseId;
      if (c && c._id) {
        map.set(String(c._id), c.title || 'Untitled Course');
      }
    });
    return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
  }, [queries]);

  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      if (statusFilter !== 'all' && q.status !== statusFilter) return false;
      if (selectedCourseFilter) {
        const cId = q.courseId?._id || q.courseId;
        if (String(cId) !== String(selectedCourseFilter)) return false;
      }
      if (searchQuery.trim()) {
        const s = searchQuery.toLowerCase();
        const matchesSubject = q.subject?.toLowerCase().includes(s);
        const matchesDesc = q.description?.toLowerCase().includes(s);
        const matchesStudent = q.studentId?.name?.toLowerCase().includes(s);
        const matchesCourse = q.courseId?.title?.toLowerCase().includes(s);
        if (!matchesSubject && !matchesDesc && !matchesStudent && !matchesCourse) return false;
      }
      return true;
    });
  }, [queries, statusFilter, selectedCourseFilter, searchQuery]);

  const handleStatusUpdated = (updated) => {
    setQueries((prev) => prev.map((q) => (q._id === updated._id ? updated : q)));
    setSelectedQuery(updated);
    fetchStats();
  };

  const handleReplyAdded = (updated) => {
    setQueries((prev) => prev.map((q) => (q._id === updated._id ? updated : q)));
    setSelectedQuery(updated);
    fetchStats();
  };

  return (
    <DashboardLayout roleTitle="ADMIN" pageTitle="Query Management">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Shield size={13} /> Administrator Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--lms-text-primary)] tracking-tight">
              Course Query Management
            </h1>
            <p className="text-xs sm:text-sm text-[var(--lms-text-muted)] mt-1">
              Oversee and manage student questions across all courses, track resolution status, and step in as administrator.
            </p>
          </div>

          <button
            onClick={fetchAllQueries}
            disabled={loading}
            className="p-2.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] transition-all shadow-sm"
            title="Refresh queries"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <QueryStats
          stats={stats}
          loading={loading}
          activeFilter={statusFilter}
          onFilterChange={(st) => setStatusFilter(st)}
        />

        <div className="p-4 rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-surface)] flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--lms-text-muted)]" />
            <input
              type="text"
              placeholder="Search by student, subject, description, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] placeholder:text-[var(--lms-text-muted)] focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="w-full sm:w-72 px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All LMS Courses ({courseList.length})</option>
              {courseList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 xl:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">
                All Queries ({filteredQueries.length})
              </span>
            </div>

            <QueryList
              queries={filteredQueries}
              loading={loading}
              error={error}
              onRetry={fetchAllQueries}
              onSelectQuery={(q) => setSelectedQuery(q)}
              selectedQueryId={selectedQuery?._id}
              showCourse={true}
              showStudent={true}
              emptyTitle="No platform queries found"
              emptyDescription="No questions match the current filter criteria across courses."
            />
          </div>

          <div className="lg:col-span-7 xl:col-span-8 sticky top-6">
            {selectedQuery ? (
              <QueryConversation
                query={selectedQuery}
                currentUser={user}
                canChangeStatus={true}
                onStatusUpdated={handleStatusUpdated}
                onReplyAdded={handleReplyAdded}
              />
            ) : (
              <div className="p-16 rounded-3xl border border-dashed border-[var(--lms-border)] bg-[var(--lms-surface)] text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
                  Select a query to supervise
                </h3>
                <p className="text-xs text-[var(--lms-text-muted)] max-w-sm mx-auto">
                  Pick any learner question from the left sidebar to read conversation history, update status, or send an admin reply.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminQueries;
