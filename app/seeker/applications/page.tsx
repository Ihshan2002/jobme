'use client';

// app/seeker/applications/page.tsx
import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, ArrowLeft, Briefcase, MapPin,
  Clock, CheckCircle, XCircle, AlertCircle, Star,
} from 'lucide-react';

interface Application {
  id: string;
  status: 'applied' | 'shortlisted' | 'rejected' | 'accepted';
  created_at: string;
  cover_letter: string | null;
  jobs: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    job_type: string;
  }[] | null;
}

function StatusBadge({ status }: { status: Application['status'] }) {
  const map = {
    applied:     { icon: AlertCircle, label: 'Applied',     class: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
    shortlisted: { icon: Star,        label: 'Shortlisted', class: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    accepted:    { icon: CheckCircle, label: 'Accepted',    class: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    rejected:    { icon: XCircle,     label: 'Rejected',    class: 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' },
  };
  const { icon: Icon, label, class: cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export default function MyApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

const supabase = useMemo(() => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
), []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data } = await supabase
        .from('applications')
        .select(`
          id, status, created_at, cover_letter,
          jobs ( id, title, company_name, location, job_type )
        `)
        .eq('seeker_id', user.id)
        .order('created_at', { ascending: false });

      setApplications((data as unknown as Application[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">

      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link
            href="/seeker/dashboard"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600 rounded-md">
              <Shield className="h-4 w-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              Job<span className="text-blue-600">Me</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            My Applications
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {applications.length} application{applications.length !== 1 ? 's' : ''}
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-12 text-center">
            <Briefcase className="h-8 w-8 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
            <p className="font-medium text-slate-900 dark:text-white">No applications yet</p>
            <p className="text-sm text-slate-400 mt-1">Start applying to jobs!</p>
            <Link
              href="/seeker/jobs"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {app.jobs?.[0]?.title}
                      </h3>
                      <StatusBadge status={app.status} />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-zinc-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {app.jobs?.[0]?.company_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {app.jobs?.[0]?.location}
                      </span>
                      <span className="flex items-center gap-1 capitalize">
                        <Clock className="h-3.5 w-3.5" />
                        {app.jobs?.[0]?.job_type}
                      </span>
                    </div>
                    {app.cover_letter && (
                      <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2 line-clamp-2">
                        {app.cover_letter}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-zinc-500 shrink-0">
                    {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}