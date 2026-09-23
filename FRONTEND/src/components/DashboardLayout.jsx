import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Bell, Moon, Sun, Sparkles, Check, ChevronDown, Home, Users, BookOpen, FolderOpen, Settings, User as UserIcon, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import TwoFactorToggle from './TwoFactorToggle';

const DashboardLayout = ({ children, sidebarItems, roleTitle, pageTitle = "Dashboard" }) => {
  const { user, setUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItemLabel, setActiveItemLabel] = useState("");
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const toggleCollapse = () => { 
    setIsCollapsed(!isCollapsed); 
    localStorage.setItem('sidebarCollapsed', !isCollapsed); 
  };
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
    { id: 'cream', label: 'Cream Theme', icon: Sparkles, desc: 'Warm pastel glass' },
  ];

  const effectiveRoleTitle =
    roleTitle ||
    (user?.role === 'Admin' ? 'ADMIN' : user?.role === 'Instructor' ? 'MENTOR' : 'STUDENT');

  const defaultSidebarItems =
    user?.role === 'Admin'
      ? [
          { label: 'Overview', path: '/admin/dashboard', icon: Home },
          { category: 'Administration' },
          { label: 'Manage Users', path: '/admin/users', icon: Users },
          { category: 'Management' },
          { label: 'Categories', path: '/admin/categories', icon: FolderOpen },
          { label: 'Courses', path: '/admin/courses', icon: BookOpen },
          { label: 'Certificates', path: '#', icon: Sparkles },
          { category: 'Account' },
          { label: 'Settings', path: '/admin/profile', icon: Settings }
        ]
      : user?.role === 'Instructor'
      ? [
          { label: 'Overview', path: '/instructor/dashboard', icon: Home },
          { category: 'Learning' },
          { label: 'All Courses', path: '/courses', icon: BookOpen },
          { label: 'My Courses', path: '/instructor/courses', icon: BookOpen },
          { category: 'Manager' },
          { label: 'View Students', path: '#', icon: Users },
          { label: 'Course Progress', path: '#', icon: BarChart2 },
          { label: 'Certificates', path: '#', icon: Sparkles },
          { category: 'Account' },
          { label: 'Settings', path: '/instructor/profile', icon: UserIcon }
        ]
      : [
          { label: 'Overview', path: '/student/dashboard', icon: Home },
          { category: 'Learning' },
          { label: 'All Courses', path: '/courses', icon: BookOpen },
          { label: 'My Courses', path: '/student/courses/my', icon: BookOpen },
          { label: 'Mock Test', path: '#', icon: '📄' },
          { label: 'Practice Arena', path: '#', icon: '🎯' },
          { label: 'Exams', path: '#', icon: '📝' },
          { label: 'Weekly Contests', path: '#', icon: '🏆' },
          { label: 'Certificates', path: '#', icon: '🎖️' },
          { category: 'Engagement' },
          { label: 'My Groups', path: '#', icon: '👥' },
          { label: 'My Reviews', path: '#', icon: '⭐' },
          { label: 'Messages', path: '#', icon: '💬' },
          { label: 'Calendar', path: '#', icon: '📅' },
          { category: 'Account' },
          { label: 'Settings', path: '/student/profile', icon: Settings }
        ];

  const effectiveSidebarItems = sidebarItems && sidebarItems.length > 0 ? sidebarItems : defaultSidebarItems;

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
        className={`fixed inset-y-0 left-0 z-50 lms-glass-sidebar transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${
          mobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed && !mobileMenuOpen ? 'w-20' : 'w-64'}`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-[var(--lms-border)] overflow-hidden">
          <div 
            onClick={() => {
               if (window.innerWidth >= 1024) toggleCollapse();
               else navigate('/');
            }}
            className={`flex items-center gap-3 group cursor-pointer w-full ${isCollapsed && !mobileMenuOpen ? 'justify-center' : ''}`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
              <img src="/shnoor-logo.png" alt="SHNOOR" className="h-[32px] object-contain shrink-0" />
              {(!isCollapsed || mobileMenuOpen) && (
                <div className="flex flex-col min-w-0 overflow-hidden transition-all duration-300 opacity-100 justify-center">
                  <span className="text-xl font-extrabold text-[var(--lms-text-primary)] tracking-tight ml-1">LMS</span>
                </div>
              )}
          </div>
          <button
            className="lg:hidden text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] p-1 rounded-lg shrink-0"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 py-5 px-3 space-y-1 overflow-visible relative">
          <div className={`text-[10px] font-bold text-[var(--lms-text-muted)] px-3 tracking-widest uppercase transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed && !mobileMenuOpen ? 'opacity-0 h-0 my-0' : 'opacity-100 mb-3'}`}>
            {effectiveRoleTitle} PORTAL
          </div>

          <nav className="space-y-1">
            {effectiveSidebarItems.map((item, index) => {
              if (item.category) {
                return (
                  <div
                    key={`cat-${index}`}
                    className={`text-[10px] font-bold text-[var(--lms-text-muted)] px-3 tracking-wider uppercase transition-all duration-300 whitespace-nowrap overflow-hidden ${isCollapsed && !mobileMenuOpen ? 'opacity-0 h-0 my-0 py-0' : 'opacity-100 mt-5 mb-2'}`}
                  >
                    {item.category}
                  </div>
                );
              }

              const isPathActive = item.path && item.path !== '#' && location.pathname === item.path;
              const isActive = activeItemLabel ? activeItemLabel === item.label : isPathActive;
              const isOnlyIcon = isCollapsed && !mobileMenuOpen;

              return (
                <Link
                  key={item.label}
                  to={item.path !== '#' ? item.path : '#'}
                  onClick={(e) => {
                    setActiveItemLabel(item.label);
                    if (item.path === '#') e.preventDefault();
                    if (mobileMenuOpen) setMobileMenuOpen(false);
                  }}
                  className={`group relative flex items-center ${isOnlyIcon ? 'justify-center px-0' : 'px-3 gap-3'} py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--lms-accent)] text-white shadow-md shadow-indigo-500/25'
                      : 'text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] hover:bg-[var(--lms-surface-subtle)]'
                  }`}
                >
                  <div className="flex items-center justify-center shrink-0 w-5">
                    {typeof item.icon === 'string' ? (
                      <span className="text-base flex items-center justify-center select-none">
                        {item.icon}
                      </span>
                    ) : (
                      <item.icon
                        size={17}
                        className={isActive ? 'text-white' : 'text-[var(--lms-text-muted)] group-hover:text-[var(--lms-accent)] transition-colors'}
                      />
                    )}
                  </div>
                  
                  {!isOnlyIcon && (
                    <span className="whitespace-nowrap truncate flex-1">{item.label}</span>
                  )}
                  
                  {!isOnlyIcon && item.badge && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse shrink-0"></span>
                  )}

                  {isOnlyIcon && (
                    <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#1e293b] dark:bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-[999] shadow-2xl translate-x-[-10px] group-hover:translate-x-0 before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-1 before:border-[5px] before:border-transparent before:border-r-slate-700">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-[var(--lms-border)] relative">
          <Link
            to={profilePath}
            className={`group flex items-center ${isCollapsed && !mobileMenuOpen ? 'justify-center p-1' : 'gap-3 p-2'} rounded-xl hover:bg-[var(--lms-surface-subtle)] transition-colors relative`}
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
            
            {(!isCollapsed || mobileMenuOpen) && (
              <div className="min-w-0 flex-1 whitespace-nowrap overflow-hidden">
                <p className="text-xs font-semibold text-[var(--lms-text-primary)] truncate">
                  {user?.name || 'My Account'}
                </p>
                <p className="text-[10px] text-[var(--lms-text-muted)] truncate capitalize">
                  {user?.role || 'User'}
                </p>
              </div>
            )}
            
            {isCollapsed && !mobileMenuOpen && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#1e293b] dark:bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-[999] shadow-2xl translate-x-[-10px] group-hover:translate-x-0 before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-1 before:border-[5px] before:border-transparent before:border-r-slate-700">
                {user?.name || 'My Account'}
              </div>
            )}
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
                {effectiveRoleTitle} PORTAL
              </div>
              <h1 className="text-lg font-bold text-[var(--lms-text-primary)] leading-tight">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <TwoFactorToggle user={user} setUser={setUser} />

            <span className="lms-badge hidden md:inline-flex">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--lms-accent)]"></span>
              {user?.role || 'Learner'}
            </span>

            <div className="relative" ref={themeDropdownRef}>
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-all shadow-sm text-xs font-semibold"
                aria-label="Select theme"
              >
                {theme === 'dark' ? (
                  <Moon size={15} className="text-indigo-400" />
                ) : theme === 'cream' ? (
                  <Sparkles size={15} className="text-amber-500" />
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

            <button
              className="relative p-2 rounded-xl border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-all shadow-sm"
              title="Notifications"
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            </button>

            <div className="h-6 w-px bg-[var(--lms-border)] mx-0.5"></div>

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

        <main className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-5 lg:p-8">
          <div className="w-full max-w-[1600px] mx-auto space-y-4 sm:space-y-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
