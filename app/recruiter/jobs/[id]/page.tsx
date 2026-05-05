'use client';

// app/recruiter/jobs/[id]/page.tsx

import { useEffect, useState, useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Shield, ArrowLeft, User, CheckCircle,
  XCircle, Star, Mail, Calendar,
  FileText, ExternalLink, Hash, ChevronRight, CalendarClock
} from 'lucide-react';
import { updateApplicationStatus } from '@/features/jobs/actions';
import { ScheduleInterviewForm } from '@/components/recruiter/ScheduleInterviewForm';

interface Applicant {
  id: string;
  status: 'applied' | 'shortlisted' | 'rejected' | 'accepted';
  created_at: string;
  cover_letter: string | null;
  seeker_id: string; // Add this
  profiles: {
    full_name: string | null;
    email: string;
    phone?: string | null;
    bio?: string | null;
    skills?: string[] | null;
    experience?: string | null;
    education?: string | null;
    resume_url?: string | null;
  };
}

interface Job {
  title: string;
  company_name: string;
}

function StatusBadge({ status }: { status: Applicant['status'] }) {
  const map = {
    applied:     { label: 'Pending Review', class: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50' },
    shortlisted: { label: 'Shortlisted',    class: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50' },
    accepted:    { label: 'Accepted',       class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50' },
    rejected:    { label: 'Rejected',       class: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50' },
  };
  const { label, class: cls } = map[status];
  return (
    <span className={`px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border ${cls}`}>
      {label}
    </span>
  );
}

export default function ViewApplicantsPage() {
  const router = useRouter();
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedulingAppId, setSchedulingAppId] = useState<string | null>(null);
  const [recruiterId, setRecruiterId] = useState<string>('');

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }
      setRecruiterId(user.id);

      const { data: jobData } = await supabase
        .from('jobs')
        .select('title, company_name')
        .eq('id', id)
        .eq('recruiter_id', user.id)
        .single();

      if (!jobData) { router.push('/recruiter/jobs'); return; }
      setJob(jobData);

      const { data: appData } = await supabase
        .from('applications')
        .select(`
          id, status, created_at, cover_letter, seeker_id,
          profiles ( full_name, email, phone, bio, skills, experience, education, resume_url )
        `)
        .eq('job_id', id)
        .order('created_at', { ascending: false });

      setApplicants((appData as unknown as Applicant[]) ?? []);
      setLoading(false);
    }
    load();
  }, [id, router, supabase]);

  async function updateStatus(appId: string, newStatus: Applicant['status']) {
    if (!job) return;
    
    // Call server action to update DB and insert notification
    const res = await updateApplicationStatus(appId, newStatus, job.title, job.company_name);
    
    if (res.success) {
      // Optimistically update local state
      setApplicants(applicants.map((a) =>
        a.id === appId ? { ...a, status: newStatus } : a
      ));
    } else {
      console.error("Failed to update status:", res.error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd] dark:bg-zinc-950 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
        Accessing Personnel Files...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/recruiter/jobs"
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Registry
            </Link>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-zinc-800" />
            <div className="flex items-center gap-2">
              <div className="p-1 bg-slate-900 dark:bg-blue-600 rounded-sm">
                <Shield className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-black text-sm tracking-tighter uppercase">
                Job<span className="text-blue-600">Me</span> <span className="text-slate-400 font-medium">Recruiter</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Job Info Header */}
        <div className="mb-10 pb-8 border-b border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-600">
              <Hash size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Application Feed</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
              {job?.title}
            </h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-tight italic">
              Record ID: <span className="text-slate-400">#{(id as string).slice(0, 8)}</span> — {job?.company_name}
            </p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-sm shadow-sm flex gap-8">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Submissions</p>
              <p className="text-2xl font-black tabular-nums leading-none">{applicants.length}</p>
            </div>
            <div className="w-[1px] bg-slate-100 dark:bg-zinc-800" />
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Action</p>
              <p className="text-2xl font-black tabular-nums leading-none text-blue-600">
                {applicants.filter(a => a.status === 'applied').length}
              </p>
            </div>
          </div>
        </div>

        {applicants.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-sm border border-slate-200 dark:border-zinc-800 p-20 text-center">
            <User className="h-10 w-10 text-slate-200 dark:text-zinc-800 mx-auto mb-4" />
            <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Awaiting Submissions</h2>
            <p className="text-xs text-slate-400 mt-2 uppercase tracking-wide">No personnel files have been uploaded for this position yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {applicants.map((app) => (
              <div
                key={app.id}
                className="bg-white dark:bg-zinc-900 rounded-sm border border-slate-200 dark:border-zinc-800 p-6 flex flex-col md:flex-row gap-6 transition-all hover:border-blue-500/30 group"
              >
                {/* Applicant Bio */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-slate-100 dark:bg-zinc-800 rounded-sm flex items-center justify-center border border-slate-200 dark:border-zinc-700 shrink-0">
                      <User className="h-6 w-6 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg leading-none">
                            {app.profiles.full_name ?? 'Anonymous_User'}
                          </h3>
                          <StatusBadge status={app.status} />
                        </div>
                        {app.profiles.resume_url && (
                          <a
                            href={app.profiles.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-sm transition-colors"
                          >
                            View Resume <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-tight mt-2">
                        <span className="flex items-center gap-1.5"><Mail size={12} className="text-blue-500"/> {app.profiles.email}</span>
                        {app.profiles.phone && (
                          <span className="flex items-center gap-1.5">📞 {app.profiles.phone}</span>
                        )}
                        <span className="flex items-center gap-1.5"><Calendar size={12}/> {new Date(app.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {app.profiles.bio && (
                    <p className="text-sm text-slate-600 dark:text-zinc-400 font-medium">
                      {app.profiles.bio}
                    </p>
                  )}

                  {(app.profiles.experience || app.profiles.education) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {app.profiles.experience && (
                        <div className="bg-slate-50 dark:bg-zinc-950/50 p-3 rounded-sm border border-slate-100 dark:border-zinc-800">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Experience</p>
                          <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium">{app.profiles.experience}</p>
                        </div>
                      )}
                      {app.profiles.education && (
                        <div className="bg-slate-50 dark:bg-zinc-950/50 p-3 rounded-sm border border-slate-100 dark:border-zinc-800">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Education</p>
                          <p className="text-xs text-slate-700 dark:text-zinc-300 font-medium">{app.profiles.education}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {app.profiles.skills && app.profiles.skills.length > 0 && (
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {app.profiles.skills.map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider rounded-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {app.cover_letter && (
                    <div className="bg-slate-50 dark:bg-zinc-950 border-l-2 border-blue-600 p-4 rounded-sm mt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={10} className="text-blue-600" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Statement of Intent</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-medium">
                        {app.cover_letter}
                      </p>
                    </div>
                  )}
                </div>

                {/* Status Command Center */}
                <div className="md:w-48 border-t md:border-t-0 md:border-l border-slate-100 dark:border-zinc-800 pt-6 md:pt-0 md:pl-6 flex flex-col gap-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Update Status</p>
                  
                  <button
                    onClick={() => setSchedulingAppId(app.id)}
                    className="flex items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-widest border border-blue-500/30 text-blue-600 bg-blue-500/10 hover:bg-blue-600 hover:text-white transition-all mb-2 shadow-sm shadow-blue-500/20"
                  >
                    Schedule <CalendarClock size={12} />
                  </button>

                  <button
                    onClick={() => updateStatus(app.id, 'shortlisted')}
                    disabled={app.status === 'shortlisted'}
                    className={`flex items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
                      app.status === 'shortlisted' 
                      ? 'bg-amber-500/10 border-amber-500/50 text-amber-600' 
                      : 'border-slate-200 dark:border-zinc-800 text-slate-400 hover:border-amber-500/50 hover:text-amber-600'
                    }`}
                  >
                    Shortlist <Star size={12} fill={app.status === 'shortlisted' ? 'currentColor' : 'none'} />
                  </button>

                  <button
                    onClick={() => updateStatus(app.id, 'accepted')}
                    disabled={app.status === 'accepted'}
                    className={`flex items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
                      app.status === 'accepted' 
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-600' 
                      : 'border-slate-200 dark:border-zinc-800 text-slate-400 hover:border-emerald-500/50 hover:text-emerald-600'
                    }`}
                  >
                    Accept <CheckCircle size={12} />
                  </button>

                  <button
                    onClick={() => updateStatus(app.id, 'rejected')}
                    disabled={app.status === 'rejected'}
                    className={`flex items-center justify-between px-3 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${
                      app.status === 'rejected' 
                      ? 'bg-rose-500/10 border-rose-500/50 text-rose-600' 
                      : 'border-slate-200 dark:border-zinc-800 text-slate-400 hover:border-rose-500/50 hover:text-rose-600'
                    }`}
                  >
                    Reject <XCircle size={12} />
                  </button>
                </div>
                
                {/* Inline Scheduling Form */}
                {schedulingAppId === app.id && job && (
                  <ScheduleInterviewForm
                    appId={app.id}
                    seekerId={app.seeker_id}
                    jobTitle={job.title}
                    companyName={job.company_name}
                    recruiterId={recruiterId}
                    onCancel={() => setSchedulingAppId(null)}
                    onSuccess={() => {
                      setSchedulingAppId(null);
                      setApplicants(applicants.map(a => a.id === app.id ? { ...a, status: 'shortlisted' } : a));
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Security Footer */}
      <footer className="max-w-5xl mx-auto px-6 py-12 opacity-20 flex justify-between items-center">
        <div className="flex gap-4">
          <span className="text-[8px] font-mono uppercase tracking-[0.3em]">Secure_Link: Verified</span>
          <span className="text-[8px] font-mono uppercase tracking-[0.3em]">Data_Encryption: AES-256</span>
        </div>
        <div className="flex items-center gap-1 text-[8px] font-mono">
          <span className="animate-pulse h-1 w-1 bg-emerald-500 rounded-full" />
          SYSTEM_STABLE
        </div>
      </footer>
    </div>
  );
}