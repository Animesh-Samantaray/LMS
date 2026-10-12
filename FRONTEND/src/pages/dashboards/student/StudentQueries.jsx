import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  RefreshCw,
  BookOpen,
  ArrowLeft,
  MessageSquare,
} from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import QueryStats from '../../../components/queries/QueryStats';
import QueryList from '../../../components/queries/QueryList';
import QueryConversation from '../../../components/queries/QueryConversation';
import CreateQueryModal from '../../../components/queries/CreateQueryModal';
import courseQueryService from '../../../services/courseQuery.service';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api.service';

const StudentQueries = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCourseId = searchParams.get('courseId') || '';

  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState(initialCourseId);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [targetCourseForModal, setTargetCourseForModal] = useState(null);

  const fetchEnrolledCourses = async () => {
    try {
      const res = await api.get('/api/courses');
      const all = res.data?.courses || res.data || [];
      const userCourses = all.filter((c) => {
        const enrolled = c.enrolled || [];
        return enrolled.some((e) => {
          const eId = typeof e === 'object' ? e?._id || e?.id : e;
          return String(eId) === String(user?._id) || String(eId) === String(user?.id);
        });
      });
      setEnrolledCourses(userCourses);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMyQueries = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await courseQueryService.getMyQueries();
      if (res?.success) {
        setQueries(res.data || []);
        if (res.data?.length > 0 && !selectedQuery) {
          setSelectedQuery(res.data[0]);
        }
      } else {
        setError(res?.message || 'Failed to load your course queries');
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Unable to connect to service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyQueries();
    fetchEnrolledCourses();
  }, []);

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
      if (selectedCourseFilter) {
        const cId = q.courseId?._id || q.courseId;
        if (String(cId) !== String(selectedCourseFilter)) return false;
      }
      if (searchQuery.trim()) {
        const s = searchQuery.toLowerCase();
        const matchesSubject = q.subject?.toLowerCase().includes(s);
        const matchesDesc = q.description?.toLowerCase().includes(s);
        const matchesCourse = q.courseId?.title?.toLowerCase().includes(s);
        if (!matchesSubject && !matchesDesc && !matchesCourse) return false;
      }
      return true;
    });
  }, [queries, statusFilter, selectedCourseFilter, searchQuery]);

  const handleQueryCreated = (newQuery) => {
    setQueries((prev) => [newQuery, ...prev]);
    setSelectedQuery(newQuery);
  };

  const handleReplyAdded = (updatedQuery) => {
    setQueries((prev) => prev.map((q) => (q._id === updatedQuery._id ? updatedQuery : q)));
    setSelectedQuery(updatedQuery);
  };

  const openCreateForCourse = (course) => {
    setTargetCourseForModal(course || enrolledCourses[0] || null);
    setIsCreateModalOpen(true);
  };

  return (
    <DashboardLayout roleTitle="STUDENT" pageTitle="My Course Queries">
      <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <HelpCircle size={13} /> Course Q&A Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--lms-text-primary)] tracking-tight">
              Course Queries & Answers
            </h1>
            <p className="text-xs sm:text-sm text-[var(--lms-text-muted)] mt-1">
              Ask questions directly to course mentors, track resolution progress, and review answers.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={fetchMyQueries}
              disabled={loading}
              className="p-2.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)] transition-all shadow-sm"
              title="Refresh queries"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => openCreateForCourse(enrolledCourses.find((c) => String(c._id) === String(selectedCourseFilter)) || enrolledCourses[0])}
              disabled={enrolledCourses.length === 0}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus size={16} />
              <span>Ask New Question</span>
            </button>
          </div>
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
              placeholder="Search by question subject, description, or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] placeholder:text-[var(--lms-text-muted)] focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCourseFilter}
              onChange={(e) => {
                setSelectedCourseFilter(e.target.value);
                if (e.target.value) {
                  setSearchParams({ courseId: e.target.value });
                } else {
                  setSearchParams({});
                }
              }}
              className="w-full sm:w-60 px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] text-[var(--lms-text-primary)] focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All My Enrolled Courses</option>
              {enrolledCourses.map((c) => (
                <option key={c._id} value={c._id}>
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
                Your Queries ({filteredQueries.length})
              </span>
            </div>

            <QueryList
              queries={filteredQueries}
              loading={loading}
              error={error}
              onRetry={fetchMyQueries}
              onSelectQuery={(q) => setSelectedQuery(q)}
              selectedQueryId={selectedQuery?._id}
              showCourse={true}
              showStudent={false}
              emptyTitle="No questions yet"
              emptyDescription="Need help with any lesson or assignment in your courses? Ask your first question."
              actionButton={
                enrolledCourses.length > 0 ? (
                  <button
                    onClick={() => openCreateForCourse(enrolledCourses[0])}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
                  >
                    <Plus size={14} />
                    <span>Ask Question Now</span>
                  </button>
                ) : null
              }
            />
          </div>

          <div className="lg:col-span-7 xl:col-span-8 sticky top-6">
            {selectedQuery ? (
              <QueryConversation
                query={selectedQuery}
                currentUser={user}
                canChangeStatus={false}
                onReplyAdded={handleReplyAdded}
              />
            ) : (
              <div className="p-16 rounded-3xl border border-dashed border-[var(--lms-border)] bg-[var(--lms-surface)] text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                  <MessageSquare size={32} />
                </div>
                <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
                  Select a question to view replies
                </h3>
                <p className="text-xs text-[var(--lms-text-muted)] max-w-sm mx-auto">
                  Click on any query card on the left to read responses from instructors and administrators.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateQueryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        courseId={targetCourseForModal?._id || enrolledCourses[0]?._id}
        courseTitle={targetCourseForModal?.title || enrolledCourses[0]?.title}
        onCreated={handleQueryCreated}
      />
    </DashboardLayout>
  );
};

export default StudentQueries;
