import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Github, Twitter, Linkedin, Youtube, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="footer-grid">
          <div>
            <Link to="/" className="navbar-logo" style={{ marginBottom: '1.25rem' }}>
              <div className="navbar-logo-icon">
                <GraduationCap size={22} />
              </div>
              <span>Edu<span className="text-gradient">Flow</span></span>
            </Link>
            <p style={{ maxWidth: '320px', fontSize: '0.92rem', lineHeight: '1.6' }}>
              Empowering global learning through modern, cloud-native LMS tools for students, instructors, and forward-thinking institutions.
            </p>
          </div>

          <div>
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-links">
              <li><Link to="/" className="footer-link">Overview</Link></li>
              <li><a href="#features" className="footer-link">Features</a></li>
              <li><a href="#courses" className="footer-link">Course Catalog</a></li>
              <li><a href="#analytics" className="footer-link">Analytics Dashboard</a></li>
              <li><Link to="/login" className="footer-link">Student Portal</Link></li>
              <li><Link to="/login" className="footer-link">Instructor Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Popular Domains</h4>
            <ul className="footer-links">
              <li><a href="#courses" className="footer-link">Software Engineering</a></li>
              <li><a href="#courses" className="footer-link">Artificial Intelligence</a></li>
              <li><a href="#courses" className="footer-link">Data Science & Analytics</a></li>
              <li><a href="#courses" className="footer-link">UI/UX Design</a></li>
              <li><a href="#courses" className="footer-link">Cloud Computing & DevOps</a></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-col-title">Connect With Us</h4>
            <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              Have questions? Reach out to our 24/7 academic support team.
            </p>
            <div style={{ display: 'flex', gap: '0.85rem', marginTop: '1rem' }}>
              <a href="#" className="btn btn-secondary" style={{ padding: '0.6rem', borderRadius: '50%' }} aria-label="GitHub">
                <Github size={18} />
              </a>
              <a href="#" className="btn btn-secondary" style={{ padding: '0.6rem', borderRadius: '50%' }} aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="btn btn-secondary" style={{ padding: '0.6rem', borderRadius: '50%' }} aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a href="#" className="btn btn-secondary" style={{ padding: '0.6rem', borderRadius: '50%' }} aria-label="YouTube">
                <Youtube size={18} />
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} EduFlow LMS. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Designed with <Heart size={15} color="#ef4444" fill="#ef4444" /> for modern learning.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
