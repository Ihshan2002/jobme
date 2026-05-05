'use client';

import { useMemo, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  BookmarkCheck,
  FileText,
  Search,
  Shield,
  LogOut,
  User,
  ChevronRight,
  Target,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { NotificationBell } from '@/components/ui/NotificationBell';

import { ProfileStrengthMeter } from '@/features/profile/ProfileStrengthMeter';

interface Profile {
  full_name: string | null;
  email: string;
  role: string;
  bio?: string | null;
  skills?: string[] | null;
  experience?: string | null;
  education?: string | null;
  resume_url?: string | null;
}

interface Stats {
  applied: number;
  saved: number;
}

export default function SeekerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats]     = useState<Stats>({ applied: 0, saved: 0 });
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setUserId(user.id);

      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (prof?.role !== 'seeker') { router.push('/auth/login'); return; }
      setProfile(prof);

      const [{ count: applied }, { count: saved }] = await Promise.all([
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('seeker_id', user.id),
        supabase.from('saved_jobs').select('*', { count: 'exact', head: true }).eq('seeker_id', user.id),
      ]);

      setStats({ applied: applied ?? 0, saved: saved ?? 0 });
      setLoading(false);
    }
    load();
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Syncing Profile</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-zinc-950 selection:bg-blue-100 dark:selection:bg-blue-900/30">

      {/* High-Density Top Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-6 h-14 flex items-center">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-slate-900 dark:bg-blue-600 rounded shadow-sm">
              <Shield className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight uppercase">
              Job<span className="text-blue-600">Me</span> <span className="text-slate-400 dark:text-zinc-600 font-medium">Seeker</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {userId && <NotificationBell userId={userId} />}
            <ThemeToggle />
            <div className="h-4 w-[1px] bg-slate-200 dark:border-zinc-800" />
            <button
              onClick={handleLogout}
              className="group flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:text-rose-600 transition-colors uppercase tracking-tight"
            >
              <LogOut className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-slate-200 dark:border-zinc-900">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <Target size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Career Overview</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
              Hello, {profile?.full_name?.split(' ')[0] ?? 'Explorer'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
              Candidate ID: <span className="text-slate-900 dark:text-slate-200 font-bold tracking-tight">{profile?.email}</span>
            </p>
          </div>

          <Link
            href="/seeker/jobs"
            className="h-10 px-5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded shadow-lg shadow-slate-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
          >
            <Search className="h-4 w-4" />
            Explore Openings
          </Link>
        </div>

        {/* Profile Strength Meter */}
        <div className="mb-10">
          {profile && <ProfileStrengthMeter profile={profile} />}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {[
            { label: 'Active Applications', val: stats.applied, icon: FileText, color: 'text-emerald-600', sub: 'In review by recruiters' },
            { label: 'Saved for later', val: stats.saved, icon: BookmarkCheck, color: 'text-amber-600', sub: 'Saved opportunities' },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded shadow-sm group hover:border-blue-500/50 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-800 ${s.color}`}>
                  <s.icon size={20} strokeWidth={2.5} />
                </div>
                <Sparkles size={14} className="text-slate-200 dark:text-zinc-800" />
              </div>
              <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">{s.label}</p>
              <h3 className="text-4xl font-black text-slate-900 dark:text-white mt-1 tabular-nums tracking-tighter">{s.val}</h3>
              <p className="text-[10px] text-slate-400 dark:text-zinc-600 mt-2 font-medium uppercase tracking-wider">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Action Registry */}
        <div className="space-y-4">
          <h2 className="text-[11px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-[0.25em] px-1">
            System Shortcuts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Search Registry', sub: 'Find new listings', icon: Search, href: '/seeker/jobs', activeColor: 'hover:border-blue-500 hover:bg-blue-50/30' },
              { label: 'Submission Log', sub: 'Track your history', icon: Briefcase, href: '/seeker/applications', activeColor: 'hover:border-emerald-500 hover:bg-emerald-50/30' },
              { label: 'Saved Archive', sub: 'Review bookmarks', icon: BookmarkCheck, href: '/seeker/saved', activeColor: 'hover:border-amber-500 hover:bg-amber-50/30' },
              { label: 'Messages', sub: 'Inbox & notifications', icon: MessageSquare, href: '/seeker/messages', activeColor: 'hover:border-purple-500 hover:bg-purple-50/30' },
            ].map((action, idx) => (
              <Link
                key={idx}
                href={action.href}
                className={`group flex flex-col p-5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded hover:shadow-md transition-all ${action.activeColor}`}
              >
                <div className="h-10 w-10 flex items-center justify-center bg-slate-50 dark:bg-zinc-800 rounded border border-slate-200 dark:border-zinc-800 group-hover:scale-110 transition-transform mb-4">
                  <action.icon className="h-5 w-5 text-slate-500 dark:text-zinc-400" />
                </div>
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">{action.label}</p>
                    <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">{action.sub}</p>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}