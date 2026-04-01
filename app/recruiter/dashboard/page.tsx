'use client';

// app/recruiter/dashboard/page.tsx
import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  Users,
  PlusCircle,
  FileText,
  Shield,
  LogOut,
  Building2,
} from 'lucide-react';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

interface Profile {
  full_name: string | null;
  email: string;
  role: string;
}

interface Stats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
}

export default function RecruiterDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats]     = useState<Stats>({ totalJobs: 0, activeJobs: 0, totalApplications: 0 });
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

      if (prof?.role !== 'recruiter') { router.push('/auth/login'); return; }
      setProfile(prof);

      // Fetch stats
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, status')
        .eq('recruiter_id', user.id);

      const jobIds = jobs?.map((j) => j.id) ?? [];
      const activeJobs = jobs?.filter((j) => j.status === 'approved').length ?? 0;

      let totalApplications = 0;
      if (jobIds.length > 0) {
        const { count } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .in('job_id', jobIds);
        totalApplications = count ?? 0;
      }

      setStats({
        totalJobs: jobs?.length ?? 0,
        activeJobs,
        totalApplications,
      });
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
              <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                Welcome, {profile?.full_name ?? 'Recruiter'}! 👋
              </h1>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">
                {profile?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg">
                <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">Total Jobs</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalJobs}</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Posted jobs</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg">
                <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">Active Jobs</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activeJobs}</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Approved & live</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/40 rounded-lg">
                <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-slate-500 dark:text-zinc-400">Applicants</span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalApplications}</p>
            <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Total applications</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-widest mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/recruiter/jobs/new"
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all group"
            >
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl w-fit mb-3 group-hover:bg-blue-100 transition-colors">
                <PlusCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Post a Job</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Create a new job listing</p>
            </Link>

            <Link
              href="/recruiter/jobs"
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-sm transition-all group"
            >
              <div className="p-2.5 bg-purple-50 dark:bg-purple-950/40 rounded-xl w-fit mb-3 group-hover:bg-purple-100 transition-colors">
                <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">My Jobs</p>
              <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">Manage your job listings</p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}