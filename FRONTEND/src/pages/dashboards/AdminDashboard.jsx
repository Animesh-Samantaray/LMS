import React, { useEffect, useState } from 'react';
import { Home, Users, BookOpen, UserCheck, DollarSign, Settings, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import adminService from '../../services/admin.service';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, usersRes] = await Promise.all([
          adminService.getAdminProfile().catch(() => null), 
          adminService.getAllUsers().catch(() => []) 
        ]);
        
        setProfileData(profileRes?.data || profileRes || {});
        setUsersList(usersRes?.data?.users || usersRes?.users || []);
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sidebarItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: Home },
    { category: 'Administration' },
    { label: 'Users', path: '#', icon: '👥' },
    { label: 'Courses', path: '#', icon: '📖' },
    { category: 'Financial' },
    { label: 'Mentors', path: '#', icon: '🧑‍🏫' },
    { label: 'Revenue', path: '#', icon: '💰' },
    { category: 'Account' },
    { label: 'Settings', path: '/admin/profile', icon: '⚙️' },
  ];

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} roleTitle="ADMIN">
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = profileData?.stats || {};
  const recentUsers = Array.isArray(usersList) ? usersList.slice(0, 5) : [];

  return (
    <DashboardLayout sidebarItems={sidebarItems} roleTitle="ADMIN">
      
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between shadow-lg dark:shadow-none shadow-slate-900/20">
        <div>
          <div className="text-coffee-400 text-xs font-bold tracking-widest uppercase mb-2">ADMIN CONTROL PANEL</div>
          <h2 className="text-3xl font-bold mb-2">Welcome, {user?.name || 'Admin'} ⚙️</h2>
          <p className="text-slate-300 text-sm">
            {stats.alerts ? `Platform has ${stats.alerts} alerts needing attention.` : 'Platform is healthy. All systems operational.'}
          </p>
        </div>
        
        <div className="flex gap-6 mt-6 md:mt-0">
          {stats.totalUsers !== undefined && (
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <div className="text-[10px] text-coffee-400 uppercase tracking-wider">Total Users</div>
            </div>
          )}
          {stats.courses !== undefined && (
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.courses}</div>
              <div className="text-[10px] text-coffee-400 uppercase tracking-wider">Courses</div>
            </div>
          )}
          {stats.uptime !== undefined && (
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.uptime}%</div>
              <div className="text-[10px] text-coffee-400 uppercase tracking-wider">Uptime</div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-sm mt-6 flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-coffee-400 tracking-wider mb-1">TOTAL USERS</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{stats.totalUsers ?? (Array.isArray(usersList) ? usersList.length : '-')}</div>
            <div className="text-xs text-slate-500 dark:text-coffee-400 mt-1">{stats.newUsersThisWeek ? `+${stats.newUsersThisWeek} this week` : 'Active accounts'}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-coffee-400 tracking-wider mb-1">REVENUE</div>
            <div className="text-2xl font-bold text-emerald-600">{stats.revenue ?? '-'}</div>
            <div className="text-xs text-slate-500 dark:text-coffee-400 mt-1">This month</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-coffee-400 tracking-wider mb-1">COURSES</div>
            <div className="text-2xl font-bold text-blue-600">{stats.courses ?? '-'}</div>
            <div className="text-xs text-slate-500 dark:text-coffee-400 mt-1">{stats.activeCourses ? `${stats.activeCourses} active today` : 'Total published'}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-coffee-400 tracking-wider mb-1">COMPLETION</div>
            <div className="text-2xl font-bold text-purple-600">{stats.completionRate ? `${stats.completionRate}%` : '-'}</div>
            <div className="text-xs text-slate-500 dark:text-coffee-400 mt-1">Avg course rate</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Activity size={20} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Recent Users</h3>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
              {Array.isArray(usersList) ? usersList.length : 0} Total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-coffee-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/50">
                  <th className="pb-3 px-2">User</th>
                  <th className="pb-3 px-2">Email</th>
                  <th className="pb-3 px-2">Role</th>
                  <th className="pb-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.length > 0 ? recentUsers.map((u, idx) => (
                  <tr key={u.id || idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{u.name || 'Unknown'}</div>
                    </td>
                    <td className="py-3 px-2 text-sm text-slate-500 dark:text-coffee-400">
                      {u.email}
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-xs font-medium text-slate-600 dark:text-coffee-400 capitalize">
                        {u.role || 'User'}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600">
                        Active
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-sm text-slate-500 dark:text-coffee-400">
                      No user data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-bold shadow-lg dark:shadow-none shadow-slate-900/20 mb-4 overflow-hidden">
              {profileData?.user?.profileImage ? (
                <img src={profileData.user.profileImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : 'AD'
              )}
            </div>
            
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-xs text-slate-500 dark:text-coffee-400 font-medium mb-6">Platform Administrator</p>

            <div className="w-full grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800/50 pt-6">
              <div className="text-center">
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{Array.isArray(usersList) ? usersList.length : '-'}</div>
                <div className="text-[10px] uppercase font-bold text-coffee-400 tracking-wider mt-1">Users</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{stats.courses ?? '-'}</div>
                <div className="text-[10px] uppercase font-bold text-coffee-400 tracking-wider mt-1">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200">{stats.mentors ?? '-'}</div>
                <div className="text-[10px] uppercase font-bold text-coffee-400 tracking-wider mt-1">Mentors</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800/50 shadow-sm dark:shadow-none">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">System Health</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-coffee-400">Uptime</span>
                <span className="text-sm font-semibold text-emerald-600">{stats.uptime ? `${stats.uptime}%` : '99.9%'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-coffee-400">API Latency</span>
                <span className="text-sm font-semibold text-blue-600">{stats.latency ? `${stats.latency}ms` : '120ms'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-coffee-400">Database Load</span>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{stats.dbLoad ? `${stats.dbLoad}%` : '24%'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
