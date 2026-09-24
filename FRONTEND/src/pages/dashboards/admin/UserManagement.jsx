import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BookOpen, CheckCircle, Edit2, FolderOpen, Home, Loader, Search, Settings, Shield, Trash2, Users, X } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import adminService from '../../../services/admin.service';

const sidebarItems = [
  { label: 'Overview', path: '/admin/dashboard', icon: Home },
  { category: 'Administration' },
  { label: 'Manage Users', path: '/admin/users', icon: Users },
  { category: 'Management' },
  { label: 'Categories', path: '/admin/categories', icon: FolderOpen },
  { label: 'Courses', path: '/admin/courses', icon: BookOpen },
  { label: 'Certificates', path: '#', icon: Shield },
  { category: 'Account' },
  { label: 'Settings', path: '/admin/profile', icon: Settings },
];

const emptyForm = { name: '', email: '', role: 'Student', accountStatus: 'active' };

const getErrorMessage = (error, fallback) => error?.response?.data?.message || error?.message || fallback;

const formatDate = (value) => {
  if (!value) return 'Unknown';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString();
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers();
      setUsers(response?.users || response?.data?.users || []);
      setError('');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Failed to load users'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => [user.name, user.email, user.role, user.accountStatus]
      .some((value) => String(value || '').toLowerCase().includes(query)));
  }, [searchTerm, users]);

  const openEditor = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'Student',
      accountStatus: user.accountStatus || 'active',
    });
    setError('');
    setSuccess('');
  };

  const closeEditor = () => {
    if (saving) return;
    setEditingUser(null);
    setForm(emptyForm);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const userId = editingUser?._id || editingUser?.id;
    if (!userId) return;

    try {
      setSaving(true);
      setError('');
      const response = await adminService.updateUser(userId, form);
      const updatedUser = response?.user || response?.data?.user;
      setUsers((currentUsers) => currentUsers.map((user) => (
        (user._id || user.id) === userId ? { ...user, ...(updatedUser || form) } : user
      )));
      setSuccess('User updated successfully.');
      closeEditor();
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Failed to update user'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      setError('');
      await adminService.deleteUser(userId);
      setUsers((currentUsers) => currentUsers.filter((user) => (user._id || user.id) !== userId));
      setSuccess('User deleted successfully.');
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Failed to delete user'));
    } finally {
      setDeleteConfirmId(null);
    }
  };

  return (
    <DashboardLayout roleTitle="ADMIN" pageTitle="Manage Users">
      <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--lms-text-primary)]">User Management</h1>
            <p className="text-xs sm:text-sm text-[var(--lms-text-secondary)] mt-1">Review accounts and update access across the platform.</p>
          </div>
          <div className="lms-badge self-start md:self-auto shrink-0">{users.length} users</div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-2">
            <AlertCircle size={17} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-center gap-2">
            <CheckCircle size={17} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="lms-glass-card rounded-2xl overflow-hidden border border-[var(--lms-border)]">
          <div className="p-3 sm:p-5 border-b border-[var(--lms-border)] flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--lms-text-muted)]" />
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name, email, role..."
                className="w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl pl-9 pr-3 py-2.5 text-sm text-[var(--lms-text-primary)] focus:outline-none focus:border-[var(--lms-accent)]"
              />
            </div>
            <span className="text-xs font-medium text-[var(--lms-text-muted)] self-start sm:self-auto">Showing {filteredUsers.length} of {users.length}</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-16">
              <Loader size={28} className="animate-spin text-[var(--lms-accent)]" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-16">
              <Users size={38} className="mx-auto mb-3 text-[var(--lms-text-muted)]" />
              <p className="text-sm font-bold text-[var(--lms-text-primary)]">No users found</p>
              <p className="text-xs text-[var(--lms-text-secondary)] mt-1">Try a different search term.</p>
            </div>
          ) : (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[680px]">
                <thead className="bg-[var(--lms-surface-subtle)] border-b border-[var(--lms-border)] text-[10px] uppercase tracking-wider text-[var(--lms-text-muted)] font-bold">
                  <tr>
                    <th className="px-5 py-4">User</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Joined</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--lms-border-subtle)]">
                  {filteredUsers.map((user) => {
                    const userId = user._id || user.id;
                    const status = user.accountStatus || 'active';
                    return (
                      <tr key={userId} className="hover:bg-[var(--lms-surface-subtle)] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] flex items-center justify-center text-xs font-bold">
                              {(user.name || 'U').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[var(--lms-text-primary)]">{user.name || 'Unnamed user'}</p>
                              <p className="text-xs text-[var(--lms-text-secondary)]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-[var(--lms-text-secondary)]">{user.role || 'Student'}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status === 'active' ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25' : 'bg-amber-500/15 text-amber-500 border border-amber-500/25'}`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-xs text-[var(--lms-text-secondary)]">{formatDate(user.createdAt)}</td>
                        <td className="px-5 py-4">
                          {deleteConfirmId === userId ? (
                            <div className="flex justify-end items-center gap-2">
                              <span className="text-xs font-bold text-rose-500">Delete?</span>
                              <button onClick={() => handleDelete(userId)} className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-xs font-bold">Yes</button>
                              <button onClick={() => setDeleteConfirmId(null)} className="px-2.5 py-1 rounded-lg border border-[var(--lms-border)] text-xs font-bold text-[var(--lms-text-primary)]">No</button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-1.5">
                              <button onClick={() => openEditor(user)} title="Edit user" className="p-2 rounded-xl text-blue-500 hover:bg-blue-500/15 transition-colors"><Edit2 size={15} /></button>
                              <button onClick={() => setDeleteConfirmId(userId)} title="Delete user" className="p-2 rounded-xl text-rose-500 hover:bg-rose-500/15 transition-colors"><Trash2 size={15} /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredUsers.length > 0 && (
            <div className="md:hidden divide-y divide-[var(--lms-border-subtle)]">
              {filteredUsers.map((user) => {
                const userId = user._id || user.id;
                const status = user.accountStatus || 'active';
                return (
                  <article key={userId} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] flex items-center justify-center text-xs font-bold shrink-0">
                          {(user.name || 'U').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--lms-text-primary)] truncate">{user.name || 'Unnamed user'}</p>
                          <p className="text-xs text-[var(--lms-text-secondary)] truncate">{user.email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex shrink-0 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${status === 'active' ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25' : 'bg-amber-500/15 text-amber-500 border border-amber-500/25'}`}>
                        {status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] px-3 py-2">
                        <span className="block text-[10px] uppercase tracking-wider text-[var(--lms-text-muted)]">Role</span>
                        <span className="font-semibold text-[var(--lms-text-primary)]">{user.role || 'Student'}</span>
                      </div>
                      <div className="rounded-xl bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] px-3 py-2">
                        <span className="block text-[10px] uppercase tracking-wider text-[var(--lms-text-muted)]">Joined</span>
                        <span className="font-semibold text-[var(--lms-text-primary)]">{formatDate(user.createdAt)}</span>
                      </div>
                    </div>
                    {deleteConfirmId === userId ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs font-bold text-rose-500 mr-auto">Delete this user?</span>
                        <button onClick={() => handleDelete(userId)} className="px-3 py-2 rounded-lg bg-rose-500 text-white text-xs font-bold">Yes</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-2 rounded-lg border border-[var(--lms-border)] text-xs font-bold text-[var(--lms-text-primary)]">No</button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditor(user)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-500/25 text-blue-500 text-xs font-semibold" title="Edit user"><Edit2 size={14} /> Edit</button>
                        <button onClick={() => setDeleteConfirmId(userId)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-500/25 text-rose-500 text-xs font-semibold" title="Delete user"><Trash2 size={14} /> Delete</button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-[var(--lms-surface-elevated)] rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[95dvh] overflow-y-auto shadow-2xl border border-[var(--lms-border)]">
            <div className="px-6 py-4 border-b border-[var(--lms-border)] flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--lms-text-primary)]">Edit User</h2>
              <button onClick={closeEditor} className="p-1 text-[var(--lms-text-muted)] hover:text-[var(--lms-text-primary)]" aria-label="Close edit user dialog"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {[
                ['name', 'Name', 'text'],
                ['email', 'Email', 'email'],
              ].map(([field, label, type]) => (
                <label key={field} className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)]">
                  {label}
                  <input required type={type} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-2 w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-3 py-2.5 text-sm normal-case tracking-normal text-[var(--lms-text-primary)] focus:outline-none focus:border-[var(--lms-accent)]" />
                </label>
              ))}
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)]">
                Role
                <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className="mt-2 w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-3 py-2.5 text-sm normal-case tracking-normal text-[var(--lms-text-primary)] focus:outline-none focus:border-[var(--lms-accent)]">
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Admin">Admin</option>
                </select>
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--lms-text-secondary)]">
                Account Status
                <select value={form.accountStatus} onChange={(event) => setForm({ ...form, accountStatus: event.target.value })} className="mt-2 w-full bg-[var(--lms-surface-subtle)] border border-[var(--lms-border)] rounded-xl px-3 py-2.5 text-sm normal-case tracking-normal text-[var(--lms-text-primary)] focus:outline-none focus:border-[var(--lms-accent)]">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </label>
              <div className="pt-3 flex justify-end gap-3 border-t border-[var(--lms-border)]">
                <button type="button" onClick={closeEditor} className="lms-btn text-xs" disabled={saving}>Cancel</button>
                <button type="submit" className="lms-btn lms-btn-primary text-xs flex items-center gap-2" disabled={saving}>
                  {saving && <Loader size={14} className="animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserManagement;
