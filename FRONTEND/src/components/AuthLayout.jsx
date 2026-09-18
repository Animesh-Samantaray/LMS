import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const AuthLayout = ({
  title,
  subtitle,
  children,
  badgeText = 'Welcome',
  badgeIcon: BadgeIcon = Sparkles,
  footerPromptText,
  footerActionText,
  footerActionLink,
}) => {
  return (
    <div className="min-h-screen w-full flex bg-[#070b14] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden">
      
     
      <div className="hidden lg:flex w-1/2 flex-col relative overflow-hidden bg-[#0b101d] border-r border-slate-800/80">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vh] bg-indigo-600/20 blur-[130px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vh] bg-purple-600/20 blur-[130px] rounded-full" />
        </div>
        
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14 justify-between">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                <GraduationCap size={22} />
              </div>
              <span className="font-bold text-2xl tracking-tight text-white">
                Learn<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Sphere</span>
              </span>
            </Link>
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
              <Sparkles size={13} />
              Next-Gen LMS
            </span>
          </div>

          <div className="space-y-6 my-auto max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              10,000+ Active Learners & Mentors
            </div>

            <h1 className="text-3xl xl:text-4xl 2xl:text-5xl font-black tracking-tight text-white leading-tight">
              Empower Your Future with{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                World-Class Mentorship
              </span>
            </h1>

            <p className="text-sm xl:text-base text-slate-300 leading-relaxed">
              Connect with experienced instructors, track real-time learning progress, and earn verified credentials on LearnSphere.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs mb-0.5">Interactive Tracks</h3>
                  <p className="text-[11px] text-slate-400">Hands-on modules with immediate progress tracking.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs mb-0.5">Live Cohort Sessions</h3>
                  <p className="text-[11px] text-slate-400">Engage directly with certified instructors.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} LearnSphere LMS. All rights reserved.
          </div>
        </div>
      </div>

    
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-10 overflow-y-auto relative">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vh] bg-indigo-600/10 blur-[120px] rounded-full" />
        </div>

        <div className="w-full max-w-[480px] relative z-10 bg-[#0d1424]/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <div className="flex flex-col items-center text-center mb-6">
            {badgeText && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
                <BadgeIcon size={13} />
                <span>{badgeText}</span>
              </div>
            )}
            
            <h2 className="text-2xl font-black text-white tracking-tight">
              {title}
            </h2>
            
            {subtitle && (
              <p className="text-slate-400 text-xs mt-1">
                {subtitle}
              </p>
            )}
          </div>

          <div className="w-full">
            {children}
          </div>
          
          {footerPromptText && footerActionLink && (
            <div className="mt-6 text-center pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-400">
                {footerPromptText}{' '}
                <Link
                  to={footerActionLink}
                  className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
                >
                  {footerActionText}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
