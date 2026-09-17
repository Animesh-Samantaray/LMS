import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, BookOpen, Calendar, BarChart2, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import instructorService from '../../services/instructor.service';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await instructorService.getInstructorProfile();
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
    { label: 'Dashboard', path: '/instructor/dashboard', icon: LayoutDashboard },
    { label: 'My Students', path: '#', icon: Users },
    { label: 'Courses', path: '#', icon: BookOpen },
    { label: 'Sessions', path: '#', icon: Calendar },
    { label: 'Analytics', path: '#', icon: BarChart2 },
    { label: 'Profile', path: '/instructor/profile', icon: User },
  ];

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} roleTitle="MENTOR">
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = profileData?.stats || {};
  const students = profileData?.students || [];
  const sessions = profileData?.sessions || [];

  return (
    <DashboardLayout sidebarItems={sidebarItems} roleTitle="MENTOR">
      
      <div className="bg-blue-600 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between shadow-lg dark:shadow-none shadow-blue-500/20">
        <div>
          <div className="text-blue-200 text-xs font-bold tracking-widest uppercase mb-2">MENTOR PORTAL</div>
          <h2 className="text-3xl font-bold mb-2">Hello, {user?.name || 'Instructor'} 👨‍🏫</h2>
          <p className="text-blue-100 text-sm">
            {stats.attentionNeeded !== undefined 
              ? `${stats.attentionNeeded} students need your attention today.` 
              : 'Here is your daily mentor overview.'}
          </p>
        </div>

        <div className="flex gap-6 mt-6 md:mt-0">
          {stats.students !== undefined && (
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.students}</div>
              <div className="text-[10px] text-blue-200 uppercase tracking-wider">Students</div>
            </div>
          )}
          {stats.rating !== undefined && (
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.rating}★</div>
              <div className="text-[10px] text-blue-200 uppercase tracking-wider">Rating</div>
            </div>
          )}
          {stats.courses !== undefined && (
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.courses}</div>
              <div className="text-[10px] text-blue-200 uppercase tracking-wider">Courses</div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm mt-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">STUDENTS</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.students ?? '-'}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Assigned to you</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">AVG SCORE</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.avgScore ? `${stats.avgScore}%` : '-'}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Cohort average</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BarChart2 size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">AT RISK</div>
            <div className="text-2xl font-bold text-red-600">{stats.atRisk ?? '-'}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Need attention</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">SESSIONS</div>
            <div className="text-2xl font-bold text-purple-600">{stats.sessions ?? '-'}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">This week</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Calendar size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Student Progress</h3>
            <button className="text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
              View all &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/50">
                  <th className="pb-3 px-2">Student</th>
                  <th className="pb-3 px-2">Course</th>
                  <th className="pb-3 px-2">Progress</th>
                  <th className="pb-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? students.map((student, idx) => (
                  <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center">
                          {student.name?.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {student.course || '-'}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${student.progress < 50 ? 'bg-red-500' : 'bg-blue-500'}`} 
                            style={{ width: `${student.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{student.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        student.status === 'Needs Help' || student.status === 'At Risk' 
                          ? 'bg-red-50 text-red-600' 
                          : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {student.status || 'On Track'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                      No student progress data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg dark:shadow-none shadow-blue-500/30 mb-4 overflow-hidden">
              {profileData?.user?.profileImage || profileData?.profile?.profileImage ? (
                <img src={profileData?.user?.profileImage || profileData?.profile?.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'IN'
              )}
            </div>
            
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-6">
              {profileData?.profile?.designation || 'Instructor / Mentor'}
            </p>

            <div className="w-full grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800/50 pt-6">
              <div className="text-center">
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{stats.students ?? '-'}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Students</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{stats.courses ?? '-'}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{stats.rating ?? '-'}</div>
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-1">Rating</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Upcoming Sessions</h3>
            {sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((session, idx) => (
                  <div key={idx} className="p-3 border border-slate-100 dark:border-slate-800/50 rounded-xl hover:border-blue-100 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{session.title || session.studentName}</span>
                      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wide">
                        {session.type || 'Review'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{session.time || 'Time TBD'} &bull; {session.date || 'Today'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
                No upcoming sessions found.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InstructorDashboard;
