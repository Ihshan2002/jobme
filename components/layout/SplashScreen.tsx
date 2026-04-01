'use client';

// components/layout/SplashScreen.tsx

import { useEffect, useState } from 'react';
import { Shield } from 'lucide-react';

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

 useEffect(() => {
  const fadeTimer = setTimeout(() => setFadeOut(true), 2200);  
  const removeTimer = setTimeout(() => setVisible(false), 2800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex flex-col items-center justify-center
        bg-white dark:bg-zinc-950
        transition-opacity duration-500
        ${fadeOut ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {/* Logo */}
      <div className="flex flex-col items-center gap-4">

        {/* Icon with pulse */}
        <div className="relative">
          <div className="absolute inset-0 bg-blue-600 rounded-2xl animate-ping opacity-20" />
          <div className="relative p-4 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
            <Shield className="h-10 w-10 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Brand */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Job<span className="text-blue-600">Me</span>
          </h1>
          <p className="text-sm text-slate-400 dark:text-zinc-500 mt-1 tracking-widest uppercase font-medium">
            Find Your Dream Job
          </p>
        </div>

        {/* Loading bar */}
        <div className="w-48 h-1 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-blue-600 rounded-full animate-loading-bar" />
        </div>

        {/* Powered by */}
        <p className="text-xs text-slate-300 dark:text-zinc-600 mt-6 font-medium">
          Designed & Developed by{' '}
          <span className="text-blue-500 font-semibold">Shan</span>
        </p>
      </div>
    </div>
  );
}