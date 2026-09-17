import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import studentService from '../../services/student.service';
import instructorService from '../../services/instructor.service';
import adminService from '../../services/admin.service';
import { User, Mail, Save, Loader2, CheckCircle2, AlertCircle, LayoutDashboard, BookOpen, PlayCircle, Users, Calendar, BarChart2, UserCheck, DollarSign, Settings } from 'lucide-react';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    phone: '',
    location: ''
  });

  const isStudent = user?.role === 'Student';
  const isInstructor = user?.role === 'Instructor';
  const isAdmin = user?.role === 'Admin';

  const roleTitle = isAdmin ? 'ADMIN' : isInstructor ? 'MENTOR' : 'STUDENT';
  const dashboardPath = isAdmin ? '/admin/dashboard' : isInstructor ? '/instructor/dashboard' : '/student/dashboard';
  const profilePath = isAdmin ? '/admin/profile' : isInstructor ? '/instructor/profile' : '/student/profile';

  const studentSidebar = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', path: '#', icon: BookOpen },
    { label: 'Learning', path: '#', icon: PlayCircle },
    { label: 'Profile', path: '/student/profile', icon: User },
  ];

  const instructorSidebar = [
    { label: 'Dashboard', path: '/instructor/dashboard', icon: LayoutDashboard },
    { label: 'My Students', path: '#', icon: Users },
    { label: 'Courses', path: '#', icon: BookOpen },
    { label: 'Sessions', path: '#', icon: Calendar },
    { label: 'Analytics', path: '#', icon: BarChart2 },
    { label: 'Profile', path: '/instructor/profile', icon: User },
  ];

  const adminSidebar = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '#', icon: Users },
    { label: 'Courses', path: '#', icon: BookOpen },
    { label: 'Mentors', path: '#', icon: UserCheck },
    { label: 'Revenue', path: '#', icon: DollarSign },
    { label: 'Settings', path: '/admin/profile', icon: Settings },
  ];

  const sidebarItems = isAdmin ? adminSidebar : isInstructor ? instructorSidebar : studentSidebar;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        let data;
        if (isStudent) data = await studentService.getStudentProfile();
        else if (isInstructor) data = await instructorService.getInstructorProfile();
        else if (isAdmin) data = await adminService.getAdminProfile();

        const profileObj = data?.profile || data?.user || {};
        const userObj = data?.user || {};

        setFormData({
          name: userObj.name || user?.name || '',
          email: userObj.email || user?.email || '',
          bio: profileObj.bio || '',
          phone: profileObj.phone || '',
          location: profileObj.location || ''
        });
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user, isStudent, isInstructor, isAdmin]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (isStudent) {
        await studentService.updateStudentProfile(formData);
      } else if (isInstructor) {
        await instructorService.updateInstructorProfile(formData);
      } else if (isAdmin) {
        await adminService.updateAdminProfile(formData);
      }
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} roleTitle={roleTitle}>
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} roleTitle={roleTitle}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Profile Settings</h2>
          
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 text-red-600 text-sm mb-6 border border-red-100">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 text-emerald-600 text-sm mb-6 border border-emerald-100">
              <CheckCircle2 size={18} className="flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email !== undefined ? formData.email : user?.email || ''}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {!isAdmin && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 234 567 8900"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                  ></textarea>
                </div>
              </>
            )}

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-70"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileSettings;
