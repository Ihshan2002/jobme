'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  BarChart2, 
  Shield, 
  LogOut, 
  ChevronRight,
  Activity
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { ThemeToggle } from './ThemeToggle';
import { useMemo } from 'react';

const NAV_ITEMS = [
  { label: 'Overview',   href: '/dashboard',         icon: LayoutDashboard },
  { label: 'User Index', href: '/dashboard/users',    icon: Users           },
  { label: 'Job Registry', href: '/dashboard/jobs',     icon: Briefcase       },
  { label: 'Analytics',  href: '/dashboard/reports',  icon: BarChart2, soon: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 z-50 flex flex-col bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800">

      {/* Corporate Branding */}
      <div className="px-6 py-6 border-b border-slate-200 dark:border-zinc-800 bg-[#fcfcfd] dark:bg-zinc-900/20">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-slate-900 dark:bg-blue-600 rounded shadow-sm">
            <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-black text-slate-900 dark:text-white text-[13px] tracking-tighter uppercase">
              Job<span className="text-blue-600">Me</span> <span className="text-slate-400 font-medium">Core</span>
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] text-slate-500 dark:text-zinc-500 font-bold tracking-[0.1em] uppercase">
                System Active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Registry */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-[0.2em] px-4 mb-4">
          Management
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon     = item.icon;
          return (
            <Link
              key={item.href}
              href={item.soon ? '#' : item.href}
              className={`
                group flex items-center gap-3 px-4 py-2.5 rounded transition-all
                ${item.soon ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
                ${isActive
                  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-lg shadow-blue-500/10'
                  : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`} />
              <span className="flex-1 text-[12px] font-bold tracking-tight uppercase">{item.label}</span>
              {item.soon ? (
                <span className="text-[8px] font-black tracking-widest text-slate-400 dark:text-zinc-700 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded uppercase">Soon</span>
              ) : (
                <ChevronRight className={`h-3 w-3 transition-transform ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover:opacity-40 group-hover:translate-x-0'}`} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Footer */}
      <div className="p-4 bg-[#fcfcfd] dark:bg-zinc-900/20 border-t border-slate-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between px-2 mb-2">
          <div className="flex items-center gap-2">
             <Activity size={12} className="text-slate-400" />
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Dark Mode</span>
          </div>
          <ThemeToggle />
        </div>
        
        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 px-4 py-2.5 rounded text-slate-500 dark:text-zinc-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-all w-full text-left"
        >
          <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-widest">Terminate Session</span>
        </button>
      </div>
    </aside>
  );
}