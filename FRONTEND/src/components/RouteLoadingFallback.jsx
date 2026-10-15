import React from 'react';
import { Loader2 } from 'lucide-react';

const RouteLoadingFallback = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading page content"
      className="min-h-[50vh] w-full flex flex-col items-center justify-center p-8 text-center animate-fade-in"
    >
      <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm mb-3">
        <Loader2 size={20} className="animate-spin" />
      </div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
        Loading...
      </p>
    </div>
  );
};

export default RouteLoadingFallback;
