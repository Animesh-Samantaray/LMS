
import React, { useState, useEffect } from 'react';
import { Users, BookOpen, GraduationCap, Award, FileText, CheckCircle, Clock, AlertCircle, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import DashboardLayout from '../../../components/DashboardLayout';
import api from '../../../services/api.service';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/analytics/admin?range=${range}`);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <DashboardLayout role="Admin">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--lms-accent)]"></div>
        </div>
      </DashboardLayout>
    );
  }

  const { overview, users, courses, reports } = data;

  return (
    <DashboardLayout role="Admin">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--lms-text-primary)]">Platform Analytics</h1>
            <p className="text-sm text-[var(--lms-text-secondary)]">Overview of all system activity and metrics</p>
          </div>
          <div className="flex gap-2 bg-[var(--lms-surface-elevated)] p-1 rounded-xl border border-[var(--lms-border)]">
            {['7d', '30d', '90d', 'all'].map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${range === r ? 'bg-[var(--lms-accent)] text-white shadow-sm' : 'text-[var(--lms-text-secondary)] hover:bg-[var(--lms-surface-hover)]'}`}
              >
                {r === 'all' ? 'All Time' : r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: overview.totalUsers, icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
            { label: 'Enrollments', value: overview.totalEnrollments, icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
            { label: 'Total Courses', value: overview.totalCourses, icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
            { label: 'Avg Rating', value: `${overview.averageRating}/5`, icon: Award, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-500/10' },
          ].map((k, i) => (
            <div key={i} className="bg-[var(--lms-surface)] border border-[var(--lms-border)] p-5 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className={`p-4 rounded-2xl ${k.bg}`}>
                <k.icon size={24} className={k.color} />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--lms-text-muted)] uppercase tracking-wider">{k.label}</p>
                <h3 className="text-2xl font-bold text-[var(--lms-text-primary)] mt-1">{k.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Growth Chart */}
          <div className="lg:col-span-2 bg-[var(--lms-surface)] border border-[var(--lms-border)] p-5 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold mb-4">User Growth Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={users.growthTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--lms-border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--lms-text-muted)" fontSize={12} tickLine={false} />
                  <YAxis stroke="var(--lms-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--lms-border)' }} />
                  <Line type="monotone" dataKey="users" stroke="var(--lms-accent)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Roles */}
          <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] p-5 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold mb-4">User Demographics</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={users.roleDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {users.roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Courses */}
          <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] p-5 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold mb-4">Top Courses by Enrollment</h3>
            <div className="space-y-4 mt-4">
              {courses.topCourses.map((c, i) => (
                <div key={c._id} className="flex items-center justify-between p-3 bg-[var(--lms-surface-subtle)] rounded-xl border border-[var(--lms-border)]">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[var(--lms-accent)]/10 text-[var(--lms-accent)] flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[200px]">{c.title}</p>
                      <p className="text-xs text-[var(--lms-text-muted)]">{c.instructor}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[var(--lms-text-primary)]">{c.enrollments}</p>
                    <p className="text-xs text-[var(--lms-text-muted)]">learners</p>
                  </div>
                </div>
              ))}
              {courses.topCourses.length === 0 && (
                <p className="text-sm text-center py-4 text-[var(--lms-text-muted)]">No course data available.</p>
              )}
            </div>
          </div>

          {/* Reports Status */}
          <div className="bg-[var(--lms-surface)] border border-[var(--lms-border)] p-5 rounded-2xl shadow-sm">
            <h3 className="text-base font-bold mb-4">Moderation Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reports.statusDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--lms-border)" />
                  <XAxis type="number" stroke="var(--lms-text-muted)" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="var(--lms-text-muted)" fontSize={12} axisLine={false} tickLine={false} width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--lms-accent)" radius={[0, 4, 4, 0]} barSize={24}>
                    {reports.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
