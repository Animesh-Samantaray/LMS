import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  User,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  TrendingUp,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Award,
  BarChart2,
  Calendar,
  Layers,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import DashboardLayout from '../../../components/DashboardLayout';
import analyticsService from '../../../services/analytics.service';
import KPICard from '../../../components/analytics/KPICard';
import CompletionDonutChart from '../../../components/analytics/CompletionDonutChart';
import ActivityTrendChart from '../../../components/analytics/ActivityTrendChart';
import CourseComparisonBarChart from '../../../components/analytics/CourseComparisonBarChart';
import DateRangeFilter from '../../../components/analytics/DateRangeFilter';
import {
  AnalyticsEmptyState,
  AnalyticsLoadingSkeleton,
  AnalyticsErrorState,
} from '../../../components/analytics/AnalyticsStates';

const StudentAnalytics = () => {
  const { studentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const effectiveStudentId = studentId || user?.id || user?._id || 'me';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('30');
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  const fetchStudentAnalytics = async (selectedRange = range, isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const targetId = studentId || user?.id || user?._id || 'me';
      const res = await analyticsService.getStudentAnalytics(targetId, selectedRange);
      if (res?.success) {
        setData(res.data);
        setError(null);
      } else {
        setError(res?.message || 'Failed to fetch student analytics');
      }
    } catch (err) {
      setError(err.message || 'Server connection error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchStudentAnalytics(range);
    }
  }, [studentId, user, range]);

  const student = data?.student || {};
  const kpis = data?.kpis || {};
  const distribution = data?.distribution || [];
  const courses = data?.courses || [];
  const activityTrend = data?.activityTrend || [];
  const quizPerformance = data?.quizPerformance || [];
  const assignmentPerformance = data?.assignmentPerformance || [];

  const isSelf = (user?._id || user?.id) === (studentId || user?._id || user?.id);

  return (
    <DashboardLayout
      roleTitle={user?.role === 'Admin' ? 'ADMIN' : user?.role === 'Instructor' ? 'MENTOR' : 'STUDENT'}
      pageTitle={isSelf ? 'My Analytics' : 'Student Analytics'}
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
              {isSelf ? 'Personal Performance Record' : 'Learner Cohort Record'}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--lms-text-primary)] tracking-tight">
              {student.name ? `${student.name}'s Analytics` : 'Student Analytics'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <DateRangeFilter selectedRange={range} onRangeChange={setRange} />
          <button
            onClick={() => fetchStudentAnalytics(range, true)}
            disabled={refreshing}
            className="px-3 py-1.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-xs font-semibold text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-all flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="lms-glass-card p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-4 z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center text-xl font-black shrink-0 overflow-hidden shadow-lg border-2 border-white/20">
            {student.profileImage ? (
              <img src={student.profileImage} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              student.name?.substring(0, 2).toUpperCase() || 'ST'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-[var(--lms-text-primary)]">{student.name}</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] uppercase">
                {student.role || 'Student'}
              </span>
            </div>
            <p className="text-xs text-[var(--lms-text-muted)] mt-0.5">{student.email}</p>
            <p className="text-[11px] text-[var(--lms-text-secondary)] mt-1 flex items-center gap-1.5">
              <Calendar size={12} className="text-[var(--lms-accent)]" /> Enrolled on{' '}
              {student.joinedAt ? new Date(student.joinedAt).toLocaleDateString() : 'Active Member'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 bg-[var(--lms-surface-subtle)] p-3 rounded-2xl border border-[var(--lms-border)] z-10 w-full md:w-auto justify-around md:justify-end">
          <div className="text-center px-2">
            <div className="text-xl sm:text-2xl font-black text-[var(--lms-text-primary)]">
              {kpis.totalEnrolledCourses ?? 0}
            </div>
            <div className="text-[9px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">Courses</div>
          </div>
          <div className="w-px h-8 bg-[var(--lms-border)]"></div>
          <div className="text-center px-2">
            <div className="text-xl sm:text-2xl font-black text-emerald-500">
              {kpis.completedCourses ?? 0}
            </div>
            <div className="text-[9px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">Completed</div>
          </div>
          <div className="w-px h-8 bg-[var(--lms-border)]"></div>
          <div className="text-center px-2">
            <div className="text-xl sm:text-2xl font-black text-indigo-500">
              {kpis.overallProgress ?? 0}%
            </div>
            <div className="text-[9px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">Avg Progress</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-[var(--lms-border)] pb-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Performance Overview', icon: TrendingUp },
          { id: 'courses', label: 'Enrolled Courses', icon: BookOpen },
          { id: 'quizzes', label: 'Quiz Results', icon: HelpCircle },
          { id: 'assignments', label: 'Assignments Tracker', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--lms-accent)] text-white shadow-sm'
                  : 'text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-subtle)]'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {error && <AnalyticsErrorState message={error} onRetry={() => fetchStudentAnalytics(range)} />}

      {loading ? (
        <AnalyticsLoadingSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Enrolled Tracks"
            value={kpis.totalEnrolledCourses ?? 0}
            subtitle={`${kpis.inProgressCourses || 0} in progress`}
            icon={BookOpen}
            colorScheme="blue"
            badgeText={kpis.completedCourses ? `${kpis.completedCourses} done` : undefined}
          />

          <KPICard
            title="Learning Progress"
            value={`${kpis.overallProgress ?? 0}%`}
            subtitle="Weighted across all lessons"
            icon={TrendingUp}
            colorScheme="purple"
            badgeText={`${kpis.completedCourses || 0} completed`}
          />

          <KPICard
            title="Assignment Standing"
            value={
              kpis.averageAssignmentScore !== null
                ? `${kpis.averageAssignmentScore}%`
                : 'No Marks'
            }
            subtitle={`${kpis.submittedAssignments || 0} submitted, ${kpis.pendingAssignments || 0} pending`}
            icon={FileText}
            colorScheme={kpis.overdueAssignments > 0 ? 'rose' : 'amber'}
            badgeText={kpis.overdueAssignments > 0 ? `${kpis.overdueAssignments} overdue` : undefined}
          />

          <KPICard
            title="Quiz Performance"
            value={
              kpis.averageQuizScore !== null
                ? `${kpis.averageQuizScore}%`
                : 'No Attempts'
            }
            subtitle={`${kpis.totalQuizzesAttempted || 0} total graded attempts`}
            icon={HelpCircle}
            colorScheme="emerald"
            badgeText={kpis.highestQuizScore ? `${kpis.highestQuizScore}% max` : undefined}
          />
        </div>
      )}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 lms-glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[var(--lms-text-primary)]">
                    Learning Activity & Submissions Trend
                  </h3>
                  <p className="text-xs text-[var(--lms-text-secondary)]">
                    Quiz attempts and assignment submissions over the selected period
                  </p>
                </div>
              </div>

              <ActivityTrendChart
                data={activityTrend}
                series={[
                  { key: 'totalActions', name: 'Total Events', color: '#6366f1' },
                  { key: 'quizAttempts', name: 'Quiz Submissions', color: '#10b981' },
                  { key: 'assignmentSubmissions', name: 'Assignments Submitted', color: '#f59e0b' },
                ]}
                height={240}
              />
            </div>

            <div className="lms-glass-card p-6 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--lms-text-primary)]">
                  Course Completion Breakdown
                </h3>
                <p className="text-xs text-[var(--lms-text-secondary)]">
                  Proportion of completed vs in-progress courses
                </p>
              </div>

              <CompletionDonutChart data={distribution} height={200} />

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

          <div className="lms-glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[var(--lms-text-primary)]">
                  Course Progress Comparison
                </h3>
                <p className="text-xs text-[var(--lms-text-secondary)]">
                  Interactive progress percentage per enrolled course
                </p>
              </div>
            </div>

            <CourseComparisonBarChart
              data={courses}
              dataKey="progressPercentage"
              name="Progress Percentage"
              color="#6366f1"
              height={220}
            />
          </div>
        </div>
      )}

      {(activeTab === 'overview' || activeTab === 'courses') && (
        <div className="lms-glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
                Course Progress & Lesson Tracking
              </h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">
                Detailed lesson milestones across all enrolled tracks
              </p>
            </div>
          </div>

          {courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((c) => (
                <div
                  key={c._id}
                  className="p-4 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] hover:border-[var(--lms-border-hover)] flex flex-col justify-between space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center shrink-0 overflow-hidden">
                        {c.thumbnail ? (
                          <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen size={18} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-[var(--lms-text-primary)] truncate">
                          {c.title}
                        </h4>
                        <p className="text-[11px] text-[var(--lms-text-muted)] truncate">
                          {c.instructor?.name || 'Instructor'} &bull; {c.category}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        c.status === 'Completed'
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25'
                          : c.status === 'In Progress'
                          ? 'bg-indigo-500/15 text-indigo-500 border border-indigo-500/25'
                          : 'bg-slate-500/15 text-[var(--lms-text-muted)] border border-[var(--lms-border)]'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-[var(--lms-border-subtle)]">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-[var(--lms-text-secondary)]">
                        {c.completedLessons} / {c.totalLessons} Lessons Done
                      </span>
                      <span className="text-[var(--lms-text-primary)] font-bold">{c.progressPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--lms-surface)] rounded-full overflow-hidden border border-[var(--lms-border)]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300"
                        style={{ width: `${c.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-[var(--lms-text-muted)]">
                      Last Active:{' '}
                      {c.lastActivity ? new Date(c.lastActivity).toLocaleDateString() : 'Never'}
                    </span>
                    {user?.role === 'Student' ? (
                      <Link
                        to={`/student/courses/${c._id}/learn`}
                        className="text-xs font-bold text-[var(--lms-accent)] hover:underline flex items-center gap-1"
                      >
                        Continue Learning &rarr;
                      </Link>
                    ) : (
                      <Link
                        to={`/instructor/course-analytics/${c._id}`}
                        className="text-xs font-bold text-[var(--lms-accent)] hover:underline flex items-center gap-1"
                      >
                        Course Analytics &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AnalyticsEmptyState
              icon={BookOpen}
              title="No Courses Enrolled"
              description="This student is not currently enrolled in any active courses."
            />
          )}
        </div>
      )}

      {(activeTab === 'overview' || activeTab === 'quizzes') && (
        <div className="lms-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
                Quiz Submissions & Grades
              </h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">
                Historical scores and attempts record
              </p>
            </div>
          </div>

          {quizPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--lms-border)] text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
                    <th className="pb-3 px-3">Quiz</th>
                    <th className="pb-3 px-3">Course</th>
                    <th className="pb-3 px-3">Submitted On</th>
                    <th className="pb-3 px-3">Marks</th>
                    <th className="pb-3 px-3 text-right">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--lms-border-subtle)]">
                  {quizPerformance.map((q) => (
                    <tr key={q._id} className="hover:bg-[var(--lms-surface-subtle)] transition-colors">
                      <td className="py-3.5 px-3 text-xs font-bold text-[var(--lms-text-primary)]">
                        {q.quizTitle}
                      </td>
                      <td className="py-3.5 px-3 text-xs text-[var(--lms-text-secondary)]">
                        {q.courseTitle}
                      </td>
                      <td className="py-3.5 px-3 text-xs text-[var(--lms-text-muted)]">
                        {new Date(q.attemptDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 text-xs font-bold text-[var(--lms-text-primary)]">
                        {q.totalScore} / {q.maxScore}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            q.scorePercentage >= 70
                              ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25'
                              : q.scorePercentage >= 40
                              ? 'bg-amber-500/15 text-amber-500 border border-amber-500/25'
                              : 'bg-rose-500/15 text-rose-500 border border-rose-500/25'
                          }`}
                        >
                          {q.scorePercentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AnalyticsEmptyState
              icon={HelpCircle}
              title="No Quiz Attempts"
              description="No quiz submissions have been recorded for this student."
            />
          )}
        </div>
      )}

      {(activeTab === 'overview' || activeTab === 'assignments') && (
        <div className="lms-glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--lms-text-primary)]">
                Assignment Performance & Feedback
              </h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">
                Submissions, deadlines, evaluations, and mentor comments
              </p>
            </div>
          </div>

          {assignmentPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--lms-border)] text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
                    <th className="pb-3 px-3">Assignment</th>
                    <th className="pb-3 px-3">Course</th>
                    <th className="pb-3 px-3">Deadline</th>
                    <th className="pb-3 px-3">Status</th>
                    <th className="pb-3 px-3">Marks</th>
                    <th className="pb-3 px-3">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--lms-border-subtle)]">
                  {assignmentPerformance.map((a) => (
                    <tr key={a._id} className="hover:bg-[var(--lms-surface-subtle)] transition-colors">
                      <td className="py-3.5 px-3 text-xs font-bold text-[var(--lms-text-primary)]">
                        {a.title}
                      </td>
                      <td className="py-3.5 px-3 text-xs text-[var(--lms-text-secondary)]">
                        {a.courseTitle}
                      </td>
                      <td className="py-3.5 px-3 text-xs text-[var(--lms-text-muted)]">
                        {new Date(a.deadline).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3">
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
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-xs font-bold text-[var(--lms-text-primary)]">
                        {a.status === 'marked' && typeof a.marks === 'number'
                          ? `${a.marks} / ${a.maximumMarks}`
                          : '—'}
                      </td>
                      <td className="py-3.5 px-3 text-xs text-[var(--lms-text-secondary)] max-w-xs truncate">
                        {a.feedback || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <AnalyticsEmptyState
              icon={FileText}
              title="No Assignments Found"
              description="No assignments have been published for this student's courses."
            />
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentAnalytics;
