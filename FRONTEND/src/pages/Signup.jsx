import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, BookOpen, Laptop } from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';
import authService from '../services/authService';
import '../styles/auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrorMsg('');
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({ ...prev, role }));
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    if (!authService.isValidEmail(formData.email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    const passwordError = authService.validatePassword(formData.password);
    if (passwordError) {
      setErrorMsg(passwordError);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please check and try again.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.signupWithEmail(formData);
      setSuccessMsg(`Account created successfully as ${formData.role}! Redirecting...`);
      setTimeout(() => {
        navigate('/login');
      }, 1400);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
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
      setErrorMsg('Google sign-up failed.');
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
              <h1 className="auth-brand-title">Join Thousands of Learners Worldwide</h1>
              <p className="auth-brand-desc">
                Create your free EduFlow account to start mastering tech, business, and design skills with top instructors today.
              </p>

              <div style={{ marginTop: '2.5rem' }}>
                <div className="auth-feature-pill">
                  <BookOpen size={18} color="#a5b4fc" />
                  <span>Access 1,000+ interactive courses & resources</span>
                </div>
                <div className="auth-feature-pill">
                  <ShieldCheck size={18} color="#c084fc" />
                  <span>Earn verified credentials & LinkedIn badges</span>
                </div>
                <div className="auth-feature-pill">
                  <Laptop size={18} color="#6ee7b7" />
                  <span>Learn anytime, anywhere on any device</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} EduFlow LMS Inc. All rights reserved.
          </div>
        </div>

        <div className="auth-form-side">
          <div className="auth-card" style={{ maxWidth: '500px' }}>
            <div className="auth-header">
              <h2>Create Your Account</h2>
              <p>Join as a Student or Instructor to start learning</p>
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
              onClick={handleGoogleSignup}
              loading={googleLoading}
              text="Continue with Google"
            />

            <div className="auth-divider">
              <span>OR REGISTER WITH EMAIL</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Select Account Role</label>
                <div className="role-selector-group">
                  <div
                    className={`role-option-pill ${formData.role === 'student' ? 'active' : ''}`}
                    onClick={() => handleRoleSelect('student')}
                  >
                    <GraduationCap size={18} />
                    <span>Student</span>
                  </div>
                  <div
                    className={`role-option-pill ${formData.role === 'instructor' ? 'active' : ''}`}
                    onClick={() => handleRoleSelect('instructor')}
                  >
                    <Laptop size={18} />
                    <span>Instructor</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    name="fullName"
                    className="form-input"
                    placeholder="Alex Morgan"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="alex@example.com"
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
                    className="form-input"
                    placeholder="At least 6 characters"
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

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="form-input"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={18} />
              </button>
            </form>

            <div className="auth-footer-prompt">
              Already have an account?{' '}
              <Link to="/signup" className="auth-link">
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
