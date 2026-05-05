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
  ChevronRight,
  TrendingUp,
  LayoutGrid
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

      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name, email, role')
        .eq('id', user.id)
        .single();

      if (prof?.role !== 'recruiter') { router.push('/auth/login'); return; }
      setProfile(prof);

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
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/auth/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-slate-500 dark:text-zinc-500 text-[11px] font-bold uppercase tracking-widest">Initializing Session</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-zinc-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900/30">

      {/* Enterprise Top Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-6 h-14 flex items-center">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-slate-900 dark:bg-blue-600 rounded shadow-sm">
                <Shield className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight uppercase">
                Job<span className="text-blue-600">Me</span> <span className="text-slate-400 dark:text-zinc-600 font-medium">Recruiter</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-4 w-[1px] bg-slate-200 dark:border-zinc-800" />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-[11px] font-bold text-slate-500 dark:text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors uppercase tracking-tight"
            >
              <LogOut className="h-3.5 w-3.5" />
              Terminate
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Dynamic Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-8 border-b border-slate-200 dark:border-zinc-900">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
              <LayoutGrid size={14} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Recruiter Console</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tighter">
              Welcome, {profile?.full_name?.split(' ')[0] ?? 'Operator'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium mt-1">
              Platform status: <span className="text-emerald-600 dark:text-emerald-500">Operational</span> • {profile?.email}
            </p>
          </div>

          <Link
            href="/recruiter/jobs/new"
            className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 text-xs font-bold uppercase tracking-wide"
          >
            <PlusCircle className="h-4 w-4" />
            Create Posting
          </Link>
        </div>

        {/* Stats Registry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            { label: 'Platform Listings', val: stats.totalJobs, icon: Briefcase, color: 'text-slate-600', sub: 'Total History' },
            { label: 'Active Pipeline', val: stats.activeJobs, icon: TrendingUp, color: 'text-emerald-600', sub: 'Live & Approved' },
            { label: 'Talent Pool', val: stats.totalApplications, icon: Users, color: 'text-blue-600', sub: 'New Submissions' },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded-lg shadow-sm group hover:border-blue-500/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-800 ${s.color}`}>
                  <s.icon size={18} />
                </div>
                <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-widest">Metric-0{i+1}</div>
              </div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-wider">{s.label}</p>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1 tabular-nums tracking-tight">{s.val}</h3>
              <p className="text-[10px] text-slate-400 dark:text-zinc-600 mt-2 font-medium uppercase">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Functional Shortcuts */}
        <div className="space-y-4">
          <h2 className="text-[11px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-[0.25em]">
            Registry Access
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/recruiter/jobs"
              className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-500/5 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 rounded border border-slate-200 dark:border-zinc-800 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all">
                  <Briefcase className="h-5 w-5 text-slate-600 dark:text-zinc-400 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">Active Inventory</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-medium uppercase">Modify current listings</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </Link>

            <Link
              href="/recruiter/jobs/new"
              className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-500/5 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 rounded border border-slate-200 dark:border-zinc-800 group-hover:bg-emerald-600 group-hover:border-emerald-600 transition-all">
                  <PlusCircle className="h-5 w-5 text-slate-600 dark:text-zinc-400 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">Expand Portfolio</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-medium uppercase">Initiate talent acquisition</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
            </Link>

            <Link
              href="/recruiter/referrals"
              className="group flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-md hover:border-purple-500 hover:bg-purple-50/30 dark:hover:bg-purple-500/5 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 flex items-center justify-center bg-slate-100 dark:bg-zinc-800 rounded border border-slate-200 dark:border-zinc-800 group-hover:bg-purple-600 group-hover:border-purple-600 transition-all">
                  <FileText className="h-5 w-5 text-slate-600 dark:text-zinc-400 group-hover:text-white" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">Referrals Inbox</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500 font-medium uppercase">Review routed candidates</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-purple-500 transition-colors" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}