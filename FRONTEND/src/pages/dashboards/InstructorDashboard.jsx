import React, { useEffect, useState } from 'react';
import { Home, Users, BookOpen, Calendar, BarChart2, User, FileText, AlertTriangle, ArrowRight, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import instructorService from '../../services/instructor.service';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!user || user.role !== 'Instructor') {
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await instructorService.getInstructorProfile();
        if (isMounted) {
          setProfileData(data?.profile || data?.data || data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load instructor profile');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [user]);

        const sidebarItems = [
    { label: 'Overview', path: '/instructor/dashboard', icon: Home },
    { category: 'Manager' },
    { label: 'View Students', path: '#', icon: '\uD83D\uDC65' },
    { label: 'Course Progress', path: '#', icon: '\uD83D\uDCD6' },
    { label: 'Exam Progress', path: '#', icon: '\uD83D\uDCDD' },
    { label: 'Certificates', path: '#', icon: '\uD83C\uDF96\uFE0F' },
    { category: 'Account' },
    { label: 'Settings', path: '/instructor/profile', icon: '\u2699\uFE0F' }
  ];

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} roleTitle="MENTOR">
        <div className="flex h-72 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-[var(--lms-border)] border-t-[var(--lms-accent)] rounded-full animate-spin"></div>
            <p className="text-xs text-[var(--lms-text-muted)] font-medium">Loading instructor workspace...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = profileData?.stats || {};
  const students = profileData?.students || [];
  const sessions = profileData?.sessions || [];

  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : 'IN';
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} roleTitle="MENTOR">
     
      <div className="lms-glass-hero p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles size={13} className="text-amber-300" />
            Instructor Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {user?.name || 'Instructor'} 👋
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            {stats.attentionNeeded !== undefined
              ? `${stats.attentionNeeded} students need your attention today.`
              : 'Here is your daily mentor workspace and cohort performance overview.'}
          </p>
        </div>

        
        <div className="flex items-center gap-3 sm:gap-6 bg-white/10 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-white/20 z-10">
          <div className="text-center px-3">
            <div className="text-2xl sm:text-3xl font-black">{stats.students ?? students.length}</div>
            <div className="text-[10px] text-white/70 uppercase font-semibold tracking-wider">Students</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center px-3">
            <div className="text-2xl sm:text-3xl font-black">{stats.courses ?? 0}</div>
            <div className="text-[10px] text-white/70 uppercase font-semibold tracking-wider">Courses</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center px-3">
            <div className="text-2xl sm:text-3xl font-black text-amber-300">{stats.rating ? `${stats.rating}★` : '5.0★'}</div>
            <div className="text-[10px] text-white/70 uppercase font-semibold tracking-wider">Rating</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in">
          <AlertTriangle size={17} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

     
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="lms-glass-card lms-glass-card-hover p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
              Total Students
            </span>
            <div className="text-2xl font-extrabold text-[var(--lms-text-primary)]">
              {stats.students ?? students.length}
            </div>
            <p className="text-[11px] text-[var(--lms-text-secondary)] font-medium">Enrolled in your cohorts</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/25 text-blue-500 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
        </div>

        
        <div className="lms-glass-card lms-glass-card-hover p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
              Cohort Avg Score
            </span>
            <div className="text-2xl font-extrabold text-[var(--lms-text-primary)]">
              {stats.avgScore ? `${stats.avgScore}%` : '85%'}
            </div>
            <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
              <CheckCircle2 size={12} /> Overall good standing
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/25 text-purple-500 flex items-center justify-center shrink-0">
            <BarChart2 size={22} />
          </div>
        </div>

        
        <div className="lms-glass-card lms-glass-card-hover p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
              At Risk
            </span>
            <div className="text-2xl font-extrabold text-rose-500">
              {stats.atRisk ?? 0}
            </div>
            <p className="text-[11px] text-[var(--lms-text-secondary)] font-medium">Need immediate review</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/25 text-rose-500 flex items-center justify-center shrink-0">
            <AlertTriangle size={22} />
          </div>
        </div>

      
        <div className="lms-glass-card lms-glass-card-hover p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
              Live Sessions
            </span>
            <div className="text-2xl font-extrabold text-[var(--lms-text-primary)]">
              {stats.sessions ?? sessions.length}
            </div>
            <p className="text-[11px] text-[var(--lms-text-secondary)] font-medium">Scheduled this week</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-500 flex items-center justify-center shrink-0">
            <Calendar size={22} />
          </div>
        </div>
      </div>

     
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       
        <div className="lg:col-span-2 lms-glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--lms-text-primary)]">Student Progress</h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">Live monitoring of cohort learning milestones</p>
            </div>
            <button className="text-xs font-semibold text-[var(--lms-accent)] hover:underline flex items-center gap-1">
              View all <ArrowRight size={13} />
            </button>
          </div>

          {students.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--lms-border)] text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
                    <th className="pb-3 px-3">Student</th>
                    <th className="pb-3 px-3">Course</th>
                    <th className="pb-3 px-3">Progress</th>
                    <th className="pb-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--lms-border-subtle)]">
                  {students.map((student, idx) => (
                    <tr key={idx} className="hover:bg-[var(--lms-surface-subtle)] transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] font-bold text-xs flex items-center justify-center">
                            {getInitials(student.name)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[var(--lms-text-primary)]">{student.name}</p>
                            <p className="text-[10px] text-[var(--lms-text-muted)]">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-xs text-[var(--lms-text-secondary)] font-medium">
                        {student.course || 'Core LMS Track'}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-[var(--lms-surface-subtle)] rounded-full overflow-hidden border border-[var(--lms-border)]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                              style={{ width: `${student.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-[var(--lms-text-primary)]">
                            {student.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            student.status === 'At Risk' || student.status === 'Needs Help'
                              ? 'bg-rose-500/15 text-rose-500 border border-rose-500/25'
                              : 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25'
                          }`}
                        >
                          {student.status || 'On Track'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
         
            <div className="py-12 px-4 text-center rounded-2xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border-subtle)]">
              <div className="w-14 h-14 rounded-2xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center mx-auto mb-3 shadow-sm">
                <BookOpen size={24} />
              </div>
              <h4 className="text-sm font-bold text-[var(--lms-text-primary)] mb-1">No student progress yet</h4>
              <p className="text-xs text-[var(--lms-text-secondary)] max-w-sm mx-auto">
                Student progress and cohort metrics will automatically appear here once learners begin their assignments.
              </p>
            </div>
          )}
        </div>

       
        <div className="space-y-6">
      
          <div className="lms-glass-card p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center text-2xl font-black mx-auto shadow-lg shadow-indigo-500/20 overflow-hidden border-2 border-white/20">
              {profileData?.user?.profileImage || profileData?.profile?.profileImage ? (
                <img
                  src={profileData?.user?.profileImage || profileData?.profile?.profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(user?.name)
              )}
            </div>

            <div>
              <h4 className="text-base font-bold text-[var(--lms-text-primary)]">{user?.name}</h4>
              <p className="text-xs text-[var(--lms-text-muted)] font-medium mt-0.5">{user?.email}</p>
              <span className="lms-badge mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--lms-accent)]"></span>
                {profileData?.profile?.designation || 'Lead Mentor & Instructor'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[var(--lms-border)]">
              <div className="p-2 rounded-xl bg-[var(--lms-surface-subtle)]">
                <div className="text-sm font-bold text-[var(--lms-text-primary)]">{stats.students ?? students.length}</div>
                <div className="text-[9px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">Students</div>
              </div>
              <div className="p-2 rounded-xl bg-[var(--lms-surface-subtle)]">
                <div className="text-sm font-bold text-[var(--lms-text-primary)]">{stats.courses ?? 0}</div>
                <div className="text-[9px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">Courses</div>
              </div>
              <div className="p-2 rounded-xl bg-[var(--lms-surface-subtle)]">
                <div className="text-sm font-bold text-amber-400">{stats.rating ? `${stats.rating}★` : '5.0★'}</div>
                <div className="text-[9px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">Rating</div>
              </div>
            </div>
          </div>

          
          <div className="lms-glass-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[var(--lms-accent)]" />
                <h4 className="text-sm font-bold text-[var(--lms-text-primary)]">Upcoming Sessions</h4>
              </div>
              <span className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
                {sessions.length} Scheduled
              </span>
            </div>

            {sessions.length > 0 ? (
              <div className="space-y-2.5">
                {sessions.map((session, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] hover:border-[var(--lms-border-hover)] transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-[var(--lms-text-primary)] truncate">
                        {session.title || session.studentName || '1:1 Mentoring'}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)]">
                        {session.type || 'Review'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--lms-text-muted)]">
                      <Clock size={11} />
                      <span>{session.time || 'Time TBD'} &bull; {session.date || 'Today'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            
              <div className="py-6 px-3 text-center rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border-subtle)]">
                <Calendar size={22} className="mx-auto mb-2 text-[var(--lms-text-muted)] opacity-60" />
                <p className="text-xs font-semibold text-[var(--lms-text-primary)] mb-0.5">No upcoming sessions</p>
                <p className="text-[11px] text-[var(--lms-text-secondary)]">Your scheduled calendar events will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InstructorDashboard;
