import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  FileText,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import analyticsService from '../../services/analytics.service';
import KPICard from '../../components/analytics/KPICard';
import CompletionDonutChart from '../../components/analytics/CompletionDonutChart';
import ActivityTrendChart from '../../components/analytics/ActivityTrendChart';
import DateRangeFilter from '../../components/analytics/DateRangeFilter';
import {
  AnalyticsEmptyState,
  AnalyticsLoadingSkeleton,
  AnalyticsErrorState,
} from '../../components/analytics/AnalyticsStates';

const StudentDashboard = () => {
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

      const res = await analyticsService.getStudentDashboardAnalytics(selectedRange);
      if (res?.success) {
        setData(res.data);
        setError(null);
      } else {
        setError(res?.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err.message || 'Server connection error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'Student') {
      fetchAnalytics(range);
    }
  }, [user, range]);

  const kpis = data?.kpis || {};
  const enrolledCourses = data?.enrolledCourses || [];
  const distribution = data?.distribution || [];
  const activityTrend = data?.activityTrend || [];
  const recentQuizAttempts = data?.recentQuizAttempts || [];
  const assignments = data?.assignments || [];
  const upcomingWork = data?.upcomingWork || { assignments: [], quizzes: [] };

  const getGreetingMessage = () => {
    if (kpis.totalEnrolled === 0) {
      return 'Explore our course catalog to begin your learning journey!';
    }
    if (kpis.pendingAssignments > 0) {
      return `You have ${kpis.pendingAssignments} pending assignment${
        kpis.pendingAssignments > 1 ? 's' : ''
      } to review.`;
    }
    if (kpis.inProgressCourses > 0) {
      return `You're currently active in ${kpis.inProgressCourses} course${
        kpis.inProgressCourses > 1 ? 's' : ''
      }. Keep up the great momentum!`;
    }
    return 'Great progress across all your current enrolled subjects.';
  };

  return (
    <DashboardLayout roleTitle="STUDENT" pageTitle="Student Dashboard">
      <div className="lms-glass-hero p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={13} className="text-amber-300" />
            Personalized Learner Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Learner'} 👋
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            {getGreetingMessage()}
          </p>
        </div>

        <div className="flex items-center gap-3 sm:gap-5 bg-white/10 p-3 sm:p-4 rounded-2xl border border-white/20 z-10">
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black">{kpis.totalEnrolled ?? 0}</div>
            <div className="text-[10px] text-white/70 uppercase font-semibold tracking-wider">Enrolled</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black text-emerald-300">
              {kpis.completedCourses ?? 0}
            </div>
            <div className="text-[10px] text-white/70 uppercase font-semibold tracking-wider">Completed</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center px-2">
            <div className="text-2xl sm:text-3xl font-black text-amber-300">
              {kpis.overallProgress ?? 0}%
            </div>
            <div className="text-[10px] text-white/70 uppercase font-semibold tracking-wider">Overall Avg</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
            Activity Timeline:
          </span>
          <DateRangeFilter selectedRange={range} onRangeChange={setRange} />
        </div>

        <button
          onClick={() => fetchAnalytics(range, true)}
          disabled={refreshing}
          className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-xs font-semibold text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-all flex items-center gap-2 shadow-sm"
        >
          <RotateCcw size={13} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Metrics'}
        </button>
      </div>

      {error && <AnalyticsErrorState message={error} onRetry={() => fetchAnalytics(range)} />}

      {loading ? (
        <AnalyticsLoadingSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Enrolled Courses"
            value={kpis.totalEnrolled ?? 0}
            subtitle={`${kpis.inProgressCourses || 0} in progress`}
            icon={BookOpen}
            colorScheme="blue"
            badgeText={kpis.completedCourses ? `${kpis.completedCourses} done` : undefined}
          />

          <KPICard
            title="Learning Progress"
            value={`${kpis.overallProgress ?? 0}%`}
            subtitle="Weighted course milestone avg"
            icon={TrendingUp}
            colorScheme="purple"
            badgeText={`${kpis.completedCourses || 0} completed`}
          />

          <KPICard
            title="Pending Assignments"
            value={kpis.pendingAssignments ?? 0}
            subtitle={
              kpis.overdueAssignments > 0
                ? `${kpis.overdueAssignments} overdue deadlines`
                : `${kpis.submittedAssignments || 0} submitted`
            }
            icon={FileText}
            colorScheme={kpis.overdueAssignments > 0 ? 'rose' : 'amber'}
            badgeText={
              kpis.averageAssignmentScore !== null
                ? `${kpis.averageAssignmentScore}% avg score`
                : undefined
            }
          />

          <KPICard
            title="Quiz Performance"
            value={
              kpis.attemptedQuizzes > 0
                ? `${kpis.averageQuizScore}%`
                : 'No Attempts'
            }
            subtitle={
              kpis.attemptedQuizzes > 0
                ? `${kpis.attemptedQuizzes} of ${kpis.totalQuizzes || 0} attempted`
                : `${kpis.totalQuizzes || 0} published quizzes`
            }
            icon={HelpCircle}
            colorScheme="emerald"
            badgeText={kpis.highestQuizScore ? `${kpis.highestQuizScore}% high` : undefined}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 lms-glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
                My Learning & Course Progress
              </h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">
                Real-time tracking of units and lessons completed
              </p>
            </div>
            <Link
              to="/courses"
              className="text-xs font-semibold text-[var(--lms-accent)] hover:underline flex items-center gap-1"
            >
              Browse Catalog <ArrowRight size={13} />
            </Link>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="space-y-3">
              {enrolledCourses.map((course) => (
                <div
                  key={course._id}
                  className="p-4 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] hover:border-[var(--lms-border-hover)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center shrink-0 overflow-hidden">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen size={20} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--lms-text-primary)] truncate">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--lms-text-muted)]">
                        <span>
                          {course.completedLessons} / {course.totalLessons} Lessons
                        </span>
                        <span>&bull;</span>
                        <span>{course.instructor?.name || 'Instructor'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-28 sm:w-36 h-1.5 bg-[var(--lms-surface)] rounded-full overflow-hidden border border-[var(--lms-border)]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                            style={{ width: `${course.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[var(--lms-text-primary)]">
                          {course.progressPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      to={`/student/courses/${course._id}/learn`}
                      className="lms-btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shadow-sm"
                    >
                      <Play size={12} /> Continue
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AnalyticsEmptyState
              icon={BookOpen}
              title="No courses enrolled yet"
              description="Enroll in a course from our catalog to start tracking your learning progress."
              actionText="Browse Courses"
              onAction={() => navigate('/courses')}
            />
          )}
        </div>

        <div className="lms-glass-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--lms-text-primary)]">
              Course Status Breakdown
            </h3>
            <p className="text-xs text-[var(--lms-text-secondary)]">
              Distribution across enrolled courses
            </p>
          </div>

          <CompletionDonutChart data={distribution} height={210} />

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--lms-border)] text-center">
            <div className="p-2 rounded-xl bg-[var(--lms-surface-subtle)]">
              <div className="text-xs font-bold text-emerald-500">{kpis.completedCourses ?? 0}</div>
              <div className="text-[9px] font-semibold text-[var(--lms-text-muted)] uppercase">Completed</div>
            </div>
            <div className="p-2 rounded-xl bg-[var(--lms-surface-subtle)]">
              <div className="text-xs font-bold text-indigo-500">{kpis.inProgressCourses ?? 0}</div>
              <div className="text-[9px] font-semibold text-[var(--lms-text-muted)] uppercase">In Progress</div>
            </div>
            <div className="p-2 rounded-xl bg-[var(--lms-surface-subtle)]">
              <div className="text-xs font-bold text-[var(--lms-text-muted)]">{kpis.notStartedCourses ?? 0}</div>
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
                Learning Activity Trend
              </h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">
                Submissions and milestone completions over time
              </p>
            </div>
          </div>

          <ActivityTrendChart
            data={activityTrend}
            series={[
              { key: 'totalEvents', name: 'Total Actions', color: '#6366f1' },
              { key: 'quizSubmissions', name: 'Quiz Attempts', color: '#10b981' },
              { key: 'assignmentSubmissions', name: 'Assignments Submitted', color: '#f59e0b' },
            ]}
            height={220}
          />
        </div>

        <div className="lms-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--lms-text-primary)]">
                Upcoming Deadlines & Available Quizzes
              </h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">
                Actionable tasks requiring your attention
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {upcomingWork.assignments.length === 0 && upcomingWork.quizzes.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--lms-text-muted)]">
                <CheckCircle2 size={24} className="mx-auto mb-1.5 text-emerald-500 opacity-80" />
                All caught up! No impending deadlines or active quizzes.
              </div>
            ) : (
              <>
                {upcomingWork.assignments.map((a) => (
                  <div
                    key={`assign-${a._id}`}
                    className="p-3 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] hover:border-amber-500/40 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--lms-text-primary)] truncate">{a.title}</p>
                        <p className="text-[10px] text-[var(--lms-text-muted)] truncate">{a.courseTitle}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-bold text-amber-500 block">
                        Due {new Date(a.deadline).toLocaleDateString()}
                      </span>
                      <span className="text-[9px] text-[var(--lms-text-muted)]">{a.maximumMarks} Marks</span>
                    </div>
                  </div>
                ))}

                {upcomingWork.quizzes.map((q) => (
                  <div
                    key={`quiz-${q._id}`}
                    className="p-3 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] hover:border-emerald-500/40 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                        <HelpCircle size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[var(--lms-text-primary)] truncate">{q.title}</p>
                        <p className="text-[10px] text-[var(--lms-text-muted)] truncate">{q.courseTitle}</p>
                      </div>
                    </div>
                    <Link
                      to={`/student/quizzes/${q._id}/take`}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 transition-colors shrink-0"
                    >
                      Take Quiz
                    </Link>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lms-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--lms-text-primary)]">
                Recent Quiz Attempts
              </h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">
                Your graded quiz submission outcomes
              </p>
            </div>
            <Link
              to="/student/quizzes"
              className="text-xs font-semibold text-[var(--lms-accent)] hover:underline flex items-center gap-1"
            >
              All Quizzes <ArrowRight size={13} />
            </Link>
          </div>

          {recentQuizAttempts.length > 0 ? (
            <div className="space-y-2">
              {recentQuizAttempts.map((sub) => (
                <div
                  key={sub._id}
                  className="p-3 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--lms-text-primary)] truncate">{sub.quizTitle}</p>
                    <p className="text-[10px] text-[var(--lms-text-muted)] truncate">
                      {sub.courseTitle} &bull; {new Date(sub.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`text-xs font-black ${
                        sub.scorePercentage >= 70
                          ? 'text-emerald-500'
                          : sub.scorePercentage >= 40
                          ? 'text-amber-500'
                          : 'text-rose-500'
                      }`}
                    >
                      {sub.totalScore}/{sub.maxScore} ({sub.scorePercentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AnalyticsEmptyState
              icon={HelpCircle}
              title="No Quiz Attempts"
              description="You haven't submitted any quizzes yet. Active quizzes will appear here once submitted."
            />
          )}
        </div>

        <div className="lms-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--lms-text-primary)]">
                Recent Assignments
              </h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">
                Submissions, deadlines, and mentor feedback
              </p>
            </div>
          </div>

          {assignments.length > 0 ? (
            <div className="space-y-2">
              {assignments.map((a) => (
                <div
                  key={a._id}
                  className="p-3 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--lms-text-primary)] truncate">{a.title}</p>
                    <p className="text-[10px] text-[var(--lms-text-muted)] truncate">
                      {a.courseTitle} &bull; Due {new Date(a.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        a.status === 'marked'
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25'
                          : a.status === 'submitted'
                          ? 'bg-blue-500/15 text-blue-500 border border-blue-500/25'
                          : a.status === 'overdue'
                          ? 'bg-rose-500/15 text-rose-500 border border-rose-500/25'
                          : 'bg-amber-500/15 text-amber-500 border border-amber-500/25'
                      }`}
                    >
                      {a.status === 'marked' && typeof a.marks === 'number'
                        ? `${a.marks}/${a.maximumMarks} Marks`
                        : a.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AnalyticsEmptyState
              icon={FileText}
              title="No Assignments Assigned"
              description="No assignments are currently published for your enrolled courses."
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
