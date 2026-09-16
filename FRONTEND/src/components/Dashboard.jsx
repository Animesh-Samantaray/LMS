import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  GraduationCap, 
  LogOut, 
  BookOpen, 
  Award, 
  BarChart3, 
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  const role = user?.role || 'Student';
  const isInstructor = role === 'Instructor';
  const isAdmin = role === 'Admin';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <GraduationCap size={18} />
              </div>
              <span className="font-heading font-bold text-lg text-white">
                Edu<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Flow</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {role} Portal
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-semibold text-slate-200 truncate max-w-[120px]">{user?.name || 'User'}</div>
                <div className="text-[10px] text-slate-400 capitalize">{role}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 hover:text-red-200 text-xs font-semibold transition-all"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800/80 p-6 sm:p-8 md:p-10 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <CheckCircle2 size={13} className="text-emerald-400" /> Authenticated Session
            </div>

            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome, {user?.name || 'Learner'}!
            </h1>

            <p className="mt-2 text-sm sm:text-base text-slate-300">
              {isInstructor
                ? 'Manage your published courses, track student enrollment progress, and review assignment submissions.'
                : isAdmin
                ? 'Manage platform users, inspect system analytics, and administer learning modules.'
                : 'Continue your learning journey, pick up your recent lectures, and track your quiz progress.'}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
              >
                <BookOpen size={16} /> Explore Course Catalog
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-all"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-white mb-4">
            {role} Quick Navigation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BookOpen size={20} />
              </div>
              <h3 className="font-semibold text-white text-sm sm:text-base">
                {isInstructor ? 'Course Creator' : 'Enrolled Courses'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isInstructor ? 'Create & publish new video modules' : 'Access your active syllabus and materials'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/30 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 size={20} />
              </div>
              <h3 className="font-semibold text-white text-sm sm:text-base">Performance Analytics</h3>
              <p className="text-xs text-slate-400 mt-1">
                {isInstructor ? 'Class engagement heatmaps and drop-offs' : 'Track video completion and quiz grades'}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/30 transition-all group sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Award size={20} />
              </div>
              <h3 className="font-semibold text-white text-sm sm:text-base">Verified Certificates</h3>
              <p className="text-xs text-slate-400 mt-1">
                {isInstructor ? 'Issue tamper-proof certificates' : 'Download and share completed credentials'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;