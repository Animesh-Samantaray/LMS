import React, { useEffect, useState } from 'react';
import { Activity, ArrowRight, ChevronLeft, ChevronRight, BarChart, Cloud, Palette, Shield, Briefcase, Star, Home, BookOpen, PlayCircle, FileText, Calendar, User, TrendingUp, Clock, Book } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import studentService from '../../services/student.service';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await studentService.getStudentProfile();
        setProfileData(data?.data || data);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const sidebarItems = [
    { label: 'Overview', path: '/student/dashboard', icon: Home },
    { category: 'Learning' },
    { label: 'My Courses', path: '#', icon: '📖' },
    { label: 'Learning', path: '#', icon: '🎓' },
    { category: 'Engagement' },
    { label: 'Assignments', path: '#', icon: '📝' },
    { label: 'Calendar', path: '#', icon: '📅' },
    { category: 'Account' },
    { label: 'Profile', path: '/student/profile', icon: '👤' },
  ];

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} roleTitle="STUDENT">
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      
</DashboardLayout>
    );
  }

  const courses = profileData?.courses || profileData?.enrolledCourses || [];
  const stats = profileData?.stats || {};

  return (
    <DashboardLayout sidebarItems={sidebarItems} roleTitle="STUDENT">
      
      <div className="bg-blue-600 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between shadow-lg dark:shadow-none shadow-blue-500/20">
        <div>
          <div className="text-blue-200 text-xs font-bold tracking-widest uppercase mb-2">STUDENT PORTAL</div>
          <h2 className="text-3xl font-bold mb-2">Welcome, {user?.name || 'Student'} 👋</h2>
          <p className="text-blue-100 text-sm">Ready to continue your learning journey today?</p>
        </div>

        {(stats.enrolled || stats.completed) && (
          <div className="flex gap-6 mt-6 md:mt-0 bg-blue-700/50 p-4 rounded-xl border border-blue-500/30">
            {stats.enrolled !== undefined && (
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.enrolled}</div>
                <div className="text-[10px] text-blue-200 uppercase tracking-wider">Courses</div>
              </div>
            )}
            {stats.completed !== undefined && (
              <div className="text-center">
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-[10px] text-blue-200 uppercase tracking-wider">Completed</div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-white dark:bg-slate-900 pink:bg-pink-50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900">My Learning</h3>
              <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
                View all courses &rarr;
              </button>
            </div>

            {courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map((course, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300 hover:shadow-sm dark:shadow-none transition-all">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <BookOpen size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900 truncate">{course.title || course.name || 'Course Name'}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-100 dark:bg-slate-800 pink:bg-pink-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-coffee-400">{course.progress || 0}%</span>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap">
                      Continue
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 px-4">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-700 dark:text-slate-300 pink:text-pink-800">
                  <BookOpen size={32} />
                </div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-700 dark:text-slate-300 pink:text-pink-800 mb-1">No courses found</h4>
                <p className="text-sm text-slate-500 dark:text-coffee-400">You are not enrolled in any active courses.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-white dark:bg-slate-900 pink:bg-pink-50 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg dark:shadow-none shadow-blue-500/30 mb-4 overflow-hidden">
              {profileData?.user?.profileImage || profileData?.profile?.profileImage ? (
                <img src={profileData?.user?.profileImage || profileData?.profile?.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                 user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'ST'
              )}
            </div>
            
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-sm text-slate-500 dark:text-coffee-400 font-medium mb-6">{user?.email}</p>

            <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/50 pt-6">
              <div className="text-center">
                <div className="text-xl font-bold text-slate-800 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900">{courses.length}</div>
                <div className="text-[10px] uppercase font-bold text-coffee-400 tracking-wider mt-1">Enrolled</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-800 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900">{stats.completed || 0}</div>
                <div className="text-[10px] uppercase font-bold text-coffee-400 tracking-wider mt-1">Certificates</div>
              </div>
            </div>
          </div>
        </div>
      </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Upcoming Assignments */}
        <div className="bg-coffee-50 dark:bg-white dark:bg-slate-900 pink:bg-pink-50 rounded-2xl p-6 border border-coffee-200 dark:border-slate-800/50 shadow-sm dark:shadow-none">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="font-bold text-coffee-900 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900">Upcoming Assignments</h3>
                <p className="text-xs text-coffee-500 dark:text-slate-600 dark:text-slate-400 pink:text-pink-600">Stay on top of your deadlines</p>
              </div>
            </div>
            <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </a>
          </div>
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-coffee-100 dark:bg-slate-100 dark:bg-slate-800 pink:bg-pink-200 rounded-full flex items-center justify-center mx-auto mb-3 text-coffee-400 dark:text-slate-500">
              <BookOpen size={20} />
            </div>
            <h4 className="font-bold text-sm text-coffee-900 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900">No upcoming assignments</h4>
            <p className="text-xs text-coffee-500 dark:text-slate-600 dark:text-slate-400 pink:text-pink-600 mt-1">You're all caught up! New assignments will appear here.</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-coffee-50 dark:bg-white dark:bg-slate-900 pink:bg-pink-50 rounded-2xl p-6 border border-coffee-200 dark:border-slate-800/50 shadow-sm dark:shadow-none">
          <div className="flex justify-between items-start mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Activity size={20} />
              </div>
              <div>
                <h3 className="font-bold text-coffee-900 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900">Recent Activity</h3>
                <p className="text-xs text-coffee-500 dark:text-slate-600 dark:text-slate-400 pink:text-pink-600">Your latest learning activity</p>
              </div>
            </div>
            <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </a>
          </div>
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-coffee-100 dark:bg-slate-100 dark:bg-slate-800 pink:bg-pink-200 rounded-full flex items-center justify-center mx-auto mb-3 text-coffee-400 dark:text-slate-500">
              <FileText size={20} />
            </div>
            <h4 className="font-bold text-sm text-coffee-900 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900">No recent activity</h4>
            <p className="text-xs text-coffee-500 dark:text-slate-600 dark:text-slate-400 pink:text-pink-600 mt-1">Start learning to see your activity here.</p>
          </div>
        </div>
      </div>

      {/* Recommended Courses */}
      <div className="bg-coffee-50 dark:bg-white dark:bg-slate-900 pink:bg-pink-50 rounded-2xl p-6 border border-coffee-200 dark:border-slate-800/50 shadow-sm dark:shadow-none mt-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center">
              <Star size={20} />
            </div>
            <div>
              <h3 className="font-bold text-coffee-900 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900">Recommended Courses</h3>
              <p className="text-xs text-coffee-500 dark:text-slate-600 dark:text-slate-400 pink:text-pink-600">Based on your interests</p>
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto sm:ml-0">
            <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </a>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-full border border-coffee-200 dark:border-slate-300 dark:border-slate-700 pink:border-pink-400 flex items-center justify-center text-coffee-600 hover:bg-coffee-100 dark:text-slate-600 dark:text-slate-400 pink:text-pink-600 dark:hover:bg-slate-100 dark:bg-slate-800 pink:bg-pink-200 transition">
                <ChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 rounded-full border border-coffee-200 dark:border-slate-300 dark:border-slate-700 pink:border-pink-400 flex items-center justify-center text-coffee-600 hover:bg-coffee-100 dark:text-slate-600 dark:text-slate-400 pink:text-pink-600 dark:hover:bg-slate-100 dark:bg-slate-800 pink:bg-pink-200 transition">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
          {/* Card 1 */}
          <div className="border border-coffee-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300 rounded-xl p-4 flex items-start gap-3 hover:border-blue-300 transition cursor-pointer bg-white dark:bg-slate-800/50">
            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <BarChart size={24} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded">Data Science</span>
              <h4 className="font-bold text-[11px] text-coffee-900 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900 mt-1.5 leading-tight">Data Science Fundamentals</h4>
              <p className="text-[10px] text-coffee-500 dark:text-slate-600 dark:text-slate-400 pink:text-pink-600 mt-1 leading-tight">Build a strong foundation in data science.</p>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="border border-coffee-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300 rounded-xl p-4 flex items-start gap-3 hover:border-blue-300 transition cursor-pointer bg-white dark:bg-slate-800/50">
            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Cloud size={24} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded">Cloud Computing</span>
              <h4 className="font-bold text-[11px] text-coffee-900 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900 mt-1.5 leading-tight">Cloud Computing Basics</h4>
              <p className="text-[10px] text-coffee-500 dark:text-slate-600 dark:text-slate-400 pink:text-pink-600 mt-1 leading-tight">Learn cloud concepts with real-world examples.</p>
            </div>
          </div>
          
          {/* Card 3 */}
          <div className="border border-coffee-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300 rounded-xl p-4 flex items-start gap-3 hover:border-purple-300 transition cursor-pointer bg-white dark:bg-slate-800/50">
            <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-500 flex items-center justify-center shrink-0">
              <Palette size={24} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded">Design</span>
              <h4 className="font-bold text-[11px] text-coffee-900 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900 mt-1.5 leading-tight">UI/UX Design</h4>
              <p className="text-[10px] text-coffee-500 dark:text-slate-600 dark:text-slate-400 pink:text-pink-600 mt-1 leading-tight">Create amazing user experiences.</p>
            </div>
          </div>
          
          {/* Card 4 */}
          <div className="border border-coffee-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300 rounded-xl p-4 flex items-start gap-3 hover:border-emerald-300 transition cursor-pointer bg-white dark:bg-slate-800/50">
            <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Shield size={24} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded">Security</span>
              <h4 className="font-bold text-[11px] text-coffee-900 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900 mt-1.5 leading-tight">Cybersecurity Essentials</h4>
              <p className="text-[10px] text-coffee-500 dark:text-slate-600 dark:text-slate-400 pink:text-pink-600 mt-1 leading-tight">Understand modern security practices.</p>
            </div>
          </div>
          
          {/* Card 5 */}
          <div className="border border-coffee-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300 rounded-xl p-4 flex items-start gap-3 hover:border-blue-300 transition cursor-pointer bg-white dark:bg-slate-800/50">
            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Briefcase size={24} />
            </div>
            <div>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded">Business</span>
              <h4 className="font-bold text-[11px] text-coffee-900 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900 mt-1.5 leading-tight">Business Communication</h4>
              <p className="text-[10px] text-coffee-500 dark:text-slate-600 dark:text-slate-400 pink:text-pink-600 mt-1 leading-tight">Improve professional communication skills.</p>
            </div>
          </div>
        </div>
      </div>
</DashboardLayout>
  );
};

export default StudentDashboard;
