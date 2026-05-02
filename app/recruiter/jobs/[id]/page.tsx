'use client';

// app/recruiter/jobs/[id]/page.tsx

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, ArrowLeft, User, CheckCircle,
  XCircle, Star, AlertCircle, Mail, Calendar,
} from 'lucide-react';

interface Applicant {
  id: string;
  status: 'applied' | 'shortlisted' | 'rejected' | 'accepted';
  created_at: string;
  cover_letter: string | null;
  profiles: {
    full_name: string | null;
    email: string;
  };
}

interface Job {
  title: string;
  company_name: string;
}

function StatusBadge({ status }: { status: Applicant['status'] }) {
  const map = {
    applied:     { label: 'Applied',     class: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 border-blue-200' },
    shortlisted: { label: 'Shortlisted', class: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 border-amber-200' },
    accepted:    { label: 'Accepted',    class: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 border-emerald-200' },
    rejected:    { label: 'Rejected',    class: 'bg-red-50 dark:bg-red-950/30 text-red-600 border-red-200' },
  };
  const { label, class: cls } = map[status];
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
}

export default function ViewApplicantsPage() {
  const router     = useRouter();
  const { id }     = useParams();
  const [job, setJob]               = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading]       = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      // Fetch job
      const { data: jobData } = await supabase
        .from('jobs')
        .select('title, company_name')
        .eq('id', id)
        .eq('recruiter_id', user.id)
        .single();

      if (!jobData) { router.push('/recruiter/jobs'); return; }
      setJob(jobData);

      // Fetch applicants
      const { data: appData } = await supabase
        .from('applications')
        .select(`
          id, status, created_at, cover_letter,
          profiles ( full_name, email )
        `)
        .eq('job_id', id)
        .order('created_at', { ascending: false });

      setApplicants((appData as unknown as Applicant[]) ?? []);
      setLoading(false);
    }
    load();
  }, [id]);

  async function updateStatus(appId: string, newStatus: Applicant['status']) {
    await supabase
      .from('applications')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', appId);

    setApplicants(applicants.map((a) =>
      a.id === appId ? { ...a, status: newStatus } : a
    ));
  }

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
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            href="/recruiter/jobs"
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

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Applicants
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
            {job?.title} — {job?.company_name} · {applicants.length} applicant{applicants.length !== 1 ? 's' : ''}
          </p>
        </div>

        {applicants.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-12 text-center">
            <User className="h-8 w-8 text-slate-300 dark:text-zinc-600 mx-auto mb-3" />
            <p className="font-medium text-slate-900 dark:text-white">No applicants yet</p>
            <p className="text-sm text-slate-400 mt-1">Share your job to get more visibility</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applicants.map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className="p-2.5 bg-slate-100 dark:bg-zinc-800 rounded-xl shrink-0">
                      <User className="h-5 w-5 text-slate-500 dark:text-zinc-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap mb-1">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {app.profiles.full_name ?? 'Unknown'}
                        </p>
                        <StatusBadge status={app.status} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-zinc-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {app.profiles.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {app.cover_letter && (
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 line-clamp-2 bg-slate-50 dark:bg-zinc-800 px-3 py-2 rounded-lg">
                          {app.cover_letter}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateStatus(app.id, 'shortlisted')}
                      disabled={app.status === 'shortlisted'}
                      title="Shortlist"
                      className={`p-2 rounded-lg transition-colors ${
                        app.status === 'shortlisted'
                          ? 'bg-amber-50 text-amber-500 dark:bg-amber-950/30'
                          : 'text-slate-400 hover:bg-amber-50 hover:text-amber-500 dark:hover:bg-amber-950/30'
                      }`}
                    >
                      <Star className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, 'accepted')}
                      disabled={app.status === 'accepted'}
                      title="Accept"
                      className={`p-2 rounded-lg transition-colors ${
                        app.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-950/30'
                          : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 dark:hover:bg-emerald-950/30'
                      }`}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => updateStatus(app.id, 'rejected')}
                      disabled={app.status === 'rejected'}
                      title="Reject"
                      className={`p-2 rounded-lg transition-colors ${
                        app.status === 'rejected'
                          ? 'bg-red-50 text-red-500 dark:bg-red-950/30'
                          : 'text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30'
                      }`}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
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