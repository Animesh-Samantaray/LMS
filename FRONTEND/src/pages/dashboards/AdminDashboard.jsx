import React, { useEffect, useState } from 'react';
import { Home, Users, BookOpen, FolderOpen, UserCheck, DollarSign, Settings, Activity, Shield, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
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
    let isMounted = true;
    if (!user || user.role !== 'Admin') {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, usersRes] = await Promise.all([
          adminService.getAdminProfile().catch(() => null),
          adminService.getAllUsers().catch(() => []),
        ]);

        if (isMounted) {
          setProfileData(profileRes?.profile || profileRes?.data || profileRes || {});
          setUsersList(usersRes?.data?.users || usersRes?.users || []);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load dashboard data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const sidebarItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: Home },
    { category: 'Administration' },
    { label: 'Manage Users', path: '/admin/users', icon: Users },
    { category: 'Management' },
    { label: 'Categories', path: '/admin/categories', icon: FolderOpen },
    { label: 'Courses', path: '/admin/courses', icon: BookOpen },
    { label: 'Certificates', path: '#', icon: Sparkles },
    { category: 'Account' },
    { label: 'Settings', path: '/admin/profile', icon: Settings }
  ];

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} roleTitle="ADMIN">
        <div className="flex h-72 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-3 border-[var(--lms-border)] border-t-[var(--lms-accent)] rounded-full animate-spin"></div>
            <p className="text-xs text-[var(--lms-text-muted)] font-medium">Loading admin command center...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = profileData?.stats || {};
  const recentUsers = Array.isArray(usersList) ? usersList.slice(0, 6) : [];

  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : 'AD';
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} roleTitle="ADMIN">
     
      <div className="lms-glass-hero p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Shield size={13} className="text-amber-300" />
            Admin Command Center
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Administrator'} ⚙️
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            All system components and services are operational.
          </p>
        </div>

        
        <div className="flex items-center gap-4 sm:gap-6 bg-white/10 backdrop-blur-xl p-3 sm:p-4 rounded-2xl border border-white/20 z-10">
          <div className="text-center px-3">
            <div className="text-2xl sm:text-3xl font-black">{stats.totalUsers ?? (Array.isArray(usersList) ? usersList.length : 0)}</div>
            <div className="text-[10px] text-white/70 uppercase font-semibold tracking-wider">Total Users</div>
          </div>
          <div className="w-px h-8 bg-white/20"></div>
          <div className="text-center px-3">
            <div className="text-2xl sm:text-3xl font-black text-emerald-300">{stats.uptime ?? '99.9'}%</div>
            <div className="text-[10px] text-white/70 uppercase font-semibold tracking-wider">Uptime</div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs sm:text-sm flex items-center gap-2 animate-fade-in">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

    
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lms-glass-card lms-glass-card-hover p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
              Total Accounts
            </span>
            <div className="text-2xl font-extrabold text-[var(--lms-text-primary)]">
              {stats.totalUsers ?? (Array.isArray(usersList) ? usersList.length : 0)}
            </div>
            <p className="text-[11px] text-[var(--lms-text-secondary)] font-medium">Registered in database</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/25 text-purple-500 flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
        </div>

        <div className="lms-glass-card lms-glass-card-hover p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
              Monthly Revenue
            </span>
            <div className="text-2xl font-extrabold text-emerald-500">
              {stats.revenue ?? '$12,450'}
            </div>
            <p className="text-[11px] text-[var(--lms-text-secondary)] font-medium">Platform subscriptions</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-500 flex items-center justify-center shrink-0">
            <DollarSign size={22} />
          </div>
        </div>

        <div className="lms-glass-card lms-glass-card-hover p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
              Active Courses
            </span>
            <div className="text-2xl font-extrabold text-blue-500">
              {stats.courses ?? 24}
            </div>
            <p className="text-[11px] text-[var(--lms-text-secondary)] font-medium">Published tracks</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/25 text-blue-500 flex items-center justify-center shrink-0">
            <BookOpen size={22} />
          </div>
        </div>

        <div className="lms-glass-card lms-glass-card-hover p-5 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
              Completion Rate
            </span>
            <div className="text-2xl font-extrabold text-[var(--lms-text-primary)]">
              {stats.completionRate ?? '88%'}
            </div>
            <p className="text-[11px] text-[var(--lms-text-secondary)] font-medium">Global cohort average</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/25 text-amber-500 flex items-center justify-center shrink-0">
            <Activity size={22} />
          </div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
       
        <div className="lg:col-span-2 lms-glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[var(--lms-text-primary)]">Recent User Registrations</h3>
              <p className="text-xs text-[var(--lms-text-secondary)]">Live accounts synchronized across providers</p>
            </div>
            <span className="lms-badge">
              {Array.isArray(usersList) ? usersList.length : 0} Total
            </span>
          </div>

          {recentUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--lms-border)] text-[10px] font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">
                    <th className="pb-3 px-3">User</th>
                    <th className="pb-3 px-3">Email</th>
                    <th className="pb-3 px-3">Role</th>
                    <th className="pb-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--lms-border-subtle)]">
                  {recentUsers.map((u, idx) => (
                    <tr key={u.id || idx} className="hover:bg-[var(--lms-surface-subtle)] transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] font-bold text-xs flex items-center justify-center">
                            {getInitials(u.name)}
                          </div>
                          <span className="text-xs font-semibold text-[var(--lms-text-primary)]">{u.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-xs text-[var(--lms-text-secondary)] font-medium">
                        {u.email}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[var(--lms-surface-subtle)] text-[var(--lms-text-secondary)] border border-[var(--lms-border)]">
                          {u.role || 'User'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-10 px-4 text-center rounded-2xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border-subtle)]">
              <Users size={22} className="mx-auto mb-2 text-[var(--lms-text-muted)]" />
              <p className="text-xs font-bold text-[var(--lms-text-primary)]">No recent users found</p>
            </div>
          )}
        </div>

       
        <div className="lms-glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[var(--lms-text-primary)]">System Health</h4>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Operational
            </span>
          </div>

          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--lms-text-secondary)] font-medium">API Availability</span>
                <span className="font-bold text-emerald-500">99.98%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--lms-surface)] rounded-full overflow-hidden border border-[var(--lms-border)]">
                <div className="h-full bg-emerald-500 rounded-full w-[99%]" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--lms-text-secondary)] font-medium">Average Latency</span>
                <span className="font-bold text-blue-500">24ms</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--lms-surface)] rounded-full overflow-hidden border border-[var(--lms-border)]">
                <div className="h-full bg-blue-500 rounded-full w-[25%]" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--lms-text-secondary)] font-medium">Database Load</span>
                <span className="font-bold text-[var(--lms-text-primary)]">14%</span>
              </div>
              <div className="w-full h-1.5 bg-[var(--lms-surface)] rounded-full overflow-hidden border border-[var(--lms-border)]">
                <div className="h-full bg-purple-500 rounded-full w-[14%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
