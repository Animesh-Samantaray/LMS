import React, { useEffect, useState } from 'react';
import { Home, BookOpen, Calendar, Activity, Star, BarChart, Cloud, Palette, Shield, Briefcase, ArrowRight, Sparkles, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import studentService from '../../services/student.service';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!user || user.role !== 'Student') {
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await studentService.getStudentProfile();
        if (isMounted) {
          setProfileData(data?.profile || data?.data || data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load student profile');
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
    { label: 'Overview', path: '/student/dashboard', icon: Home },
    { category: 'Learning' },
    { label: 'All Courses', path: '/courses', icon: BookOpen },
    { label: 'My Courses', path: '/student/courses/my', icon: '📖' },
    { label: 'Mock Test', path: '#', icon: '📄' },
    { label: 'Practice Arena', path: '#', icon: '🎯' },
    { label: 'Exams', path: '#', icon: '📝' },
    { label: 'Weekly Contests', path: '#', icon: '🏆' },
    { label: 'Certificates', path: '#', icon: '🎖️' },
    { category: 'Engagement' },
    { label: 'My Groups', path: '#', icon: '👥' },
    { label: 'My Reviews', path: '#', icon: '⭐' },
    { label: 'Messages', path: '#', icon: '💬' },
    { label: 'Calendar', path: '#', icon: '📅' },
    { category: 'Account' },
    { label: 'Settings', path: '/student/profile', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <DashboardLayout roleTitle="STUDENT">
        <div className="flex h-72 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-[var(--lms-border)] border-t-[var(--lms-accent)] rounded-full animate-spin"></div>
            <p className="text-xs text-[var(--lms-text-muted)] font-medium">Loading student workspace...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const courses = profileData?.courses || profileData?.enrolledCourses || [];
  const stats = profileData?.stats || {};

  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : 'ST';
  };

  const recommendedCourses = [
    { title: 'Data Science Fundamentals', category: 'Data Science', desc: 'Build a strong foundation in modern data analysis.', icon: BarChart },
    { title: 'Cloud Computing Architecture', category: 'Cloud', desc: 'Learn AWS and Azure deployment workflows.', icon: Cloud },
    { title: 'UI/UX Design Systems', category: 'Design', desc: 'Craft beautiful interactive user interfaces.', icon: Palette },
    { title: 'Cybersecurity Essentials', category: 'Security', desc: 'Master modern defensive security practices.', icon: Shield },
    { title: 'Technical Leadership', category: 'Business', desc: 'Sharpen communication and team leadership skills.', icon: Briefcase },
  ];

  return (
    <DashboardLayout roleTitle="STUDENT">
     
      <div className="lms-glass-hero p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles size={13} className="text-amber-300" />
            Student Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Learner'} 👋
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Ready to continue your personalized learning journey today?
          </p>
        </div>

       
        <div className="flex items-center gap-4 sm:gap-6 bg-white/10 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-white/20 z-10">
          <div className="text-center px-3">
            <div className="text-2xl sm:text-3xl font-black">{stats.enrolled ?? courses.length}</div>
            <div className="text-[10px] text-white/70 uppercase font-semibold tracking-wider">Courses</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center px-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-300">{stats.completed ?? 0}</div>
            <div className="text-[10px] text-white/70 uppercase font-semibold tracking-wider">Completed</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs sm:text-sm animate-fade-in">
          {error}
        </div>
      )}

    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
        <div className="lg:col-span-2 lms-glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--lms-text-primary)]">My Enrolled Courses</h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">Continue where you left off</p>
            </div>
            <button className="text-xs font-semibold text-[var(--lms-accent)] hover:underline flex items-center gap-1">
              Browse Catalog <ArrowRight size={13} />
            </button>
          </div>

          {courses.length > 0 ? (
            <div className="space-y-3">
              {courses.map((course, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] hover:border-[var(--lms-border-hover)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center shrink-0">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[var(--lms-text-primary)]">
                        {course.title || course.name || 'Core Learning Track'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-1.5 bg-[var(--lms-surface)] rounded-full overflow-hidden border border-[var(--lms-border)]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-[var(--lms-text-muted)] font-semibold">
                          {course.progress || 0}% Complete
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="lms-btn-primary text-xs py-1.5 px-3 self-end sm:self-center">
                    Continue Lesson
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 px-4 text-center rounded-2xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border-subtle)]">
              <div className="w-12 h-12 rounded-2xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center mx-auto mb-3">
                <BookOpen size={22} />
              </div>
              <h4 className="text-sm font-bold text-[var(--lms-text-primary)] mb-1">No active courses enrolled</h4>
              <p className="text-xs text-[var(--lms-text-secondary)] max-w-sm mx-auto">
                Explore the course catalog to enroll in top interactive tracks and start learning.
              </p>
            </div>
          )}
        </div>

      
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
              Student Scholar
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[var(--lms-border)]">
            <div className="p-3 rounded-xl bg-[var(--lms-surface-subtle)]">
              <div className="text-base font-bold text-[var(--lms-text-primary)]">{courses.length}</div>
              <div className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">Enrolled</div>
            </div>
            <div className="p-3 rounded-xl bg-[var(--lms-surface-subtle)]">
              <div className="text-base font-bold text-emerald-500">{stats.completed || 0}</div>
              <div className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">Certificates</div>
            </div>
          </div>
        </div>
      </div>

 
      <div className="lms-glass-card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-500 flex items-center justify-center">
              <Star size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--lms-text-primary)]">Recommended For You</h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">Curated courses tailored to your skills and goals</p>
            </div>
          </div>
          <button className="text-xs font-semibold text-[var(--lms-accent)] hover:underline flex items-center gap-1">
            View all <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {recommendedCourses.map((c, idx) => {
            const Icon = c.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface-subtle)] hover:border-[var(--lms-border-hover)] hover:-translate-y-0.5 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center mb-3">
                    <Icon size={18} />
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)]">
                    {c.category}
                  </span>
                  <h4 className="text-xs font-bold text-[var(--lms-text-primary)] mt-2 leading-tight">
                    {c.title}
                  </h4>
                  <p className="text-[11px] text-[var(--lms-text-secondary)] mt-1 line-clamp-2">
                    {c.desc}
                  </p>
                </div>
                <button className="mt-4 w-full text-[11px] font-semibold text-[var(--lms-accent)] hover:underline text-left">
                  Explore Course &rarr;
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
