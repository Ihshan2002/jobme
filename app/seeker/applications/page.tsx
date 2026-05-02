'use client';

// app/seeker/applications/page.tsx
import { useMemo, useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, ArrowLeft, Briefcase, MapPin,
  Clock, CheckCircle, XCircle, AlertCircle, Star,
  Search, History, ExternalLink
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
    applied:     { icon: AlertCircle, label: 'Applied',     class: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border-blue-100/50 dark:border-blue-800/50' },
    shortlisted: { icon: Star,        label: 'Shortlisted', class: 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 border-amber-100/50 dark:border-amber-800/50' },
    accepted:    { icon: CheckCircle, label: 'Accepted',    class: 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-800/50' },
    rejected:    { icon: XCircle,     label: 'Rejected',    class: 'bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 border-rose-100/50 dark:border-rose-800/50' },
  };
  const { icon: Icon, label, class: cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${cls}`}>
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
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd] dark:bg-zinc-950">
        <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-zinc-950">

      {/* Slim Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 px-6 h-14 flex items-center">
        <div className="max-w-4xl mx-auto w-full flex items-center gap-4">
          <button
            onClick={() => router.push('/seeker/dashboard')}
            className="p-1.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-800 mx-1" />
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-blue-600" />
            <span className="font-bold text-xs uppercase tracking-widest text-slate-900 dark:text-white">
              Submission <span className="text-blue-600">History</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              My Applications
            </h1>
            <p className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
              Registry Count: {applications.length} Record{applications.length !== 1 ? 's' : ''}
            </p>
          </div>
          {applications.length > 0 && (
            <Link
              href="/seeker/jobs"
              className="hidden sm:flex items-center gap-2 text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline"
            >
              New Submission <ExternalLink size={12} />
            </Link>
          )}
        </div>

        {applications.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded border border-dashed border-slate-300 dark:border-zinc-800 p-16 text-center shadow-sm">
            <Briefcase className="h-10 w-10 text-slate-200 dark:text-zinc-700 mx-auto mb-4" />
            <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-[0.2em]">No active records found</p>
            <Link
              href="/seeker/jobs"
              className="inline-flex items-center gap-2 mt-6 px-6 py-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 dark:shadow-none"
            >
              <Search size={14} /> Browse Opportunities
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="group bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-5 rounded hover:border-blue-500/50 transition-all shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-slate-900 dark:text-white text-[15px] tracking-tight group-hover:text-blue-600 transition-colors">
                        {app.jobs?.[0]?.title}
                      </h3>
                      <StatusBadge status={app.status} />
                    </div>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-slate-500 dark:text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <Briefcase size={13} className="text-slate-400" />
                        <span className="text-[12px] font-bold tracking-tight uppercase">{app.jobs?.[0]?.company_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-slate-400" />
                        <span className="text-[12px] font-medium">{app.jobs?.[0]?.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={13} className="text-slate-400" />
                        <span className="text-[12px] font-medium capitalize">{app.jobs?.[0]?.job_type}</span>
                      </div>
                    </div>

                    {app.cover_letter && (
                      <div className="mt-4 p-3 bg-slate-50 dark:bg-zinc-950 rounded border border-slate-100 dark:border-zinc-800">
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2 italic leading-relaxed">
                          "{app.cover_letter}"
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="md:text-right flex md:flex-col justify-between items-center md:items-end gap-2 shrink-0">
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest">Submitted On</p>
                       <p className="text-[13px] font-bold text-slate-700 dark:text-zinc-300 tabular-nums">
                        {new Date(app.created_at).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    
                    <Link
                      href={`/seeker/jobs/${app.jobs?.[0]?.id}`}
                      className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      title="View Job Details"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}