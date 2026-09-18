import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Bell, Moon, Sun, Shield, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children, sidebarItems, roleTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [themeOpen, setThemeOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'light');
  
  useEffect(() => {
    const applyTheme = (theme) => {
      document.documentElement.classList.remove('dark', 'theme-pink');
      if (theme === 'dark') document.documentElement.classList.add('dark');
      if (theme === 'pink') document.documentElement.classList.add('theme-pink');
      setCurrentTheme(theme);
    };
    applyTheme(currentTheme);
  }, [currentTheme]);

  const toggle2FA = () => {
    alert('Firebase MFA is not enabled yet.');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';
  };

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-slate-50 dark:bg-slate-950 pink:bg-pink-100 flex text-slate-800 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900 font-sans transition-colors duration-200">
      
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-white dark:bg-slate-900 pink:bg-pink-50 border-r border-slate-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              LS
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white leading-tight">LearnSphere</span>
              <span className="text-[10px] text-coffee-400 font-medium tracking-wide">LMS Platform</span>
            </div>
          </Link>
          <button className="lg:hidden text-coffee-400 hover:text-slate-800 dark:text-slate-200 pink:text-pink-900" onClick={() => setMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-400 pink:text-pink-600 dark:text-coffee-500 mb-4 px-2 tracking-wider uppercase">
            {roleTitle} PORTAL
          </div>
          <nav className="space-y-1">
            {sidebarItems.map((item, index) => {
              if (item.category) {
                return (
                  <div key={`cat-${index}`} className="text-[11px] font-semibold text-coffee-400 dark:text-slate-500 mt-6 mb-2 px-3 tracking-wide">
                    {item.category}
                  </div>
                );
              }

              const isActive = activeItem === item.label;
              return (
                <Link
                  key={item.label}
                  to={item.path !== '#' ? item.path : '#'}
                  onClick={(e) => {
                    if (item.path === '#') e.preventDefault();
                    setActiveItem(item.label);
                    if (mobileMenuOpen) setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:shadow-blue-900/20' 
                      : 'text-coffee-600 dark:text-slate-600 dark:text-slate-400 pink:text-pink-600 hover:bg-coffee-200 dark:hover:bg-slate-800/50 hover:text-coffee-900 dark:hover:text-white'
                  }`}
                >
                  {typeof item.icon === 'string' ? (
                    <span className="text-lg w-[18px] flex items-center justify-center leading-none select-none grayscale-[20%] group-hover:grayscale-0 transition-all">
                      {item.icon}
                    </span>
                  ) : (
                    <item.icon size={18} className={isActive ? 'text-white' : 'text-coffee-400 dark:text-slate-500'} />
                  )}
                  {item.label}
                  {item.badge && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-blue-500"></div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-100 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300 lg:hidden">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <header className="h-16 bg-white dark:bg-white dark:bg-slate-900 pink:bg-pink-50 border-b border-slate-200 dark:border-slate-200 dark:border-slate-800 pink:border-pink-300 flex items-center justify-between px-4 sm:px-6 z-10 transition-colors duration-200">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-500 dark:text-coffee-400 hover:text-slate-700 dark:hover:text-slate-800 dark:text-slate-200 pink:text-pink-900 p-1"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 pink:text-pink-600 dark:text-coffee-500 uppercase tracking-widest">{roleTitle} PORTAL</div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full">{user?.role}</span>
            </div>

            <button 
              onClick={toggle2FA}
              title={is2FAEnabled ? "Disable 2FA" : "Enable 2FA"}
              className={`relative p-1.5 rounded-full transition-colors ${is2FAEnabled ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-coffee-400 hover:text-coffee-600 hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-800 pink:bg-pink-200'}`}
            >
              {is2FAEnabled ? <Shield size={18} /> : <ShieldAlert size={18} />}
            </button>

            
            <div className="relative">
              <button 
                onClick={() => setThemeOpen(!themeOpen)}
                className="p-1.5 rounded-full text-slate-600 dark:text-slate-400 pink:text-pink-600 hover:text-slate-600 dark:hover:text-slate-800 dark:text-slate-200 pink:text-pink-900 hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-800 pink:bg-pink-200 transition-colors"
              >
                {currentTheme === 'dark' ? <Moon size={18} /> : currentTheme === 'pink' ? <div className="w-[18px] h-[18px] rounded-full bg-pink-500"></div> : <Sun size={18} />}
              </button>
              
              {themeOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-100 dark:bg-slate-800 pink:bg-pink-200 rounded-xl shadow-xl border border-slate-100 dark:border-slate-300 dark:border-slate-700 pink:border-pink-400 py-2 z-50">
                  <div className="text-[10px] font-bold text-slate-600 dark:text-slate-400 pink:text-pink-600 uppercase tracking-wider px-3 mb-1">Theme</div>
                  <button onClick={() => { setCurrentTheme('light'); localStorage.setItem('theme', 'light'); setThemeOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900 hover:bg-slate-50 dark:hover:bg-slate-700">Light</button>
                  <button onClick={() => { setCurrentTheme('dark'); localStorage.setItem('theme', 'dark'); setThemeOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900 hover:bg-slate-50 dark:hover:bg-slate-700">Dark</button>
                  <button onClick={() => { setCurrentTheme('pink'); localStorage.setItem('theme', 'pink'); setThemeOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-800 dark:text-slate-200 pink:text-pink-900 hover:bg-slate-50 dark:hover:bg-slate-700">Pink</button>
                </div>
              )}
            </div>
            
            <button className="relative text-coffee-400 hover:text-slate-600 dark:hover:text-slate-700 dark:text-slate-300 pink:text-pink-800 transition-colors p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-100 dark:bg-slate-800 pink:bg-pink-200">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

            <Link 
              to={user?.role === 'Admin' ? '/admin/profile' : user?.role === 'Instructor' ? '/instructor/profile' : '/student/profile'}
              className="flex items-center gap-2 text-slate-500 dark:text-coffee-400 hover:text-slate-800 dark:hover:text-slate-800 dark:text-slate-200 pink:text-pink-900 transition-colors"
              title="View Profile"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold transition-colors"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-50 dark:bg-slate-950 pink:bg-pink-100 transition-colors duration-200">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
