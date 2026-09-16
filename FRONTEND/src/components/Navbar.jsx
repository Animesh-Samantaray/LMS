import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GraduationCap, Menu, X, ArrowRight } from 'lucide-react';
import '../styles/navbar.css';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavClick = (anchorId) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/' + anchorId);
      return;
    }
    if (anchorId.startsWith('#')) {
      const el = document.querySelector(anchorId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="navbar-header">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <GraduationCap size={22} />
          </div>
          <span>Edu<span className="text-gradient">Flow</span></span>
        </Link>

        <nav>
          <ul className="navbar-nav">
            <li>
              <Link to="/" className="navbar-link active">Home</Link>
            </li>
            <li>
              <a href="#courses" onClick={(e) => { e.preventDefault(); handleNavClick('#courses'); }} className="navbar-link">Courses</a>
            </li>
            <li>
              <a href="#features" onClick={(e) => { e.preventDefault(); handleNavClick('#features'); }} className="navbar-link">Features</a>
            </li>
            <li>
              <a href="#about" onClick={(e) => { e.preventDefault(); handleNavClick('#about'); }} className="navbar-link">About</a>
            </li>
            <li>
              <a href="#contact" onClick={(e) => { e.preventDefault(); handleNavClick('#contact'); }} className="navbar-link">Contact</a>
            </li>
          </ul>
        </nav>

        <div className="navbar-actions navbar-actions-desktop">
          <button onClick={() => navigate('/login')} className="btn btn-outline">
            Login
          </button>
          <button onClick={() => navigate('/signup')} className="btn btn-primary">
            Get Started <ArrowRight size={16} />
          </button>
        </div>

        <button
          className="navbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <div className={`mobile-nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <Link to="/" onClick={() => setMobileMenuOpen(false)} className="navbar-link">Home</Link>
        <a href="#courses" onClick={(e) => { e.preventDefault(); handleNavClick('#courses'); }} className="navbar-link">Courses</a>
        <a href="#features" onClick={(e) => { e.preventDefault(); handleNavClick('#features'); }} className="navbar-link">Features</a>
        <a href="#about" onClick={(e) => { e.preventDefault(); handleNavClick('#about'); }} className="navbar-link">About</a>
        <a href="#contact" onClick={(e) => { e.preventDefault(); handleNavClick('#contact'); }} className="navbar-link">Contact</a>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
          <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="btn btn-outline" style={{ width: '100%' }}>
            Login
          </button>
          <button onClick={() => { setMobileMenuOpen(false); navigate('/signup'); }} className="btn btn-primary" style={{ width: '100%' }}>
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
