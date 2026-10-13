import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, GraduationCap, Compass, BookOpen, Layers } from 'lucide-react';

const TIPS = [
  { icon: GraduationCap, text: 'Synchronizing your personalized learning dashboard...', category: 'SYSTEM' },
  { icon: Zap, text: 'Pro Tip: Daily 20-minute focus blocks increase concept retention by 42%!', category: 'LEARNING TIP' },
  { icon: BookOpen, text: 'Fetching your enrolled courses, modules, and interactive tasks...', category: 'SYNC' },
  { icon: Compass, text: 'Spaced repetition creates 3x stronger memory pathways than cramming.', category: 'STUDY SCIENCE' },
  { icon: Layers, text: 'Preparing real-time quizzes, analytics, and coding benchmarks...', category: 'SYSTEM' },
  { icon: Sparkles, text: 'Every completed lesson moves you closer to certification & mastery.', category: 'INSPIRATION' }
];

export const LoadingScreen = ({
  fullScreen = true,
  customMessage = null,
  compact = false
}) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [progress, setProgress] = useState(25);
  const [boosted, setBoosted] = useState(false);
  const [boostCount, setBoostCount] = useState(0);

  
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 2800);

    return () => clearInterval(tipInterval);
  }, []);


  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92;
        const jump = Math.random() * 8 + 3;
        return Math.min(prev + jump, 92);
      });
    }, 400);

    return () => clearInterval(progressInterval);
  }, []);

  const handleBoost = () => {
    setBoosted(true);
    setBoostCount((prev) => prev + 1);
    setProgress((prev) => Math.min(prev + 5, 96));
    setTimeout(() => setBoosted(false), 600);
  };

  const currentTip = TIPS[tipIndex];
  const TipIcon = currentTip.icon;

  const content = (
    <div className="relative z-10 flex flex-col items-center justify-center max-w-md w-full mx-4 text-center">
     
      <div 
        onClick={handleBoost}
        title="Click to boost loading speed!"
        className="group relative cursor-pointer mb-8 transition-transform duration-300 hover:scale-105 active:scale-95 select-none"
      >
      
        <div className={`absolute -inset-6 rounded-full bg-gradient-to-tr from-blue-600/30 via-cyan-500/25 to-indigo-500/30 blur-2xl transition-all duration-500 ${
          boosted ? 'scale-125 opacity-100' : 'opacity-70 animate-pulse'
        }`} />

     
        <div className={`w-28 h-28 rounded-full border-2 border-dashed border-cyan-400/40 flex items-center justify-center transition-all ${
          boosted ? 'animate-spin' : 'animate-[spin_8s_linear_infinite]'
        }`}>
      
          <div className="w-20 h-20 rounded-full border-2 border-t-blue-500 border-r-cyan-400 border-b-transparent border-l-blue-400 animate-[spin_3s_linear_infinite_reverse] flex items-center justify-center">
           
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-cyan-500/40 shadow-lg shadow-cyan-500/25 flex items-center justify-center transition-all duration-300 ${
              boosted ? 'rotate-45 scale-110 bg-cyan-950/80' : ''
            }`}>
              <Sparkles size={24} className={`text-cyan-400 transition-transform ${boosted ? 'scale-125 text-amber-300' : 'animate-pulse'}`} />
            </div>
          </div>
        </div>

    
        <div className="absolute top-1 right-2 w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] animate-ping" />
      </div>

     
      <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 shadow-2xl shadow-black/80 relative overflow-hidden">
        
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />

       
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold uppercase tracking-wider text-cyan-300 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping mr-0.5" />
          {customMessage ? 'System Status' : currentTip.category}
        </div>

      
        <div className="min-h-[44px] flex items-center justify-center gap-2 mb-5 px-2">
          <TipIcon size={18} className="text-cyan-400 shrink-0 animate-bounce" />
          <p className="text-sm font-medium text-slate-200 leading-snug animate-fade-in transition-all">
            {customMessage || currentTip.text}
          </p>
        </div>

  
        <div className="space-y-1.5">
          <div className="w-full bg-slate-800/90 rounded-full h-2 overflow-hidden p-0.5 border border-slate-700/50">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 transition-all duration-300 relative"
              style={{ width: `${progress}%` }}
            >
          
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1">
            <span>Loading experience...</span>
            <span className="text-cyan-400 font-mono">{Math.round(progress)}%</span>
          </div>
        </div>

       
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-center">
          <button
            type="button"
            onClick={handleBoost}
            className="text-[11px] font-medium text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer py-1 px-3 rounded-lg hover:bg-slate-800/60 active:scale-95"
          >
            <Zap size={12} className="text-amber-400" />
            <span>Tap core to speed up</span>
            {boostCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold">
                +{boostCount * 5}%
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (!fullScreen) {
    return (
      <div className="w-full py-16 flex items-center justify-center relative overflow-hidden">
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070b14] overflow-hidden select-none">
    
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-blue-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))] pointer-events-none" />

      {content}
    </div>
  );
};

export default LoadingScreen;
