'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Briefcase, BarChart2, Shield, LogOut, ChevronRight } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { ThemeToggle } from './ThemeToggle';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard',         icon: LayoutDashboard },
  { label: 'Users',     href: '/dashboard/users',   icon: Users           },
  { label: 'Jobs',      href: '/dashboard/jobs',    icon: Briefcase, soon: true },
  { label: 'Reports',   href: '/dashboard/reports', icon: BarChart2, soon: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 z-50 flex flex-col bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-200 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-blue-600 rounded-md">
            <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
              Job<span className="text-blue-600">Me</span>
            </span>
            <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium tracking-wide">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-[10px] font-semibold text-slate-400 dark:text-zinc-600 uppercase tracking-widest px-3 mb-2">
          Menu
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon     = item.icon;
          return (
            <Link
              key={item.href}
              href={item.soon ? '#' : item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${item.soon ? 'cursor-not-allowed opacity-40' : ''}
                ${isActive
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.soon
                ? <span className="text-[9px] font-bold tracking-wider text-slate-400 dark:text-zinc-600 uppercase">Soon</span>
                : isActive && <ChevronRight className="h-3.5 w-3.5 opacity-60" />
              }
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-zinc-800 space-y-1">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-medium text-slate-600 dark:text-zinc-400">Theme</span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-slate-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}