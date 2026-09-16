import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  BookOpen, 
  Users, 
  ShieldCheck, 
  Zap,
  Play
} from 'lucide-react';

const AuthLayout = ({
  title,
  subtitle,
  children,
  badgeText = 'EduFlow LMS Portal',
  badgeIcon: BadgeIcon = Sparkles,
  footerPromptText,
  footerActionText,
  footerActionLink,
}) => {
  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden flex flex-col justify-between selection:bg-indigo-500/30 selection:text-indigo-200">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
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

      <header className="relative z-20 flex-shrink-0 px-6 py-3 sm:px-10 sm:py-4 flex items-center justify-between border-b border-slate-900/60 bg-slate-950/40 backdrop-blur-md">
        <Link
          to="/"
          className="group flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:rotate-12 transition-transform duration-300">
            <GraduationCap size={18} />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight text-white">
            Edu<span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Flow</span>
          </span>
        </Link>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            LMS Live Sync
          </span>
          <Link
            to="/"
            className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 min-h-0 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center">
        <div className="w-full h-full max-h-[88vh] grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 h-full flex-col justify-between py-2 pr-2">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/15 via-purple-500/15 to-transparent border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles size={13} className="text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Next-Gen Cloud LMS</span>
              </div>

              <h1 className="font-heading text-3xl xl:text-4xl 2xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Unlock Your Potential with{' '}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                  Interactive Learning
                </span>
              </h1>

              <p className="text-sm xl:text-base text-slate-400 leading-relaxed max-w-lg">
                Connect directly with certified instructors, access 1,000+ interactive course lessons, and earn verified credentials on EduFlow LMS.
              </p>
            </div>

            <div className="relative my-auto py-2">
              <div className="relative rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-slate-800/90 p-5 shadow-2xl backdrop-blur-xl overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Full-Stack Cloud Architecture</div>
                      <div className="text-xs text-slate-400">Module 4 • Lesson 8 of 12</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                    84% Complete
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-slate-400 font-medium">
                    <span>Course Progress</span>
                    <span className="text-indigo-300">18 / 22 Tasks</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 w-[84%] transition-all duration-1000" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-400 flex items-center justify-center">
                      <Zap size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">12h</div>
                      <div className="text-[10px] text-slate-400">Watch Time</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="w-7 h-7 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
                      <Award size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">98%</div>
                      <div className="text-[10px] text-slate-400">Quiz Score</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck size={14} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Verified</div>
                      <div className="text-[10px] text-slate-400">Certificate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                <span>Instant automated grading</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                <span>Resume lectures on any device</span>
              </div>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-6 xl:col-span-5 h-full flex flex-col justify-center">
            <div className="relative rounded-2xl sm:rounded-3xl bg-slate-900/85 border border-slate-800/90 shadow-2xl shadow-indigo-950/50 backdrop-blur-2xl p-5 sm:p-7 xl:p-8 flex flex-col justify-between max-h-[84vh] overflow-y-auto">
              
              <div className="text-left mb-3 sm:mb-4">
                {badgeText && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-semibold tracking-wide uppercase mb-1.5">
                    <BadgeIcon size={12} className="text-indigo-400" />
                    <span>{badgeText}</span>
                  </div>
                )}
                <h2 className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  {title}
                </h2>
                {subtitle && (
                  <p className="mt-0.5 text-xs sm:text-sm text-slate-400 font-normal">
                    {subtitle}
                  </p>
                )}
              </div>

              <div className="flex-1 min-h-0">
                {children}
              </div>

              {footerPromptText && footerActionLink && (
                <div className="mt-3 sm:mt-4 pt-3 border-t border-slate-800/80 text-center flex-shrink-0">
                  <p className="text-xs text-slate-400">
                    {footerPromptText}{' '}
                    <Link
                      to={footerActionLink}
                      className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline underline-offset-2 transition-colors ml-1"
                    >
                      {footerActionText}
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <footer className="relative z-20 flex-shrink-0 px-6 py-2.5 sm:px-10 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-900/60 bg-slate-950/40">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <ShieldCheck size={13} className="text-emerald-400" /> End-to-End SSL Encrypted
          </span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span className="hidden sm:inline">10,000+ Active Students & Instructors</span>
        </div>
        <div>
          © {new Date().getFullYear()} EduFlow LMS
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
