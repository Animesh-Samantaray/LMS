import React, { useState, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  Search,
  Filter,
  RefreshCw,
  BookOpen,
  MessageSquare,
  CheckCircle2,
} from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import QueryStats from '../../../components/queries/QueryStats';
import QueryList from '../../../components/queries/QueryList';
import QueryConversation from '../../../components/queries/QueryConversation';
import courseQueryService from '../../../services/courseQuery.service';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api.service';

const InstructorQueries = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchInstructorCourses = async () => {
    try {
      let res;
      try {
        res = await api.get('/api/courses/instructor/my');
      } catch (e) {
        res = await api.get('/api/instructor/courses');
      }
      const list = res.data?.courses || res.data || [];
      setCourses(list);
      if (list.length > 0 && !selectedCourseId) {
        setSelectedCourseId(list[0]._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQueriesForCourse = async (courseId) => {
    if (!courseId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const res = await courseQueryService.getCourseQueries(courseId);
      if (res?.success) {
        const fetched = res.data || [];
        setQueries(fetched);
        if (fetched.length > 0) {
          setSelectedQuery(fetched[0]);
        } else {
          setSelectedQuery(null);
        }
      } else {
        setError(res?.message || 'Failed to load course queries');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to connect to service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchQueriesForCourse(selectedCourseId);
    }
  }, [selectedCourseId]);

  const stats = useMemo(() => {
    const total = queries.length;
    const pending = queries.filter((q) => q.status === 'pending').length;
    const inProgress = queries.filter((q) => q.status === 'in_progress').length;
    const answered = queries.filter((q) => q.status === 'answered').length;
    const closed = queries.filter((q) => q.status === 'closed').length;
    return { total, pending, inProgress, answered, closed };
  }, [queries]);

  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      if (statusFilter !== 'all' && q.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const s = searchQuery.toLowerCase();
        const matchesSubject = q.subject?.toLowerCase().includes(s);
        const matchesDesc = q.description?.toLowerCase().includes(s);
        const matchesStudent = q.studentId?.name?.toLowerCase().includes(s);
        if (!matchesSubject && !matchesDesc && !matchesStudent) return false;
      }
      return true;
    });
  }, [queries, statusFilter, searchQuery]);

  const handleStatusUpdated = (updated) => {
    setQueries((prev) => prev.map((q) => (q._id === updated._id ? updated : q)));
    setSelectedQuery(updated);
  };

  const handleReplyAdded = (updated) => {
    setQueries((prev) => prev.map((q) => (q._id === updated._id ? updated : q)));
    setSelectedQuery(updated);
  };

  return (
    <DashboardLayout roleTitle="MENTOR" pageTitle="Course Queries">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
              <HelpCircle size={13} /> Instructor Q&A Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--lms-text-primary)] tracking-tight">
              Student Course Inquiries
            </h1>
            <p className="text-xs sm:text-sm text-[var(--lms-text-muted)] mt-1">
              Respond to questions submitted by enrolled students, update status, and manage inquiry resolutions.
            </p>
          </div>

          <button
            onClick={() => fetchQueriesForCourse(selectedCourseId)}
            disabled={loading || !selectedCourseId}
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
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-[var(--lms-text-muted)] uppercase tracking-wider shrink-0">
              Course:
            </span>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full sm:w-72 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--lms-text-muted)]" />
            <input
              type="text"
              placeholder="Search by student name, subject, or query text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] placeholder:text-[var(--lms-text-muted)] focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 xl:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">
                Course Queries ({filteredQueries.length})
              </span>
            </div>

            <QueryList
              queries={filteredQueries}
              loading={loading}
              error={error}
              onRetry={() => fetchQueriesForCourse(selectedCourseId)}
              onSelectQuery={(q) => setSelectedQuery(q)}
              selectedQueryId={selectedQuery?._id}
              showCourse={false}
              showStudent={true}
              emptyTitle="No queries for this course"
              emptyDescription="Enrolled students have not submitted any questions for this course yet."
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
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
                  Select a student query to answer
                </h3>
                <p className="text-xs text-[var(--lms-text-muted)] max-w-sm mx-auto">
                  Choose any inquiry card from the list on the left to read details and write back.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InstructorQueries;
