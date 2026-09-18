export const getDashboardPath = (role) => {
  const normalizedRole = role?.toLowerCase();
  if (normalizedRole === 'admin') return '/admin/dashboard';
  if (normalizedRole === 'instructor') return '/instructor/dashboard';
  return '/student/dashboard';
};
