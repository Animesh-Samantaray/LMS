import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  FileText,
  HelpCircle,
  BarChart2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import analyticsService from '../../services/analytics.service';
import KPICard from '../../components/analytics/KPICard';
import ActivityTrendChart from '../../components/analytics/ActivityTrendChart';
import CourseComparisonBarChart from '../../components/analytics/CourseComparisonBarChart';
import DateRangeFilter from '../../components/analytics/DateRangeFilter';
import {
  AnalyticsEmptyState,
  AnalyticsLoadingSkeleton,
  AnalyticsErrorState,
} from '../../components/analytics/AnalyticsStates';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('30');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (selectedRange = range, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const res = await analyticsService.getInstructorDashboardAnalytics(selectedRange);
      if (res?.success) {
        setData(res.data);
        setError(null);
      } else {
        setError(res?.message || 'Failed to fetch instructor dashboard analytics');
      }
    } catch (err) {
      setError(err.message || 'Server connection error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'Instructor' || user.role === 'Admin')) {
      fetchAnalytics(range);
    }
  }, [user, range]);

  const kpis = data?.kpis || {};
  const coursePerformance = data?.coursePerformance || [];
  const activityTrend = data?.activityTrend || [];
  const studentsRequiringAttention = data?.studentsRequiringAttention || [];

  return (
    <DashboardLayout roleTitle="MENTOR" pageTitle="Instructor Dashboard">
      <div className="lms-glass-hero p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={13} className="text-amber-300" />
            Instructor Cohort Hub
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name || 'Instructor'} 👋
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            {studentsRequiringAttention.length > 0
              ? `${studentsRequiringAttention.length} learner${
                  studentsRequiringAttention.length > 1 ? 's' : ''
                } may need assistance or haven't started coursework yet.`
              : 'All your course cohorts are actively progressing on track.'}
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-5 bg-white/10 p-3 sm:p-4 rounded-2xl border border-white/20 z-10">
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black">{kpis.uniqueStudents ?? 0}</div>
            <div className="text-[10px] text-white/70 uppercase font-semibold tracking-wider">Learners</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              {kpis.totalCourses ?? 0}
            </div>
            <div className="text-[10px] text-white/70 uppercase font-semibold tracking-wider">Courses</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black text-emerald-300">
              {kpis.averageCohortProgress ?? 0}%
            </div>
            <div className="text-[10px] text-white/70 uppercase font-semibold tracking-wider">Avg Progress</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
            Reporting Range:
          </span>
          <DateRangeFilter selectedRange={range} onRangeChange={setRange} />
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/instructor/courses/create"
            className="lms-btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 shadow-sm"
          >
            + Create Course
          </Link>
          <button
            onClick={() => fetchAnalytics(range, true)}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-xs font-semibold text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {error && <AnalyticsErrorState message={error} onRetry={() => fetchAnalytics(range)} />}

      {loading ? (
        <AnalyticsLoadingSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Courses"
            value={kpis.totalCourses ?? 0}
            subtitle={`${kpis.activeCourses || 0} published, ${kpis.draftCourses || 0} drafts`}
            icon={BookOpen}
            colorScheme="blue"
            badgeText={`${kpis.totalEnrollments || 0} enrolments`}
          />

          <KPICard
            title="Unique Learners"
            value={kpis.uniqueStudents ?? 0}
            subtitle={`Across ${kpis.totalCourses || 0} managed courses`}
            icon={Users}
            colorScheme="purple"
            badgeText={`${kpis.totalCompletedLearners || 0} completed`}
          />

          <KPICard
            title="Pending Evaluations"
            value={kpis.pendingEvaluations ?? 0}
            subtitle={`${kpis.evaluatedSubmissions || 0} submissions marked`}
            icon={FileText}
            colorScheme={kpis.pendingEvaluations > 0 ? 'amber' : 'emerald'}
            badgeText={
              kpis.averageAssignmentScore !== null
                ? `${kpis.averageAssignmentScore}% avg score`
                : undefined
            }
          />

          <KPICard
            title="Quiz Overview"
            value={kpis.totalQuizzes ?? 0}
            subtitle={`${kpis.totalQuizAttempts || 0} student attempts recorded`}
            icon={HelpCircle}
            colorScheme="teal"
            badgeText={
              kpis.totalQuizAttempts > 0
                ? `${kpis.averageQuizScore}% cohort avg`
                : undefined
            }
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lms-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--lms-text-primary)]">
                Course Progress Comparison
              </h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">
                Average learner completion rate per course
              </p>
            </div>
          </div>

          <CourseComparisonBarChart
            data={coursePerformance}
            dataKey="averageProgress"
            name="Average Progress"
            color="#6366f1"
            height={240}
          />
        </div>

        <div className="lms-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--lms-text-primary)]">
                Cohort Activity Stream
              </h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">
                Daily assignments submitted and quiz attempts
              </p>
            </div>
          </div>

          <ActivityTrendChart
            data={activityTrend}
            series={[
              { key: 'totalActivity', name: 'Total Actions', color: '#6366f1' },
              { key: 'submissions', name: 'Assignments', color: '#f59e0b' },
              { key: 'quizAttempts', name: 'Quiz Submissions', color: '#10b981' },
            ]}
            height={240}
          />
        </div>
      </div>

      <div className="lms-glass-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
              Course Performance Overview
            </h3>
            <p className="text-xs text-[var(--lms-text-secondary)]">
              Detailed metrics across all courses you manage
            </p>
          </div>
          <Link
            to="/instructor/courses"
            className="text-xs font-semibold text-[var(--lms-accent)] hover:underline flex items-center gap-1"
          >
            Manage Courses <ArrowRight size={13} />
          </Link>
        </div>

        {coursePerformance.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--lms-border)] text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
                  <th className="pb-3 px-3">Course</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3">Enrolled</th>
                  <th className="pb-3 px-3">Lessons</th>
                  <th className="pb-3 px-3">Avg Progress</th>
                  <th className="pb-3 px-3">Completion Rate</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--lms-border-subtle)]">
                {coursePerformance.map((course) => (
                  <tr key={course._id} className="hover:bg-[var(--lms-surface-subtle)] transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center shrink-0 overflow-hidden">
                          {course.thumbnail ? (
                            <img
                              src={course.thumbnail}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen size={16} />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-[var(--lms-text-primary)]">{course.title}</p>
                          <p className="text-[10px] text-[var(--lms-text-muted)]">{course.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          course.status === 'published'
                            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25'
                            : 'bg-amber-500/15 text-amber-500 border border-amber-500/25'
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-xs font-semibold text-[var(--lms-text-primary)]">
                      {course.totalEnrolled}
                    </td>
                    <td className="py-3.5 px-3 text-xs text-[var(--lms-text-secondary)]">
                      {course.totalLessons}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-[var(--lms-surface)] rounded-full overflow-hidden border border-[var(--lms-border)]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            style={{ width: `${course.averageProgress}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[var(--lms-text-primary)]">
                          {course.averageProgress}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-xs font-bold text-emerald-500">
                        {course.completionRate}% ({course.completedLearners})
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <Link
                        to={`/instructor/course-analytics/${course._id}`}
                        className="px-3 py-1 rounded-lg border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-xs font-semibold text-[var(--lms-accent)] hover:underline inline-flex items-center gap-1 shadow-sm"
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
            icon={BookOpen}
            title="No Courses Found"
            description="Create your first course to begin teaching and monitoring student analytics."
            actionText="Create Course"
            onAction={() => navigate('/instructor/courses/create')}
          />
        )}
      </div>

      <div className="lms-glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/15 text-rose-500 flex items-center justify-center">
              <AlertTriangle size={15} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--lms-text-primary)]">
                Learners Requiring Attention
              </h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">
                Enrolled students with 0% start or stalled progress (&lt; 25%)
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
            {studentsRequiringAttention.length} Flagged
          </span>
        </div>

        {studentsRequiringAttention.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {studentsRequiringAttention.map((s, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] hover:border-rose-500/40 flex flex-col justify-between space-y-2 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--lms-text-primary)] truncate">{s.name}</p>
                    <p className="text-[10px] text-[var(--lms-text-muted)] truncate">{s.email}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/15 text-rose-500 shrink-0">
                    {s.progress}% Progress
                  </span>
                </div>
                <div className="text-[11px] text-[var(--lms-text-secondary)] line-clamp-2">
                  <span className="font-semibold text-[var(--lms-text-primary)]">{s.courseTitle}:</span>{' '}
                  {s.reason}
                </div>
                <div className="pt-2 border-t border-[var(--lms-border-subtle)] flex justify-end">
                  <Link
                    to={`/instructor/student-analytics/${s.studentId}`}
                    className="text-[11px] font-bold text-[var(--lms-accent)] hover:underline flex items-center gap-1"
                  >
                    View Student Analytics &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 px-3 text-center rounded-xl bg-[var(--lms-surface-subtle)] text-xs text-[var(--lms-text-secondary)]">
            <CheckCircle2 size={22} className="mx-auto mb-1.5 text-emerald-500 opacity-80" />
            No learners currently require urgent attention. All active students have started coursework.
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstructorDashboard;
