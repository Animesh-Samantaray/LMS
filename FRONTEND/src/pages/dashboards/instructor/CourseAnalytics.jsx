import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  TrendingUp,
  ArrowLeft,
  RotateCcw,
  Search,
  Sparkles,
  Layers,
  BarChart2,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import DashboardLayout from '../../../components/DashboardLayout';
import analyticsService from '../../../services/analytics.service';
import KPICard from '../../../components/analytics/KPICard';
import CompletionDonutChart from '../../../components/analytics/CompletionDonutChart';
import DateRangeFilter from '../../../components/analytics/DateRangeFilter';
import {
  AnalyticsEmptyState,
  AnalyticsLoadingSkeleton,
  AnalyticsErrorState,
} from '../../../components/analytics/AnalyticsStates';

const CourseAnalytics = () => {
  const { id: courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('30');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourseAnalytics = async (selectedRange = range, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await analyticsService.getCourseAnalytics(courseId, selectedRange);
      if (res?.success) {
        setData(res.data);
        setError(null);
      } else {
        setError(res?.message || 'Failed to fetch course analytics');
      }
    } catch (err) {
      setError(err.message || 'Server connection error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (courseId && user) {
      fetchCourseAnalytics(range);
    }
  }, [courseId, user, range]);

  const course = data?.course || {};
  const kpis = data?.kpis || {};
  const distribution = data?.distribution || [];
  const units = data?.units || [];
  const quizzes = data?.quizzes || [];
  const assignments = data?.assignments || [];
  const learners = data?.learners || [];

  const filteredLearners = learners.filter((learner) => {
    const matchesSearch =
      learner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      learner.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || learner.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout
      roleTitle={user?.role === 'Admin' ? 'ADMIN' : 'MENTOR'}
      pageTitle="Course Analytics"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-all shadow-sm"
            aria-label="Go Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="text-[10px] font-bold text-[var(--lms-accent)] uppercase tracking-widest leading-none mb-1">
              Course Analytics Hub
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--lms-text-primary)] tracking-tight">
              {course.title || 'Course Analytics'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DateRangeFilter selectedRange={range} onRangeChange={setRange} />
          <button
            onClick={() => fetchCourseAnalytics(range, true)}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-xs font-semibold text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <AnalyticsErrorState message={error} onRetry={() => fetchCourseAnalytics(range)} />}

      {loading ? (
        <AnalyticsLoadingSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Enrolments"
            value={kpis.totalEnrolled ?? 0}
            subtitle={`${kpis.inProgressLearners || 0} currently active`}
            icon={Users}
            colorScheme="blue"
            badgeText={course.status ? course.status.toUpperCase() : undefined}
          />

          <KPICard
            title="Completion Rate"
            value={`${kpis.completionRate ?? 0}%`}
            subtitle={`${kpis.completedLearners || 0} of ${kpis.totalEnrolled || 0} finished`}
            icon={CheckCircle2}
            colorScheme="emerald"
            badgeText={kpis.completedLearners ? `${kpis.completedLearners} completed` : undefined}
          />

          <KPICard
            title="Average Progress"
            value={`${kpis.averageProgress ?? 0}%`}
            subtitle={`Across ${kpis.totalLessons || 0} lessons`}
            icon={TrendingUp}
            colorScheme="purple"
            badgeText={`${kpis.totalUnits || 0} units`}
          />

          <KPICard
            title="Curriculum Items"
            value={kpis.totalLessons ?? 0}
            subtitle={`${kpis.totalQuizzes || 0} quizzes, ${kpis.totalAssignments || 0} assignments`}
            icon={Layers}
            colorScheme="teal"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 lms-glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
                Curriculum Structure & Unit Analytics
              </h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">
                Completion rate per module and lesson
              </p>
            </div>
            <Link
              to={`/instructor/courses/${courseId}/content`}
              className="text-xs font-semibold text-[var(--lms-accent)] hover:underline flex items-center gap-1"
            >
              Edit Curriculum &rarr;
            </Link>
          </div>

          {units.length > 0 ? (
            <div className="space-y-4">
              {units.map((unit) => (
                <div
                  key={unit._id}
                  className="p-4 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--lms-text-primary)]">
                        {unit.title}
                      </h4>
                      <p className="text-[11px] text-[var(--lms-text-muted)]">
                        {unit.totalLessons} Lessons &bull; {unit.completedLearnersCount} of{' '}
                        {kpis.totalEnrolled || 0} learners finished unit
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-[var(--lms-surface)] rounded-full overflow-hidden border border-[var(--lms-border)]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
                          style={{ width: `${unit.completionPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[var(--lms-text-primary)]">
                        {unit.completionPercentage}%
                      </span>
                    </div>
                  </div>

                  {unit.lessons && unit.lessons.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[var(--lms-border-subtle)]">
                      {unit.lessons.map((lesson) => (
                        <div
                          key={lesson._id}
                          className="p-2.5 rounded-lg bg-[var(--lms-surface)] border border-[var(--lms-border-subtle)] flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[var(--lms-text-primary)] truncate">
                              {lesson.title}
                            </p>
                            <p className="text-[10px] text-[var(--lms-text-muted)]">
                              {lesson.contentType}
                            </p>
                          </div>
                          <span className="text-[11px] font-bold text-emerald-500 shrink-0">
                            {lesson.completionPercentage}% ({lesson.completedCount})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <AnalyticsEmptyState
              icon={Layers}
              title="No Units or Lessons Created"
              description="Add units and lessons to this course to view unit-level progress analytics."
            />
          )}
        </div>

        <div className="lms-glass-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--lms-text-primary)]">
              Cohort Progress Distribution
            </h3>
            <p className="text-xs text-[var(--lms-text-secondary)]">
              Learners completed, in progress, or unstarted
            </p>
          </div>

          <CompletionDonutChart data={distribution} height={220} />

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--lms-border)] text-center">
            <div className="p-2 rounded-xl bg-[var(--lms-surface-subtle)]">
              <div className="text-xs font-bold text-emerald-500">{kpis.completedLearners ?? 0}</div>
              <div className="text-[9px] font-semibold text-[var(--lms-text-muted)] uppercase">Completed</div>
            </div>
            <div className="p-2 rounded-xl bg-[var(--lms-surface-subtle)]">
              <div className="text-xs font-bold text-indigo-500">{kpis.inProgressLearners ?? 0}</div>
              <div className="text-[9px] font-semibold text-[var(--lms-text-muted)] uppercase">In Progress</div>
            </div>
            <div className="p-2 rounded-xl bg-[var(--lms-surface-subtle)]">
              <div className="text-xs font-bold text-[var(--lms-text-muted)]">{kpis.notStartedLearners ?? 0}</div>
              <div className="text-[9px] font-semibold text-[var(--lms-text-muted)] uppercase">Not Started</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lms-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--lms-text-primary)]">
                Course Quizzes
              </h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">
                Participation rates and average scores
              </p>
            </div>
            <Link
              to="/instructor/quizzes"
              className="text-xs font-semibold text-[var(--lms-accent)] hover:underline"
            >
              Manage Quizzes &rarr;
            </Link>
          </div>

          {quizzes.length > 0 ? (
            <div className="space-y-2.5">
              {quizzes.map((q) => (
                <div
                  key={q._id}
                  className="p-3.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--lms-text-primary)] truncate">{q.title}</p>
                    <p className="text-[10px] text-[var(--lms-text-muted)]">
                      {q.totalAttempts} total attempts &bull; {q.uniqueParticipants} participants ({q.participationRate}%)
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-500 block">
                      {q.averageScorePercentage}% Avg Score
                    </span>
                    <span className="text-[10px] text-[var(--lms-text-muted)] capitalize">
                      {q.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AnalyticsEmptyState
              icon={HelpCircle}
              title="No Quizzes In This Course"
              description="Create a quiz to test student understanding and generate performance insights."
            />
          )}
        </div>

        <div className="lms-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--lms-text-primary)]">
                Course Assignments
              </h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">
                Submission volumes, pending reviews, and average grades
              </p>
            </div>
            <Link
              to="/instructor/assignments"
              className="text-xs font-semibold text-[var(--lms-accent)] hover:underline"
            >
              Manage Assignments &rarr;
            </Link>
          </div>

          {assignments.length > 0 ? (
            <div className="space-y-2.5">
              {assignments.map((a) => (
                <div
                  key={a._id}
                  className="p-3.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--lms-text-primary)] truncate">{a.title}</p>
                    <p className="text-[10px] text-[var(--lms-text-muted)]">
                      {a.totalSubmissions} submitted ({a.submissionRate}%) &bull;{' '}
                      {a.toEvaluateCount} awaiting review
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-indigo-500 block">
                      {a.averageMarks !== null ? `${a.averageMarks}/${a.maximumMarks} Marks` : 'No Marks Yet'}
                    </span>
                    <span className="text-[10px] text-[var(--lms-text-muted)]">
                      {a.evaluatedCount} marked
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AnalyticsEmptyState
              icon={FileText}
              title="No Assignments In This Course"
              description="Create assignments to evaluate submissions and give feedback."
            />
          )}
        </div>
      </div>

      <div className="lms-glass-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
              Enrolled Learners Directory
            </h3>
            <p className="text-xs text-[var(--lms-text-secondary)]">
              Filterable cohort performance and individual learner analytics
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lms-text-muted)]"
              />
              <input
                type="text"
                placeholder="Search student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="lms-input pl-8 py-1.5 text-xs w-full sm:w-48"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="lms-input py-1.5 text-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN PROGRESS">In Progress</option>
              <option value="NOT STARTED">Not Started</option>
            </select>
          </div>
        </div>

        {filteredLearners.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--lms-border)] text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
                  <th className="pb-3 px-3">Student</th>
                  <th className="pb-3 px-3">Progress</th>
                  <th className="pb-3 px-3">Lessons Done</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Last Active</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lms-border-subtle)]">
                {filteredLearners.map((learner) => (
                  <tr key={learner.studentId} className="hover:bg-[var(--lms-surface-subtle)] transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] font-bold text-xs flex items-center justify-center shrink-0 overflow-hidden">
                          {learner.profileImage ? (
                            <img
                              src={learner.profileImage}
                              alt={learner.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            learner.name?.substring(0, 2).toUpperCase() || 'ST'
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[var(--lms-text-primary)]">
                            {learner.name}
                          </p>
                          <p className="text-[10px] text-[var(--lms-text-muted)]">{learner.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-[var(--lms-surface)] rounded-full overflow-hidden border border-[var(--lms-border)]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            style={{ width: `${learner.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[var(--lms-text-primary)]">
                          {learner.progressPercentage}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-[var(--lms-text-secondary)]">
                      {learner.completedLessons} / {learner.totalLessons}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          learner.status === 'Completed'
                            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25'
                            : learner.status === 'In Progress'
                            ? 'bg-indigo-500/15 text-indigo-500 border border-indigo-500/25'
                            : 'bg-slate-500/15 text-[var(--lms-text-muted)] border border-[var(--lms-border)]'
                        }`}
                      >
                        {learner.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-[var(--lms-text-muted)]">
                      {learner.lastActivity
                        ? new Date(learner.lastActivity).toLocaleDateString()
                        : 'No activity'}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        to={`/instructor/student-analytics/${learner.studentId}`}
                        className="text-xs font-bold text-[var(--lms-accent)] hover:underline inline-flex items-center gap-1"
                      >
                        <BarChart2 size={13} /> View Analytics
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <AnalyticsEmptyState
            icon={Users}
            title="No Learners Found"
            description={
              searchTerm || statusFilter !== 'ALL'
                ? 'No enrolled students match your search or status filter.'
                : 'No students are currently enrolled in this course.'
            }
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default CourseAnalytics;
