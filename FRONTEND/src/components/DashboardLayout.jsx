import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Bell, Moon, Sun, Sparkles, Check, ChevronDown, Home, Users, BookOpen, FolderOpen, Settings, User as UserIcon, BarChart2, Shield, User, Target, FileText, Award, MessageSquare, Calendar } from 'lucide-react';
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
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => localStorage.getItem('sidebarCollapsed') === 'true');
  const toggleCollapse = () => { 
    setIsCollapsed(!isCollapsed); 
    localStorage.setItem('sidebarCollapsed', !isCollapsed); 
  };
  const themeDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target)) {
        setThemeDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
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
          { label: 'Mock Test', path: '#', icon: Target },
          { label: 'Practice Arena', path: '#', icon: FileText },
          { label: 'Exams', path: '#', icon: FileText },
          { label: 'Weekly Contests', path: '#', icon: Award },
          { label: 'Certificates', path: '#', icon: Award },
          { category: 'Engagement' },
          { label: 'My Groups', path: '#', icon: Users },
          { label: 'My Reviews', path: '#', icon: FileText },
          { label: 'Messages', path: '#', icon: MessageSquare },
          { label: 'Calendar', path: '#', icon: Calendar },
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
          className="fixed inset-0 z-40 lg:hidden animate-fade-in"
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
            <div className="relative" ref={themeDropdownRef}>
              <button
                onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-all shadow-sm"
                aria-label="Select theme"
              >
                {theme === 'dark' ? (
                  <Moon size={16} className="text-indigo-400" />
                ) : theme === 'cream' ? (
                  <Sparkles size={16} className="text-amber-500" />
                ) : (
                  <Sun size={16} className="text-amber-500" />
                )}
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] p-1.5 shadow-xl -2xl z-50 animate-scale-in">
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
              className="relative flex items-center justify-center w-9 h-9 rounded-full border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-all shadow-sm"
              title="Notifications"
            >
              <Bell size={16} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse border-2 border-[var(--lms-bg)]"></span>
            </button>

            <div className="h-6 w-px bg-[var(--lms-border)] mx-1"></div>

            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 p-1 pr-2 rounded-full border border-[var(--lms-border)] bg-[var(--lms-surface)] hover:bg-[var(--lms-surface-hover)] transition-all shadow-sm group"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--lms-accent-subtle)] border border-[var(--lms-accent-border)] text-[var(--lms-accent-text)] flex items-center justify-center text-xs font-bold overflow-hidden group-hover:ring-2 group-hover:ring-[var(--lms-accent)] transition-all">
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
                <ChevronDown size={14} className="text-[var(--lms-text-secondary)] group-hover:text-[var(--lms-text-primary)] transition-colors" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[var(--lms-border)] bg-[var(--lms-surface-elevated)] p-2 shadow-xl -2xl z-50 animate-scale-in flex flex-col gap-1">
                  <div className="px-3 py-2 border-b border-[var(--lms-border)] mb-1">
                    <p className="font-bold text-sm text-[var(--lms-text-primary)] truncate">{user?.name || 'My Account'}</p>
                    <p className="text-xs text-[var(--lms-text-muted)] truncate">{user?.email || ''}</p>
                    <div className="mt-2 inline-block">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[var(--lms-accent-subtle)] text-[var(--lms-accent-text)] border border-[var(--lms-accent-border)] uppercase tracking-wider">
                        {user?.role || 'Learner'}
                      </span>
                    </div>
                  </div>
                  
                  <Link 
                    to={profilePath} 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-[var(--lms-surface-subtle)] text-sm font-semibold text-[var(--lms-text-secondary)] hover:text-[var(--lms-text-primary)] transition-colors"
                  >
                    <User size={16} />
                    My Profile & Settings
                  </Link>

                  <div className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--lms-surface-subtle)] transition-colors">
                    <div className="flex items-center gap-2.5 text-sm font-semibold text-[var(--lms-text-secondary)]">
                      <Shield size={16} />
                      2FA Security
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <TwoFactorToggle user={user} setUser={setUser} compact={true} />
                    </div>
                  </div>

                  <div className="border-t border-[var(--lms-border)] mt-1 pt-1">
                    <button 
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }} 
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-rose-500/10 text-sm font-semibold text-rose-500 transition-colors"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
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
