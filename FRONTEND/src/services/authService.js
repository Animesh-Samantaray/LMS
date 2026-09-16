export const authService = {
  async loginWithEmail({ email, password, rememberMe }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email || !password) {
          reject(new Error('Email and password are required.'));
          return;
        }
        resolve({
          success: true,
          user: {
            id: 'usr_101',
            email,
            name: email.split('@')[0],
            role: 'student'
          },
          token: 'mock_jwt_token_xyz123'
        });
      }, 600);
    });
  },

  async signupWithEmail({ fullName, email, password, role }) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!fullName || !email || !password || !role) {
          reject(new Error('All fields are required for account creation.'));
          return;
        }

        resolve({
          success: true,
          user: {
            id: 'usr_' + Date.now(),
            name: fullName,
            email,
            role
          },
          token: 'mock_jwt_token_signup_abc'
        });
      }, 600);
    });
  },

  async loginWithGoogle() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || null;

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          provider: 'google',
          message: 'Google Auth UI initialized. Connect VITE_GOOGLE_CLIENT_ID for live OAuth grant.'
        });
      }, 500);
    });
  },

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  validatePassword(password) {
    if (!password) return 'Password is required.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  }
};

export default authService;
