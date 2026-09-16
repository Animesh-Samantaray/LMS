const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const request = async (path, options = {}) => {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  } catch {
    throw new Error('Unable to reach the server. Please check your connection and try again.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const error = new Error(data.message || 'Something went wrong. Please try again.');
    error.status = response.status;
    throw error;
  }

  return data;
};

export const authService = {
  loginWithEmail({ email, password }) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  signupWithEmail({ fullName, email, password, role }) {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: fullName, email, password, role })
    });
  },

  getCurrentUser() {
    return request('/api/auth/me');
  },

  logout() {
    return request('/api/auth/logout', { method: 'POST' });
  },

  forgotPassword(email) {
    return request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  verifyResetOtp(email, otp) {
    return request('/api/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    });
  },

  resetPassword(email, otp, newPassword) {
    return request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword })
    });
  },

  startGoogleAuth(role) {
    const query = role ? `?role=${encodeURIComponent(role)}` : '';
    window.location.assign(`${API_BASE_URL}/api/auth/google${query}`);
  },

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword(password) {
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    return null;
  }
};

export default authService;
