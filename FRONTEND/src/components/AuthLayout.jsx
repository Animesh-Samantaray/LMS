import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Star,
  Moon,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap
} from 'lucide-react';

const AuthLayout = ({
  title,
  subtitle,
  children,
  badgeText = 'Welcome Back',
  badgeIcon: BadgeIcon = Sparkles,
  footerPromptText,
  footerActionText,
  footerActionLink,
}) => {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="h-screen w-full flex bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden">

      <div className="hidden lg:flex w-1/2 flex-col relative overflow-hidden bg-slate-900 border-r border-slate-800">

        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-15%] left-[-10%] w-[55vw] h-[55vh] bg-gradient-to-br from-indigo-600/20 via-purple-600/10 to-transparent blur-[130px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vh] bg-gradient-to-tl from-blue-600/15 via-indigo-600/10 to-transparent blur-[130px] rounded-full" />
          <div 
            className="absolute inset-0 opacity-[0.025]" 
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0)`,
              backgroundSize: '28px 28px'
            }} 
          />
        </div>
        
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14 2xl:p-20 justify-between">

          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group transition-transform hover:scale-[1.02]">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:rotate-12 transition-transform duration-300">
                <GraduationCap size={20} />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">
                Edu<span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Flow</span>
              </span>
            </Link>
            
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/50 text-xs font-medium text-slate-300">
              <Sparkles size={14} className="text-purple-400" />
              <span>Next-Gen Cloud LMS</span>
            </div>
          </div>

          <div className="space-y-6 mt-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              10,000+ Active Students & Instructors
            </div>

            <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Unlock Your Potential with{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Interactive Learning
              </span>
            </h1>

            <p className="text-base xl:text-lg text-slate-400 leading-relaxed max-w-lg">
              Connect directly with certified instructors, access 1,000+ interactive course lessons, and earn verified credentials on EduFlow LMS.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-0.5">Instant automated grading</h3>
                  <p className="text-xs text-slate-400">Get feedback on your assignments immediately.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm mb-0.5">Resume lectures anytime</h3>
                  <p className="text-xs text-slate-400">Seamless sync across all your devices.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 relative rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-slate-800/90 p-5 shadow-2xl backdrop-blur-xl overflow-hidden max-w-md">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <BookOpen size={20} />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Full-Stack Architecture</div>
                  <div className="text-xs text-slate-400">Module 4 • Lesson 8 of 12</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                84% Complete
              </span>
            </div>
            <div className="space-y-2 relative z-10">
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 w-[84%] transition-all duration-1000" />
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col relative bg-slate-950 overflow-hidden h-full">



        <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 z-10 h-full overflow-y-auto custom-scrollbar">
          
          <div className="w-full max-w-[520px] bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-800/80 p-8 sm:p-10 shadow-2xl">
            
            <div className="flex flex-col items-center text-center mb-6">
              {badgeText && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-5">
                  <BadgeIcon size={14} />
                  <span>{badgeText}</span>
                </div>
              )}
              
              <h2 className="text-2xl font-bold text-white mb-1.5 tracking-tight">
                {title}
              </h2>
              
              {subtitle && (
                <p className="text-slate-400 text-xs">
                  {subtitle}
                </p>
              )}
            </div>

            <div className="w-full">
              {children}
            </div>
            
            {footerPromptText && footerActionLink && (
              <div className="mt-6 text-center">
                <p className="text-xs text-slate-400">
                  {footerPromptText}{' '}
                  <Link
                    to={footerActionLink}
                    className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    {footerActionText}
                  </Link>
                </p>
              </div>
            )}
            
          </div>
        </div>

      </div>

    </div>
  );
};

export default AuthLayout;
