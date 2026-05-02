"use client";

// app/recruiter/jobs/page.tsx

import { useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  PlusCircle,
  Briefcase,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Calendar,
  Layers,
  ChevronRight
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  company_name: string;
  location: string;
  job_type: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  skills: string[];
}

function StatusBadge({ status }: { status: Job["status"] }) {
  const map = {
    pending: {
      icon: AlertCircle,
      label: "Pending Review",
      class: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50",
    },
    approved: {
      icon: CheckCircle,
      label: "Active / Approved",
      class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50",
    },
    rejected: {
      icon: XCircle,
      label: "Rejected",
      class: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50",
    },
  };
  const { icon: Icon, label, class: cls } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[10px] font-black uppercase tracking-wider border ${cls}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export default function RecruiterJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data } = await supabase
        .from("jobs")
        .select("id, title, company_name, location, job_type, status, created_at, skills")
        .eq("recruiter_id", user.id)
        .order("created_at", { ascending: false });

      setJobs(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(jobId: string) {
    if (!confirm("Confirm Deletion: This record will be permanently removed from the registry.")) return;
    await supabase.from("jobs").delete().eq("id", jobId);
    setJobs(jobs.filter((j) => j.id !== jobId));
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfd] dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Syncing Registry...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
      
      {/* Registry Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/recruiter/dashboard"
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Back to Terminal
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
          <Link
            href="/recruiter/jobs/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-[11px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
          >
            <PlusCircle className="h-3.5 w-3.5" /> Post New Record
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-slate-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Layers size={14} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Position Management</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Active Job Registry
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Database Content</p>
            <p className="text-xl font-bold tabular-nums text-blue-600">{jobs.length} <span className="text-xs text-slate-500 font-medium uppercase tracking-normal">Records</span></p>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-sm border border-slate-200 dark:border-zinc-800 p-16 text-center shadow-sm">
            <div className="p-4 bg-slate-50 dark:bg-zinc-950 rounded border border-slate-100 dark:border-zinc-800 w-fit mx-auto mb-6">
              <Briefcase className="h-8 w-8 text-slate-300 dark:text-zinc-700" />
            </div>
            <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg">No Active Entries</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-2 uppercase tracking-wide max-w-xs mx-auto leading-relaxed">
              The registry is currently empty. Initiate a new position record to start receiving talent submissions.
            </p>
            <Link
              href="/recruiter/jobs/new"
              className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-sm text-xs font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all"
            >
              Post First Job
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="group bg-white dark:bg-zinc-900 rounded-sm border border-slate-200 dark:border-zinc-800 p-6 hover:border-blue-500/50 transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tight">
                      {job.title}
                    </h3>
                    <StatusBadge status={job.status} />
                  </div>
                  
                  <div className="flex flex-wrap gap-y-2 gap-x-6">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-tight">
                      <Briefcase size={12} className="text-blue-500" />
                      {job.company_name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-tight">
                      <MapPin size={12} className="text-slate-400" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-tight">
                      <Clock size={12} className="text-slate-400" />
                      {job.job_type}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 dark:text-zinc-600 uppercase tracking-tight tabular-nums">
                      <Calendar size={12} />
                      {new Date(job.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </div>
                  </div>

                  {job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.skills.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-500 text-[9px] font-black uppercase tracking-tighter rounded-sm"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="text-[9px] font-bold text-slate-400 self-center">+ {job.skills.length - 4} More</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-zinc-800">
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="p-2.5 rounded border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-200 transition-all"
                    title="Delete Record"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/recruiter/jobs/${job.id}`}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-zinc-800 hover:bg-blue-600 text-white rounded-sm text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Applicants <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer Meta */}
      <footer className="max-w-5xl mx-auto px-6 py-12 opacity-30">
        <div className="h-[1px] w-full bg-slate-200 dark:bg-zinc-800 mb-4" />
        <p className="text-[9px] font-mono text-center tracking-[0.2em]">RECRUITER_SESSION_ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
      </footer>
    </div>
  );
}