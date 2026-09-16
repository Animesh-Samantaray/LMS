import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';
import authService from '../services/authService';
import '../styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.email) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!authService.isValidEmail(formData.email)) {
      setErrorMsg('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }
    if (!formData.password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.loginWithEmail(formData);
      setSuccessMsg(`Welcome back, ${res.user.name}! Redirecting...`);
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid login credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    try {
      setGoogleLoading(true);
      const res = await authService.loginWithGoogle();
      setSuccessMsg(res.message || 'Google Auth UI initialized. Connecting...');
      setTimeout(() => {
        navigate('/');
      }, 1200);
    } catch (err) {
      setErrorMsg('Google authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-split-wrapper">
        <div className="auth-brand-side">
          <div>
            <Link to="/" className="navbar-logo">
              <div className="navbar-logo-icon">
                <GraduationCap size={22} />
              </div>
              <span>Edu<span className="text-gradient">Flow</span></span>
            </Link>

            <div className="auth-brand-content">
              <h1 className="auth-brand-title">Welcome Back to Your Learning Hub</h1>
              <p className="auth-brand-desc">
                Access your enrolled courses, pick up where you left off in video lessons, track your upcoming quiz deadlines, and view verified certificates.
              </p>

              <div style={{ marginTop: '2.5rem' }}>
                <div className="auth-feature-pill">
                  <CheckCircle2 size={18} color="#6ee7b7" />
                  <span>Resume video progress across desktop & mobile</span>
                </div>
                <div className="auth-feature-pill">
                  <CheckCircle2 size={18} color="#6ee7b7" />
                  <span>Automated quiz grading & instant score alerts</span>
                </div>
                <div className="auth-feature-pill">
                  <CheckCircle2 size={18} color="#6ee7b7" />
                  <span>24/7 Academic support and course discussions</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} EduFlow LMS Inc. All rights reserved.
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Sign in to EduFlow</h2>
              <p>Enter your account credentials to continue</p>
            </div>

            {errorMsg && (
              <div className="error-alert" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', color: '#6ee7b7', fontSize: '0.88rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            <GoogleAuthButton
              onClick={handleGoogleLogin}
              loading={googleLoading}
              text="Continue with Google"
            />

            <div className="auth-divider">
              <span>OR LOGIN WITH EMAIL</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    className={`form-input ${errorMsg && !formData.email ? 'has-error' : ''}`}
                    placeholder="student@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={`form-input ${errorMsg && !formData.password ? 'has-error' : ''}`}
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="form-options-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    style={{ accentColor: 'var(--accent-indigo)' }}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your email.'); }} className="auth-link">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem' }}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'} <ArrowRight size={18} />
              </button>
            </form>

            <div className="auth-footer-prompt">
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
