import React, { useEffect, useState } from 'react';
import { LayoutDashboard, BookOpen, GraduationCap, User, PlayCircle, CheckCircle } from 'lucide-react';
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
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', path: '#', icon: BookOpen },
    { label: 'Learning', path: '#', icon: PlayCircle },
    { label: 'Profile', path: '/student/profile', icon: User },
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">My Learning</h3>
              <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
                View all courses &rarr;
              </button>
            </div>

            {courses.length > 0 ? (
              <div className="space-y-4">
                {courses.map((course, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800/50 hover:border-slate-200 dark:border-slate-800 hover:shadow-sm dark:shadow-none transition-all">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <BookOpen size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{course.title || course.name || 'Course Name'}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{ width: `${course.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{course.progress || 0}%</span>
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
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                  <BookOpen size={32} />
                </div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">No courses found</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">You are not enrolled in any active courses.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg dark:shadow-none shadow-blue-500/30 mb-4 overflow-hidden">
              {profileData?.user?.profileImage || profileData?.profile?.profileImage ? (
                <img src={profileData?.user?.profileImage || profileData?.profile?.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                 user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'ST'
              )}
            </div>
            
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-6">{user?.email}</p>

            <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/50 pt-6">
              <div className="text-center">
                <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{courses.length}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Enrolled</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{stats.completed || 0}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Certificates</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
