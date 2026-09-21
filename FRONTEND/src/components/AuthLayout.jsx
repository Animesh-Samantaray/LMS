import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';

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
    <div className="min-h-screen w-full flex bg-slate-50 text-gray-900 font-sans selection:bg-blue-500/30 overflow-hidden">
      
      
      <div className="hidden lg:flex w-1/2 flex-col relative overflow-hidden border-r border-gray-200" style={{ background: 'linear-gradient(160deg, #fdf8eb 0%, #f3faf8 100%)' }}>
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-14 justify-between">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#111827] rounded-md flex items-center justify-center text-white shadow-sm">
                <GraduationCap size={20} />
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">EduFlow</span>
            </Link>
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50/80 text-blue-600">
              <Sparkles size={13} />
              Next-Gen LMS
            </span>
          </div>

          <div className="space-y-6 my-auto max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-500 text-[11px] font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              10,000+ ACTIVE LEARNERS
            </div>

            <h1 className="text-4xl xl:text-[2.75rem] font-black tracking-tight text-gray-900 leading-[1.1]">
              Limitless learning at your <span className="text-blue-600">fingertips</span>
            </h1>

            <p className="text-[15px] text-gray-500 leading-relaxed max-w-md">
              Connect with experienced instructors, track real-time learning progress, and earn verified credentials on EduFlow.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-[13px] mb-0.5">Interactive Tracks</h3>
                  <p className="text-[11px] text-gray-500">Hands-on modules with tracking.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-[13px] mb-0.5">Live Cohort Sessions</h3>
                  <p className="text-[11px] text-gray-500">Engage with certified instructors.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 font-medium">
            &copy; {new Date().getFullYear()} EduFlow LMS. All rights reserved.
          </div>
        </div>
      </div>

      
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-10 overflow-y-auto relative">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
           <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vh] bg-blue-50 blur-[120px] rounded-full" />
        </div>

        <div className="w-full max-w-[480px] relative z-10 bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col items-center text-center mb-6">
            {badgeText && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-3">
                <BadgeIcon size={13} />
                <span>{badgeText}</span>
              </div>
            )}
            
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              {title}
            </h2>
            
            {subtitle && (
              <p className="text-gray-500 text-xs mt-1">
                {subtitle}
              </p>
            )}
          </div>

          <div className="w-full">
            {children}
          </div>
          
          {footerPromptText && footerActionLink && (
            <div className="mt-6 text-center pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {footerPromptText}{' '}
                <Link
                  to={footerActionLink}
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
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
