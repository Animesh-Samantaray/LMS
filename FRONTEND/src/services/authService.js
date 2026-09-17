import api, { API_BASE_URL } from './api.service';

export const register = async (name, email, password, role, adminAccessToken) => {
  const payload = { name, email, password, role };

  if (adminAccessToken) {
    payload.adminAccessToken = adminAccessToken;
  }

  const response = await api.post('/api/auth/register', payload);
  return response.data;
};

export const login = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/api/auth/logout');
  return response.data;
};

export const sendResetPasswordOtp = async (email) => {
  const response = await api.post('/api/auth/forgot-password', { email });
  return response.data;
};

export const verifyResetPasswordOtp = async (email, otp) => {
  const response = await api.post('/api/auth/verify-reset-otp', { email, otp });
  return response.data;
};

export const changePassword = async (email, otp, newPassword) => {
  const response = await api.post('/api/auth/reset-password', {
    email,
    otp,
    newPassword,
  });
  return response.data;
};

export const verify2FA = async (email, otp) => {
  const response = await api.post('/api/auth/verify-2fa', { email, otp });
  return response.data;
};

export const get2FAStatus = async () => {
  const response = await api.get('/api/auth/2fa/status');
  return response.data;
};

export const update2FA = async (enabled) => {
  const response = await api.post(
    enabled ? '/api/auth/2fa/enable' : '/api/auth/2fa/disable'
  );
  return response.data;
};

export const startGoogleAuth = (role) => {
  const query = role ? `?role=${encodeURIComponent(role)}` : '';
  window.location.assign(`${API_BASE_URL}/api/auth/google${query}`);
};

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  return null;
};

export const authService = {
  register,
  login,
  getMe,
  logout,
  sendResetPasswordOtp,
  verifyResetPasswordOtp,
  changePassword,
  verify2FA,
  get2FAStatus,
  update2FA,
  startGoogleAuth,
  isValidEmail,
  validatePassword,
};

export default authService;
