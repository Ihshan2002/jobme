'use client';

// components/layout/SplashScreen.tsx

import { useEffect, useState } from 'react';
import { Shield, Cpu, Terminal } from 'lucide-react';

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [status, setStatus] = useState('Initializing');

  useEffect(() => {
    // Diagnostic sequence simulation
    const statuses = ['Initializing Core', 'Syncing Registry', 'Encrypted Link Established', 'Ready'];
    let i = 0;
    const interval = setInterval(() => {
      if (i < statuses.length) {
        setStatus(statuses[i]);
        i++;
      }
    }, 500);

    const fadeTimer = setTimeout(() => setFadeOut(true), 2400);  
    const removeTimer = setTimeout(() => setVisible(false), 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`
        fixed inset-0 z-[9999] flex flex-col items-center justify-center
        bg-[#fcfcfd] dark:bg-zinc-950
        transition-opacity duration-700 ease-in-out
        ${fadeOut ? 'opacity-0' : 'opacity-100'}
      `}
    >
      {/* Scanning Background Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-40">
        <div className="w-full h-[2px] bg-blue-500/50 absolute top-0 animate-[scan_2s_linear_infinite]" />
      </div>

      <div className="flex flex-col items-center gap-8 relative">

        {/* System Core Icon */}
        <div className="relative group">
          <div className="absolute inset-0 bg-blue-600 rounded shadow-[0_0_50px_rgba(37,99,235,0.3)] animate-pulse" />
          <div className="relative p-5 bg-slate-900 dark:bg-blue-600 rounded border border-white/20 shadow-2xl">
            <Shield className="h-12 w-12 text-white" strokeWidth={2} />
          </div>
          
        
        </div>

        {/* Branding Cluster */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-2 py-0.5 border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-sm mb-2 shadow-sm">
            <Cpu size={10} className="text-blue-500" />
            <span className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">System Boot v3.0</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            Job<span className="text-blue-600">Me</span>
          </h1>
          <p className="text-[11px] text-slate-400 dark:text-zinc-500 tracking-[0.4em] uppercase font-bold">
            Unified Registry
          </p>
        </div>

        {/* Industrial Progress Loader */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-64 h-[3px] bg-slate-200 dark:bg-zinc-900 rounded-full overflow-hidden border border-slate-100 dark:border-zinc-800">
            <div className="h-full bg-blue-600 rounded-full animate-loading-bar shadow-[0_0_10px_rgba(37,99,235,0.8)]" />
          </div>
          <div className="flex items-center gap-2">
            <Terminal size={12} className="text-blue-600" />
            <span className="text-[9px] font-mono font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest animate-pulse">
               {status}...
            </span>
          </div>
        </div>

        {/* Engineer Signature */}
        <div className="absolute bottom-[-100px] flex flex-col items-center gap-1 opacity-40">
           <div className="h-8 w-[1px] bg-slate-300 dark:bg-zinc-800" />
           <p className="text-[9px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest">
            Architecture by <span className="text-slate-900 dark:text-zinc-300">SHAN_OS</span>
           </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}