import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Bell, Moon, Sun, Sparkles, Check, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const DashboardLayout = ({ children, sidebarItems = [], roleTitle }) => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const themeDropdownRef = useRef(null);

  
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const getInitials = (name) => {
    return name
      ? name
          .split(' ')
          .filter(Boolean)
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : 'U';
  };

  const themeOptions = [
    { id: 'dark', label: 'Dark Theme', icon: Moon, desc: 'Deep glassmorphism' },
    { id: 'light', label: 'Light Theme', icon: Sun, desc: 'Crisp soft glass' },
    { id: 'pink', label: 'Pink Theme', icon: Sparkles, desc: 'Rose blush glass' },
  ];

  const profilePath =
    user?.role === 'Admin'
      ? '/admin/profile'
      : user?.role === 'Instructor'
      ? '/instructor/profile'
      : '/student/profile';

  return (
    <div className="h-screen overflow-hidden flex bg-lms-bg text-lms-text font-sans selection:bg-indigo-500/30">
     
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 lms-glass-sidebar transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
       
        <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--lms-border)]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              LS
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm leading-tight text-[var(--lms-text-primary)]">
                LearnSphere
              </span>
              <span className="text-[10px] text-[var(--lms-text-muted)] font-medium tracking-wide">
                LMS Platform
              </span>
            </div>
          </Link>
          <button
            className="lg:hidden text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] p-1 rounded-lg"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

      
        <div className="flex-1 overflow-y-auto py-5 px-3.5 space-y-1">
          <div className="text-[10px] font-bold text-[var(--lms-text-muted)] mb-3 px-3 tracking-widest uppercase">
            {roleTitle} PORTAL
          </div>

          <nav className="space-y-1">
            {sidebarItems.map((item, index) => {
              if (item.category) {
                return (
                  <div
                    key={`cat-${index}`}
                    className="text-[10px] font-bold text-[var(--lms-text-muted)] mt-5 mb-2 px-3 tracking-wider uppercase"
                  >
                    {item.category}
                  </div>
                );
              }

              const isActive =
                item.path && item.path !== '#'
                  ? location.pathname === item.path
                  : false;

              return (
                <Link
                  key={item.label}
                  to={item.path !== '#' ? item.path : '#'}
                  onClick={(e) => {
                    if (item.path === '#') e.preventDefault();
                    if (mobileMenuOpen) setMobileMenuOpen(false);
                  }}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--lms-accent)] text-white shadow-md shadow-indigo-500/25'
                      : 'text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-subtle)]'
                  }`}
                >
                  {typeof item.icon === 'string' ? (
                    <span className="text-base w-4 flex items-center justify-center select-none">
                      {item.icon}
                    </span>
                  ) : (
                    <item.icon
                      size={17}
                      className={isActive ? 'text-white' : 'text-[var(--lms-text-muted)] group-hover:text-[var(--lms-accent)] transition-colors'}
                    />
                  )}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Mini Profile in Sidebar */}
        <div className="p-3 border-t border-[var(--lms-border)]">
          <Link
            to={profilePath}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--lms-surface-subtle)] transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(user?.name)
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--lms-text-primary)] truncate">
                {user?.name || 'My Account'}
              </p>
              <p className="text-[10px] text-[var(--lms-text-muted)] truncate capitalize">
                {user?.role || 'User'}
              </p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main App Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 lms-glass-header flex items-center justify-between px-4 sm:px-6 z-20">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] p-2 rounded-xl hover:bg-[var(--lms-surface-subtle)] transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <div className="text-[10px] font-bold text-[var(--lms-accent)] uppercase tracking-widest leading-none mb-1">
                {roleTitle} PORTAL
              </div>
              <h1 className="text-lg font-bold text-[var(--lms-text-primary)] leading-tight">
                Dashboard
              </h1>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Role Badge */}
            <span className="lms-badge hidden md:inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--lms-accent)]"></span>
              {user?.role || 'Learner'}
            </span>

            {/* Theme Selector Dropdown */}
            <div className="relative" ref={themeDropdownRef}>
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-all shadow-sm text-xs font-semibold"
                aria-label="Select theme"
              >
                {theme === 'dark' ? (
                  <Moon size={15} className="text-indigo-400" />
                ) : theme === 'pink' ? (
                  <Sparkles size={15} className="text-pink-500" />
                ) : (
                  <Sun size={15} className="text-amber-500" />
                )}
                <span className="capitalize hidden sm:inline">{theme}</span>
                <ChevronDown size={13} className="opacity-60" />
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] p-1.5 shadow-xl backdrop-blur-2xl z-50 animate-scale-in">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--lms-text-muted)]">
                    Theme Mode
                  </div>
                  {themeOptions.map((opt) => {
                    const isSelected = theme === opt.id;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setTheme(opt.id);
                          setThemeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] font-semibold'
                            : 'text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-subtle)]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon size={15} />
                          <div className="text-left">
                            <p className="leading-tight">{opt.label}</p>
                            <p className="text-[9px] opacity-70">{opt.desc}</p>
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Notifications */}
            <button
              className="relative p-2 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-all shadow-sm"
              title="Notifications"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-[var(--lms-border)] mx-0.5"></div>

            {/* Profile Link */}
            <Link
              to={profilePath}
              className="flex items-center gap-2 group p-1 rounded-xl hover:bg-[var(--lms-surface-subtle)] transition-colors"
              title="View Profile"
            >
              <div className="w-8 h-8 rounded-xl bg-[var(--lms-accent-subtle)] border border-[var(--lms-accent-border)] text-[var(--lms-accent-text)] flex items-center justify-center text-xs font-bold shadow-sm overflow-hidden group-hover:ring-2 group-hover:ring-[var(--lms-accent)] transition-all">
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold transition-all"
              title="Log out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
