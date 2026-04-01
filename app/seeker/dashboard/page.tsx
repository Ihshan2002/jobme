'use client';

// app/seeker/dashboard/page.tsx

import { useMemo } from 'react';
import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

interface Profile {
  full_name: string | null;
  email: string;
  role: string;
}

interface Stats {
  applied: number;
  saved: number;
}

export default function SeekerDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
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

      // Fetch profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name, email, role')
        .eq('id', user.id)
        .single();

      if (prof?.role !== 'seeker') { router.push('/auth/login'); return; }
      setProfile(prof);

      // Fetch stats
      const [{ count: applied }, { count: saved }] = await Promise.all([
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('seeker_id', user.id),
        supabase.from('saved_jobs').select('*', { count: 'exact', head: true }).eq('seeker_id', user.id),
      ]);

      setStats({ applied: applied ?? 0, saved: saved ?? 0 });
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="text-slate-400 dark:text-zinc-500 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">

      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-md">
              <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              Job<span className="text-blue-600">Me</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">

        {/* Welcome */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                Welcome back, {profile?.full_name ?? 'Job Seeker'}! 👋
              </h1>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                {profile?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                Applications
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.applied}</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Jobs applied</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/40 rounded-lg">
                <BookmarkCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">
                Saved Jobs
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.saved}</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Bookmarked</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/seeker/jobs"
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all group"
            >
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl w-fit mb-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-950/60 transition-colors">
                <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Browse Jobs</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Find your next opportunity</p>
            </Link>

            <Link
              href="/seeker/applications"
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-sm transition-all group"
            >
              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl w-fit mb-3 group-hover:bg-emerald-100 transition-colors">
                <Briefcase className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">My Applications</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Track your applications</p>
            </Link>

            <Link
              href="/seeker/saved"
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 hover:border-amber-300 dark:hover:border-amber-700 hover:shadow-sm transition-all group"
            >
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl w-fit mb-3 group-hover:bg-amber-100 transition-colors">
                <BookmarkCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Saved Jobs</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Your bookmarked jobs</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}