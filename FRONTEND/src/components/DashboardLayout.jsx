import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Menu, X, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children, sidebarItems, roleTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(() => {
    const current = sidebarItems.find(item => item.path === location.pathname);
    return current ? current.label : sidebarItems[0]?.label;
  });

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
    <div className="h-screen overflow-hidden bg-slate-50 flex text-slate-800 font-sans">
      
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              LS
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 leading-tight">LearnSphere</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">LMS Platform</span>
            </div>
          </Link>
          <button className="lg:hidden text-slate-400 hover:text-slate-600" onClick={() => setMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="text-xs font-bold text-slate-400 mb-4 px-2 tracking-wider uppercase">
            {roleTitle} MENU
          </div>
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
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
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-100 lg:hidden">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-500 hover:text-slate-700 p-1"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden sm:block">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{roleTitle} PORTAL</div>
              <h1 className="text-xl font-bold text-slate-900 leading-none">Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{user?.role}</span>
            </div>
            
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-full hover:bg-slate-100">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <div className="h-8 w-px bg-slate-200 mx-1"></div>

            <button 
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600 border border-slate-300">
                {getInitials(user?.name)}
              </div>
            </button>
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
